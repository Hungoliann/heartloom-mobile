import express from "express";
import { serve } from "inngest/express";
import { Inngest } from "inngest";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Re-create the Inngest client (server-side only, no EXPO_PUBLIC_ prefix)
const inngest = new Inngest({
  id: "heartloom",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// Re-create Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Health check — also surfaces pending letter count for debugging
app.get("/", (_req, res) => res.json({ status: "ok", service: "heartloom-server" }));

app.get("/health", async (_req, res) => {
  try {
    const nowIso = new Date().toISOString();
    const { count, error } = await supabase
      .from("letters")
      .select("id", { count: "exact", head: true })
      .lte("deliver_at", nowIso)
      .is("delivered_at", null);
    if (error) {
      return res.status(500).json({ status: "error", error: error.message });
    }
    return res.json({ status: "ok", pendingLetters: count ?? 0, now: nowIso });
  } catch (e: any) {
    return res.status(500).json({ status: "error", error: e?.message ?? String(e) });
  }
});

// Fatal push errors — when these come back from Expo we should NOT mark the
// letter as delivered, because the token is unusable and resending later may
// succeed once the user re-registers.
const FATAL_PUSH_ERRORS = new Set([
  "DeviceNotRegistered",
  "InvalidCredentials",
]);

async function resolvePushToken(userId: string): Promise<string | null> {
  // 1) Prefer profiles.push_token (works with anon-safe RLS bypass via service role,
  //    no auth.admin API required).
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("push_token")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) {
    console.warn(`[deliver-letters] profiles lookup failed for user=${userId}:`, profileErr.message);
  }
  if (profile?.push_token) {
    return profile.push_token as string;
  }

  // 2) Fall back to auth.users.user_metadata.push_token via admin API.
  try {
    const { data: userData, error: adminErr } = await supabase.auth.admin.getUserById(userId);
    if (adminErr) {
      console.warn(`[deliver-letters] auth.admin.getUserById failed for user=${userId}:`, adminErr.message);
      return null;
    }
    const fallback = (userData?.user?.user_metadata as any)?.push_token;
    return typeof fallback === "string" && fallback.length > 0 ? fallback : null;
  } catch (e: any) {
    console.warn(`[deliver-letters] auth.admin.getUserById threw for user=${userId}:`, e?.message ?? e);
    return null;
  }
}

// Deliver letters function (inline to avoid circular imports from the Expo module).
// Cron is set to every 5 minutes during early testing so letters fire promptly.
// Tighten later (e.g. "0 * * * *" hourly) once delivery is verified in production.
const deliverLetters = inngest.createFunction(
  { id: "deliver-letters", name: "Deliver Due Letters" },
  { cron: "*/5 * * * *" },
  async ({ step }: { step: any }) => {
    const dueLetters = await step.run("fetch-due-letters", async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("letters")
        .select("id, title, recipient_name, author_id")
        .lte("deliver_at", now)
        .is("delivered_at", null);
      if (error) {
        console.error("[deliver-letters] fetch error:", error.message);
        return [];
      }
      console.log(`[deliver-letters] fetched ${data?.length ?? 0} due letters`);
      return data ?? [];
    });

    if (!dueLetters || dueLetters.length === 0) {
      return { delivered: 0, ids: [] };
    }

    const results = await step.run("deliver-and-notify", async () => {
      const deliveredIds: string[] = [];

      for (const letter of dueLetters) {
        const pushToken = await resolvePushToken(letter.author_id);

        let fatalPushFailure = false;

        if (!pushToken) {
          console.log(`[deliver-letters] no push token for user ${letter.author_id} — skipped notification (letter=${letter.id})`);
        } else {
          try {
            const resp = await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: pushToken,
                title: "A letter has been delivered",
                body: `Your letter "${letter.title}"${letter.recipient_name ? ` for ${letter.recipient_name}` : ""} is now open.`,
                data: { letterId: letter.id },
                sound: "default",
              }),
            });

            if (!resp.ok) {
              const text = await resp.text().catch(() => "");
              console.warn(`[deliver-letters] push send non-200 for letter=${letter.id} status=${resp.status} body=${text}`);
            } else {
              const json: any = await resp.json().catch(() => null);
              console.log(`[deliver-letters] push send response letter=${letter.id}:`, JSON.stringify(json));
              // Expo returns 200 even on per-ticket errors. Inspect tickets.
              const tickets = Array.isArray(json?.data) ? json.data : json?.data ? [json.data] : [];
              for (const t of tickets) {
                if (t?.status === "error") {
                  const errCode = t?.details?.error ?? t?.message ?? "unknown";
                  console.warn(`[deliver-letters] push ticket error letter=${letter.id} code=${errCode} message=${t?.message}`);
                  if (typeof errCode === "string" && FATAL_PUSH_ERRORS.has(errCode)) {
                    fatalPushFailure = true;
                  }
                }
              }
            }
          } catch (e: any) {
            console.warn(`[deliver-letters] push send threw for letter=${letter.id}:`, e?.message ?? e);
          }
        }

        if (fatalPushFailure) {
          console.log(`[deliver-letters] NOT marking delivered (fatal push error) letter=${letter.id}`);
          continue;
        }

        const { error: updateErr } = await supabase
          .from("letters")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", letter.id);

        if (updateErr) {
          console.warn(`[deliver-letters] failed to mark delivered letter=${letter.id}:`, updateErr.message);
          continue;
        }
        console.log(`[deliver-letters] marked ${letter.id} delivered`);
        deliveredIds.push(letter.id);
      }

      return deliveredIds;
    });

    console.log(`[deliver-letters] run complete — delivered ${results.length}/${dueLetters.length}`);
    return { delivered: results.length, ids: results };
  }
);

// Inngest webhook handler
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: [deliverLetters] })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Heartloom server running on :${PORT}`));

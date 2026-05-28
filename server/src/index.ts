import express from "express";
import { serve } from "inngest/express";
import { Inngest } from "inngest";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// ─── Simple in-memory rate limiter (no external dependency) ─────────────────
function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Periodic cleanup to prevent memory leaks — purge expired entries every 5 min
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now > entry.resetAt) hits.delete(key);
    }
  }, 5 * 60 * 1000).unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests" });
    }
    return next();
  };
}

const webhookLimiter = createRateLimiter(60_000, 100); // 100 req / min
const healthLimiter = createRateLimiter(60_000, 30);   // 30 req / min

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
app.get("/", healthLimiter, (_req, res) => res.json({ status: "ok", service: "heartloom-server" }));

app.get("/health", healthLimiter, async (_req, res) => {
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

// Chat fan-out: triggered when a new row hits public.messages.
// Fetches recipients (everyone in the family except the author) and sends an
// Expo push notification to each. Each network call is wrapped in step.run so
// Inngest retries the steps idempotently.
const messageSent = inngest.createFunction(
  { id: "chat-message-sent", name: "Chat: Fan-out Push" },
  { event: "chat/message.sent" },
  async ({ event, step }: { event: any; step: any }) => {
    const { messageId } = event.data as { messageId: string };

    const message = await step.run("fetch-message", async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, family_id, author_id, body, media_type")
        .eq("id", messageId)
        .maybeSingle();
      if (error) {
        console.error(`[chat-message-sent] fetch message ${messageId} failed:`, error.message);
        return null;
      }
      return data;
    });

    if (!message) {
      console.warn(`[chat-message-sent] message ${messageId} not found — skipping`);
      return { delivered: 0 };
    }

    const author = await step.run("fetch-author", async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", message.author_id)
        .maybeSingle();
      if (error) {
        console.warn(`[chat-message-sent] author lookup failed for ${message.author_id}:`, error.message);
        return null;
      }
      return data;
    });

    const recipients = await step.run("fetch-recipients", async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, push_token")
        .eq("family_id", message.family_id)
        .neq("id", message.author_id)
        .not("push_token", "is", null);
      if (error) {
        console.error(`[chat-message-sent] recipients lookup failed family=${message.family_id}:`, error.message);
        return [];
      }
      return (data ?? []).filter((r: any) => typeof r.push_token === "string" && r.push_token.length > 0);
    });

    const mentionedUserIds = await step.run("fetch-mentions", async () => {
      const { data, error } = await supabase
        .from("message_mentions")
        .select("user_id")
        .eq("message_id", messageId);
      if (error) {
        console.warn(`[chat-message-sent] mentions lookup failed message=${messageId}:`, error.message);
        return [] as string[];
      }
      return (data ?? []).map((r: any) => r.user_id as string);
    });
    const mentionedIds = new Set<string>(mentionedUserIds);

    if (!recipients || recipients.length === 0) {
      console.log(`[chat-message-sent] msg=${messageId} recipients=0 mentions=${mentionedIds.size}`);
      return { delivered: 0, mentioned: 0 };
    }

    const authorName = (author?.full_name as string) || "Someone";
    const title = authorName || "New message";
    let body: string;
    if (message.media_type === "voice") {
      body = "Sent a voice message";
    } else if (message.media_type === "letter") {
      body = "Shared a letter";
    } else if (typeof message.body === "string" && message.body.trim().length > 0) {
      body = message.body.length > 140 ? `${message.body.slice(0, 137)}...` : message.body;
    } else {
      body = "Sent a message";
    }

    // Build a shorter (~80 char) preview for mention pushes.
    let mentionBody: string;
    if (message.media_type === "voice") {
      mentionBody = "Sent a voice message";
    } else if (message.media_type === "letter") {
      mentionBody = "Shared a letter";
    } else if (typeof message.body === "string" && message.body.trim().length > 0) {
      mentionBody = message.body.length > 80 ? `${message.body.slice(0, 77)}...` : message.body;
    } else {
      mentionBody = "Mentioned you in a message";
    }

    const regularTickets: any[] = [];
    const mentionTickets: any[] = [];
    for (const r of recipients) {
      if (mentionedIds.has(r.id)) {
        mentionTickets.push({
          to: r.push_token,
          title: `${authorName} mentioned you`,
          body: mentionBody,
          data: { messageId: message.id, familyId: message.family_id, mention: true },
          sound: "default",
          priority: "high",
        });
      } else {
        regularTickets.push({
          to: r.push_token,
          title,
          body,
          data: { messageId: message.id, familyId: message.family_id },
          sound: "default",
        });
      }
    }

    const deliveredRegular = await step.run("send-push-regular", async () => {
      if (regularTickets.length === 0) return 0;
      try {
        const resp = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(regularTickets),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.warn(`[chat-message-sent] regular push non-200 message=${messageId} status=${resp.status} body=${text}`);
          return 0;
        }
        const json: any = await resp.json().catch(() => null);
        console.log(`[chat-message-sent] regular push response message=${messageId}:`, JSON.stringify(json));
        return regularTickets.length;
      } catch (e: any) {
        console.warn(`[chat-message-sent] regular push threw for message=${messageId}:`, e?.message ?? e);
        return 0;
      }
    });

    const deliveredMentions = await step.run("send-push-mentions", async () => {
      if (mentionTickets.length === 0) return 0;
      try {
        const resp = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mentionTickets),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.warn(`[chat-message-sent] mention push non-200 message=${messageId} status=${resp.status} body=${text}`);
          return 0;
        }
        const json: any = await resp.json().catch(() => null);
        console.log(`[chat-message-sent] mention push response message=${messageId}:`, JSON.stringify(json));
        return mentionTickets.length;
      } catch (e: any) {
        console.warn(`[chat-message-sent] mention push threw for message=${messageId}:`, e?.message ?? e);
        return 0;
      }
    });

    console.log(`[chat-message-sent] msg=${messageId} recipients=${recipients.length} mentions=${mentionTickets.length} delivered=${deliveredRegular + deliveredMentions}`);
    return { delivered: deliveredRegular + deliveredMentions, mentioned: deliveredMentions };
  }
);

// Supabase Database Webhook receiver — fires on INSERT into public.messages.
// We don't do work here: we just hand the event to Inngest and 200 fast so the
// webhook doesn't time out or retry.
app.post("/api/inngest/messages/inserted", webhookLimiter, async (req, res) => {
  const secret = req.header("x-webhook-secret");
  if (!process.env.SUPABASE_WEBHOOK_SECRET || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    console.warn(`[chat-webhook] rejected: bad or missing x-webhook-secret`);
    return res.status(401).json({ error: "unauthorized" });
  }

  const payload = req.body;
  if (!payload || payload.type !== "INSERT" || !payload.record || !payload.record.id) {
    console.warn(`[chat-webhook] rejected: unexpected payload shape`);
    return res.status(400).json({ error: "bad payload" });
  }

  const messageId = payload.record.id as string;
  console.log(`[chat-webhook] received message ${messageId}`);

  try {
    await inngest.send({
      name: "chat/message.sent",
      data: { messageId },
    });
  } catch (e: any) {
    console.error(`[chat-webhook] inngest.send failed for message=${messageId}:`, e?.message ?? e);
    return res.status(500).json({ error: "inngest send failed" });
  }

  return res.status(200).json({ ok: true });
});

// ─── Letter audio transcription webhook ──────────────────────────────────────
app.post("/api/inngest/letters/audio-uploaded", webhookLimiter, async (req, res) => {
  const secret = req.headers["x-webhook-secret"];
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { type, record } = req.body ?? {};
  if (type !== "INSERT" || !record) {
    return res.status(200).json({ skipped: true, reason: "not an insert" });
  }

  if (!record.media_url || record.media_type !== "audio") {
    console.log(`[transcribe-webhook] letter=${record.id} skipped — no audio`);
    return res.status(200).json({ skipped: true, reason: "no audio to transcribe" });
  }

  const letterId = record.id as string;
  const mediaUrl = record.media_url as string;
  console.log(`[transcribe-webhook] received letter=${letterId} media=${mediaUrl}`);

  try {
    await inngest.send({
      name: "letter/transcribe",
      data: { letterId, mediaUrl },
    });
  } catch (e: any) {
    console.error(`[transcribe-webhook] inngest.send failed:`, e?.message ?? e);
    return res.status(500).json({ error: "inngest send failed" });
  }

  return res.status(200).json({ ok: true });
});

// ─── Inngest function: Whisper transcription ─────────────────────────────────
const transcribeLetter = inngest.createFunction(
  { id: "letter-transcribe", name: "Letter: Whisper Transcribe" },
  { event: "letter/transcribe" },
  async ({ event, step }: { event: any; step: any }) => {
    const { letterId, mediaUrl } = event.data as {
      letterId: string;
      mediaUrl: string;
    };

    // Mark as pending
    await step.run("mark-pending", async () => {
      await supabase
        .from("letters")
        .update({ transcript_status: "pending" })
        .eq("id", letterId);
      console.log(`[transcribe] letter=${letterId} status=pending`);
    });

    // Get a signed URL for the audio file
    const signedUrl: string = await step.run("get-signed-url", async () => {
      const { data, error } = await supabase.storage
        .from("voice-memos")
        .createSignedUrl(mediaUrl, 600);
      if (error) throw error;
      return data.signedUrl;
    });

    // Download the audio
    const audioBuffer: ArrayBuffer = await step.run("download-audio", async () => {
      const resp = await fetch(signedUrl);
      if (!resp.ok) throw new Error(`Audio download failed: ${resp.status}`);
      return resp.arrayBuffer();
    });

    // Call Whisper API
    const transcript: string | null = await step.run("whisper-transcribe", async () => {
      const ext = mediaUrl.split(".").pop() ?? "m4a";
      const blob = new Blob([audioBuffer], { type: `audio/${ext}` });

      const form = new FormData();
      form.append("file", blob, `audio.${ext}`);
      form.append("model", "whisper-1");

      const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: form,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`[transcribe] whisper error ${resp.status}:`, errText);
        // Mark as failed — don't throw so Inngest doesn't retry on a permanent error
        await supabase
          .from("letters")
          .update({
            transcript_status: "failed",
            transcript_error: `Whisper ${resp.status}: ${errText.slice(0, 500)}`,
          })
          .eq("id", letterId);
        return null;
      }

      const json = await resp.json();
      return json.text as string;
    });

    if (transcript === null) {
      return { letterId, status: "failed" };
    }

    // Save transcript
    await step.run("save-transcript", async () => {
      await supabase
        .from("letters")
        .update({
          transcript,
          transcript_status: "done",
        })
        .eq("id", letterId);
      console.log(
        `[transcribe] letter=${letterId} status=done length=${transcript.length}`
      );
    });

    return { letterId, status: "done", length: transcript.length };
  }
);

// Inngest webhook handler
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [deliverLetters, messageSent, transcribeLetter],
  })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Heartloom server running on :${PORT}`));

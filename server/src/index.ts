import express from "express";
import { serve } from "inngest/express";
import { Inngest } from "inngest";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => res.json({ status: "ok", service: "heartloom-server" }));

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

// Deliver letters function (inline to avoid circular imports from the Expo module)
const deliverLetters = inngest.createFunction(
  { id: "deliver-letters", name: "Deliver Due Letters" },
  { cron: "0 * * * *" },
  async ({ step }: { step: any }) => {
    const { data: dueLetters, error } = await step.run("fetch-due-letters", async () => {
      const now = new Date().toISOString();
      return supabase
        .from("letters")
        .select("id, title, recipient_name, author_id")
        .lte("deliver_at", now)
        .is("delivered_at", null);
    });

    if (error || !dueLetters) return { delivered: 0 };

    const results = await step.run("deliver-and-notify", async () => {
      const deliveredIds: string[] = [];
      for (const letter of dueLetters) {
        await supabase
          .from("letters")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", letter.id);

        const { data: userData } = await supabase.auth.admin.getUserById(letter.author_id);
        const pushToken = userData?.user?.user_metadata?.push_token;

        if (pushToken) {
          await fetch("https://exp.host/--/api/v2/push/send", {
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
        }
        deliveredIds.push(letter.id);
      }
      return deliveredIds;
    });

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

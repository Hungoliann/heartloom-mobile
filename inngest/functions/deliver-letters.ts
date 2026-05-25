import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";

// Note: these env vars are server-side only (no EXPO_PUBLIC_ prefix)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for bypassing RLS
);

export const deliverLetters = inngest.createFunction(
  {
    id: "deliver-letters",
    name: "Deliver Due Letters",
    triggers: [{ cron: "0 * * * *" }], // every hour
  },
  async ({ step }: { step: any }) => {
    // Find all letters due for delivery
    const { data: dueLetters, error } = await step.run("fetch-due-letters", async () => {
      const now = new Date().toISOString();
      return supabase
        .from("letters")
        .select("id, title, recipient_name, author_id")
        .lte("deliver_at", now)
        .is("delivered_at", null);
    });

    if (error || !dueLetters?.data) return { delivered: 0 };

    const letters = dueLetters.data;

    // Mark each letter as delivered and send push notification
    const results = await step.run("deliver-and-notify", async () => {
      const deliveredIds: string[] = [];

      for (const letter of letters) {
        // Mark delivered
        await supabase
          .from("letters")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", letter.id);

        // Get author's push token from user metadata
        const { data: userData } = await supabase.auth.admin.getUserById(letter.author_id);
        const pushToken = userData?.user?.user_metadata?.push_token;

        if (pushToken) {
          // Send Expo push notification
          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: pushToken,
              title: "A letter has been delivered",
              body: `Your letter "${letter.title}" ${letter.recipient_name ? `for ${letter.recipient_name}` : ""} is now open.`,
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

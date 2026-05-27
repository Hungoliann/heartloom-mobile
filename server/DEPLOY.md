# Deploying the Heartloom Delivery Worker

This server hosts a single Inngest function, `deliver-letters`, which runs on a
cron schedule (`*/5 * * * *` while testing) and pushes Expo notifications for
any `letters` rows whose `deliver_at` has elapsed and `delivered_at` is null.

## Option 1 (recommended): Inngest Cloud + a hosted Express endpoint

Inngest Cloud handles the scheduler. You host the Express app anywhere
publicly reachable (Render, Fly, Railway). Inngest calls `/api/inngest` on
your server.

1. Deploy this `server/` directory to your host of choice (see Option 2 for
   Render specifics). Note the public URL, e.g. `https://heartloom-server.onrender.com`.
2. Go to <https://app.inngest.com> → create an app named `heartloom`.
3. In the Inngest dashboard, open **Manage → Apps → Sync new app** and paste
   `https://<your-server>/api/inngest`. Inngest will register the
   `deliver-letters` function automatically.
4. Copy the **Event Key** and **Signing Key** from Inngest → set them on the
   server host as `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.
5. Wait one cron tick (≤5 min), then check the Inngest **Runs** tab to confirm
   the function ran.

## Option 2: Deploy the server to Render

`render.yaml` is already wired. From the repo root:

1. Push the branch to GitHub.
2. In Render, click **New → Blueprint** and point at the repo. Render reads
   `server/render.yaml`.
3. Under the service's **Environment** tab set:
   - `SUPABASE_URL` — Supabase dashboard → Project Settings → API → Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Project Settings →
     API → `service_role` secret (NOT the anon key — keep this server-only).
   - `INNGEST_EVENT_KEY` — Inngest dashboard → Manage → Event Keys.
   - `INNGEST_SIGNING_KEY` — Inngest dashboard → Manage → Signing Key.
   - `SUPABASE_WEBHOOK_SECRET` — a long random string you generate yourself
     (e.g. `openssl rand -hex 32`). The same value must be set as the
     `x-webhook-secret` header on the Supabase Database Webhook (see
     `supabase/CHAT_WEBHOOK.md`).
4. Deploy. Hit `https://<service>.onrender.com/health` and confirm it returns
   `{ status: "ok", pendingLetters: <n> }`.
5. Finish Option 1 step 3 to register the app with Inngest Cloud.

## Chat fan-out webhook (`chat-message-sent`)

A second Inngest function, `chat-message-sent`, fans out Expo push
notifications to every family member (except the author) whenever a new row
is inserted into `public.messages`. It is triggered by an event
(`chat/message.sent`) which the server emits from the
`POST /api/inngest/messages/inserted` endpoint when Supabase fires its
Database Webhook.

1. Generate the shared secret: `openssl rand -hex 32`.
2. Set it on the Render service as `SUPABASE_WEBHOOK_SECRET`.
3. Configure the Supabase Database Webhook in the dashboard to POST to
   `https://<service>.onrender.com/api/inngest/messages/inserted` with header
   `x-webhook-secret: <same value>`. Full dashboard walk-through lives in
   `supabase/CHAT_WEBHOOK.md`.
4. **After redeploying**, re-sync the app in Inngest (Manage → Apps → Sync) so
   the new `chat-message-sent` function shows up next to `deliver-letters`.

## Local testing

In two terminals:

```bash
# Terminal A — start the Express server
cd server
npm run dev

# Terminal B — start the Inngest dev runner pointed at the local server
npx inngest-cli@latest dev -u http://localhost:3001/api/inngest
```

Open <http://localhost:8288> for the Inngest dev UI. Insert a letter row with
`deliver_at` set to a past timestamp and `delivered_at = null`, then wait for
the next 5-min tick or trigger manually (see below).

## Manually triggering a run

From the Inngest dashboard (cloud or dev UI):

1. Open **Functions → Deliver Due Letters**.
2. Click **Invoke** (or **Run now**). The cron schedule is irrelevant — this
   fires the function once on demand. Useful for confirming push delivery
   without waiting for the next tick.

You should see structured logs prefixed `[deliver-letters]` in the server
output: fetched N, push send response, marked X delivered.

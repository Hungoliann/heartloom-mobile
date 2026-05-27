# Chat fanout — Supabase Database Webhook setup

Phase 1 of family group chat relies on a Supabase Database Webhook to notify the
server whenever a new message is inserted. The server endpoint then fans out
push notifications via Inngest + Expo Push. The endpoint itself is created by
another agent — see `server/DEPLOY.md` for the Render deployment.

## Where to configure

Supabase dashboard → Project Settings → Database → Webhooks → **Create a new
hook**.

## Values

| Field | Value |
|---|---|
| Name | `message-sent-fanout` |
| Table | `public.messages` |
| Events | INSERT only (uncheck UPDATE / DELETE) |
| Type | HTTP Request |
| Method | `POST` |
| URL | `https://<your-render-domain>/api/inngest/messages/inserted` |
| HTTP headers | `Content-Type: application/json`<br>`x-webhook-secret: <SHARED_SECRET>` |
| Payload | leave default (Supabase auto-includes the new row under `record`) |

## Shared secret

1. Generate a strong random value (e.g. `openssl rand -hex 32`).
2. Paste it as the `x-webhook-secret` header value above.
3. Set the same value as `SUPABASE_WEBHOOK_SECRET` in the Render service env.
   The server endpoint rejects requests where the header does not match.

## Payload shape (FYI)

Supabase Database Webhooks POST a JSON body of the form:

```json
{
  "type": "INSERT",
  "table": "messages",
  "schema": "public",
  "record": { "id": "...", "family_id": "...", "author_id": "...", "body": "...", ... },
  "old_record": null
}
```

## Verify

After saving, send a test message from the app. The webhook log in the
Supabase dashboard should show a `200` response. If you see `401`, the
shared secret is mismatched between dashboard and Render env.

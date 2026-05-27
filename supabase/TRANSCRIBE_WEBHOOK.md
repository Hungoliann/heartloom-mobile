# Letter Audio Transcription — Database Webhook Setup

When a letter is saved with audio, this webhook triggers the Whisper
transcription pipeline on the server.

## Create the webhook

Supabase → Project Settings → Integrations → Webhooks → Create:

| Setting | Value |
|---|---|
| **Name** | `letter_audio_uploaded` |
| **Table** | `public.letters` |
| **Events** | Insert only |
| **Type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://heartloom-mobile.onrender.com/api/inngest/letters/audio-uploaded` |
| **Timeout** | 5000 ms |

### HTTP Headers

| Header | Value |
|---|---|
| `Content-type` | `application/json` |
| `x-webhook-secret` | Same value as `SUPABASE_WEBHOOK_SECRET` in Render env |

### HTTP Parameters

Leave empty.

## Render env var

Add `OPENAI_API_KEY` to the Render service environment (from
[platform.openai.com/api-keys](https://platform.openai.com/api-keys)).

The existing `SUPABASE_WEBHOOK_SECRET` is reused — no new secret needed.

## After setup

Re-sync the Inngest app so the new `Letter: Whisper Transcribe` function
appears. Create a letter with audio; within ~30 seconds the transcript
should populate in the letter detail screen.

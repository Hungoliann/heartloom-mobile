# Inngest Functions

These functions handle backend scheduled tasks for Heartloom.

## Setup

1. Install Inngest CLI: `npm install -g inngest-cli`
2. Set environment variables:
   - `INNGEST_EVENT_KEY` — from Inngest dashboard
   - `INNGEST_SIGNING_KEY` — from Inngest dashboard
   - `SUPABASE_URL` — Supabase project URL (without EXPO_PUBLIC_ prefix)
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Settings → API (service role key)

## Local development

```bash
npx inngest-cli dev
```

## Deployment

Deploy as an Expo API Route or alongside a Next.js/Express API.
For Expo API Routes, create `app/api/inngest+api.ts`:

```typescript
import { serve } from "inngest/expo-router";
import { inngest } from "../../inngest/client";
import { deliverLetters } from "../../inngest/functions/deliver-letters";

export const { GET, POST, PUT } = serve({ client: inngest, functions: [deliverLetters] });
```

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

## Deployment (Express server on Render.com)

The `server/` directory at the repo root contains a standalone Express server that hosts the Inngest webhook endpoint. It is completely separate from the Expo mobile app and has its own `package.json`.

### Deploy to Render

1. Push this repo to GitHub (the `server/` directory is included automatically).
2. In the [Render dashboard](https://render.com), create a new **Web Service** and connect your GitHub repo.
3. Set the **Root Directory** to `server`.
4. Render will detect `render.yaml` — or set manually:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add the following environment variables in the Render dashboard (Environment tab):

   | Key | Where to get it |
   |---|---|
   | `INNGEST_EVENT_KEY` | Inngest dashboard → your app → Event Key |
   | `INNGEST_SIGNING_KEY` | Inngest dashboard → your app → Signing Key |
   | `SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |

6. Once deployed, copy your Render URL (e.g. `https://heartloom-server.onrender.com`) and register it in the **Inngest dashboard** under your app's **Serve URL**: `https://heartloom-server.onrender.com/api/inngest`

### Local development

```bash
cd server
npm install
cp .env.example .env   # fill in real values
npx ts-node src/index.ts
```

Then in a second terminal, start the Inngest dev server to test locally:

```bash
npx inngest-cli@latest dev -u http://localhost:3001/api/inngest
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (scan QR with Expo Go app)
npm start

# Start on a specific platform
npm run android
npm run ios

# Type-check without emitting
npm run typecheck

# Lint
npm run lint

# Install new Expo SDK-compatible packages (use this instead of npm install for expo/* packages)
npx expo install <package>

# Install non-Expo packages
npm install <package> --legacy-peer-deps

# Regenerate Supabase TypeScript types (run after schema changes)
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

## Architecture

### Stack
| Layer | Choice | Why |
|---|---|---|
| Mobile framework | Expo (React Native) + TypeScript | Cross-platform iOS/Android, managed workflow |
| Routing | Expo Router (file-based) | Routes live in `app/` — folder name = URL segment |
| Styling | NativeWind v4 + Tailwind CSS v3 | Tailwind classes in React Native; **must use Tailwind v3**, not v4 |
| Server state | TanStack Query | Caching, background refetch, loading/error states |
| Client state | Zustand | Auth session, UI state in `src/store/` |
| Backend | Supabase | Auth, PostgreSQL, Storage, Realtime |
| Scheduled jobs | Inngest | Future letter delivery — schedule functions to fire on a specific date |
| Video | Mux | Video upload, transcoding, adaptive streaming |
| AI | Claude API (Anthropic) | Memory prompts, letter-writing assistance |
| Push notifications | Expo Push + OneSignal | In-app and background notifications |

### Routing (Expo Router)

Routes live entirely in `app/`. Folder names in parentheses are route groups — they share a layout without adding a URL segment.

```
app/
  _layout.tsx          ← Root: wraps everything in QueryClientProvider
  (auth)/
    _layout.tsx
    sign-in.tsx        → /sign-in
    sign-up.tsx        → /sign-up
  (tabs)/
    _layout.tsx        ← Tab bar
    index.tsx          → / (Home — record a memory)
    legacy.tsx         → /legacy (Future Letters)
    family.tsx         → /family
    vault.tsx          → /vault (documents, wishes)
```

Add new top-level screens directly under `app/`. Add modals using `<Stack.Screen presentation="modal">` in the nearest `_layout.tsx`.

### Source layout

```
src/
  lib/
    supabase.ts        ← Supabase client (singleton, typed via Database)
  store/
    auth.store.ts      ← Zustand store: session, user, isLoading
  types/
    database.ts        ← Generated Supabase types; do not hand-edit
  components/
    ui/                ← Primitive reusable components (Button, Card, etc.)
    shared/            ← Feature-aware shared components
  hooks/               ← Custom React hooks
  utils/               ← Pure helpers (date formatting, etc.)
```

### Supabase conventions

- All DB calls go through the typed `supabase` client from `src/lib/supabase.ts`.
- Use Row Level Security (RLS) policies on every table — families should never see other families' data.
- The `Database` type in `src/types/database.ts` is the source of truth for table shapes; regenerate it after schema changes.
- Env vars must be prefixed `EXPO_PUBLIC_` to be available in the app bundle. See `.env.example`.

### NativeWind / Tailwind

- Use `className` on React Native `View`, `Text`, `Pressable`, etc. — NativeWind transforms them.
- Custom brand colors are defined in `tailwind.config.js`: `amber-warm`, `amber-deep`, `sage-*`, `loom-bg`, `loom-text`, `loom-muted`.
- `global.css` must be imported once in `app/_layout.tsx`.
- NativeWind v4 requires Tailwind CSS v3 (`tailwindcss@3`). Do not upgrade to v4.

### Key product features

- **Future Letters** — the hero feature. A `Letter` row has a `deliver_at` timestamp. Inngest watches for rows where `deliver_at <= now()` and sends push notifications + marks `delivered_at`.
- **Media memories** — voice (`expo-av`), video (Mux upload URL → Mux playback), photos (Supabase Storage).
- **Vault** — document storage (wills, DNRs, funeral plans). Files go to Supabase Storage bucket `documents`; metadata row in `documents` table.
- **Family model** — one `Family` owns many `Profiles`. RLS enforces isolation. Adult children invite the legacy owner.

### Data model summary

```
profiles   — one per auth user; belongs to a family
families   — group unit; owner_id = creator
letters    — future letters with optional media; deliver_at drives Inngest scheduling
documents  — vault files: will, DNR, funeral_plan, financial, other
```

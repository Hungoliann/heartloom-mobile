# Ship Checklist

Items the code can't do alone — they need a human (you) to click in a dashboard,
write copy, or paste a key.

## App Store / Play Store submission

### Mandatory metadata in `eas.json`
Currently has placeholders:
- `appleId` — your Apple ID email
- `ascAppId` — find in App Store Connect → My Apps → your app → App Information → "Apple ID"
- `appleTeamId` — Apple Developer portal → Membership → Team ID

### Screenshots
- iOS: 8 per device size (6.7", 6.5", 5.5") — capture from the Pixel/iOS simulator
- Android: 2-8 phone screenshots
- Feature graphic: 1024 × 500 PNG for Play Store

### App Store privacy disclosures
Apple requires you to declare what data is collected:
- Account info (email)
- User content (letter text, audio)
- Identifiers (Expo push token)
- Diagnostics (if/when Sentry added)
Fill out under App Store Connect → App Privacy.

### Play Store data safety form
Same idea, different form. Play Console → App content → Data safety.

### Age rating questionnaire
Both stores. Heartloom is likely 4+ / E for Everyone — no objectionable content.

## Legal copy

### Privacy Policy
[app/privacy.tsx](app/privacy.tsx) exists but verify the text is real and lawyer-reviewed. Must
cover:
- What you collect (email, name, letter content, audio recordings, push token)
- Where it's stored (Supabase, US region)
- Third parties (Inngest, Expo Push, Mux if you use it)
- User rights (delete, export)
- Contact email

### Terms of Service
[app/terms.tsx](app/terms.tsx) — similarly verify real content.

For a free first-party app, a single-page combined privacy + terms is fine.
Use a template from [https://termsfeed.com](https://termsfeed.com) or similar, then have
a lawyer review (a 30-min consult is worth it).

## Auth / Supabase

### Site URL + redirect URLs
[Auth → URL Configuration](https://supabase.com/dashboard/project/kttzkpxbqnhmbovalwfs/auth/url-configuration)

- Site URL: `heartloom://`
- Redirect URLs: `heartloom://`, `heartloom://*`

Without this, password recovery emails will point to `localhost:3000`.

### Email templates
[Auth → Email Templates](https://supabase.com/dashboard/project/kttzkpxbqnhmbovalwfs/auth/templates) —
the default templates have "Supabase" branding. At minimum, change the sender
name to "Heartloom" and the body to match your tone.

### Email confirmation
Currently disabled (you toggled off earlier). For production: re-enable, but only
after Site URL above is set to `heartloom://`.

### Regenerate database types
After all SQL migrations are applied, the generated types in
[src/types/database.ts](src/types/database.ts) are stale (we've casted around it for
`profiles.push_token` and `letters.family_id`). Regenerate:
```sh
npx supabase login   # one-time, opens browser
npx supabase gen types typescript --project-id kttzkpxbqnhmbovalwfs > src/types/database.ts
```
Then remove the `as never` cast in [app/_layout.tsx](app/_layout.tsx) and the
`as string` cast in [src/hooks/useLetters.ts](src/hooks/useLetters.ts).

## Observability

### Sentry
Sign up at [sentry.io](https://sentry.io) → create a React Native project → grab the DSN.
Then:
```sh
pnpm add @sentry/react-native
npx @sentry/wizard@latest -i reactNative
```
The wizard edits app.json and _layout.tsx. Pass the DSN via `EXPO_PUBLIC_SENTRY_DSN`.

## OTA updates (optional but recommended)

### EAS Update channels
Lets you push JS-only fixes without a full native rebuild — huge time-saver post-launch.
```sh
eas update:configure
eas channel:create production
eas channel:create preview
```
Update `eas.json` build profiles with `"channel": "production"` and `"channel": "preview"`.
Push updates with `eas update --channel production --message "fix typo"`.

## Inngest (already deployed but verify)

### Confirm cron
After [Render](https://dashboard.render.com) finishes deploying commit `c67273e`, the
Inngest function "Deliver Due Letters" should show `*/5 * * * *` cron. If it still
shows `0 * * * *`, manually re-sync from the Inngest dashboard:
[app.inngest.com](https://app.inngest.com) → heartloom app → ⋮ → Sync.

### Test delivery end-to-end
1. Create a letter in the app with `deliver_at` set to 2 minutes from now.
2. Wait ~6 minutes.
3. Push notification should arrive on the device where you signed up.
4. Check Inngest dashboard → Runs → Deliver Due Letters logs for any errors.

## Deferred decisions

These aren't blockers but you should make a call before V1.1:

- **Vault** (documents — wills, DNRs) — hidden in nav. Either build the upload UI
  or remove the tab + table + storage bucket.
- **Concierge** — hidden, mostly stubbed. Same call.
- **Chat / Timeline tabs** — verify they actually do something meaningful.
- **Family invites** — once tested, decide if you want email-based invites in
  addition to the code paste flow.

## Pre-submit smoke test

Before clicking "Submit for Review":

1. ☐ Sign up with a fresh email on a clean device.
2. ☐ Create a letter (text + audio).
3. ☐ See it in the Letters tab.
4. ☐ Pick a 2-minute future date and confirm push lands.
5. ☐ Edit the letter.
6. ☐ Delete the letter; confirm the audio file is also gone from the
   `voice-memos` bucket (check in Supabase Storage UI).
7. ☐ Sign out.
8. ☐ Sign back in; verify session persists.
9. ☐ Delete account; verify the row is gone in `auth.users`.
10. ☐ Reinstall the app; verify there's no leftover SecureStore session
    (cold-start should go to sign-in, not into the tabs).

# Demo Distribution — How to let viewers test Heartloom

Two ways to get the app in front of your audience tomorrow. Pick based on
who's testing and whether you'll be present.

| | Option A — Expo Go (tunnel) | Option B — Android APK |
|---|---|---|
| **Platforms** | iOS **and** Android | Android only |
| **Your laptop** | Must stay running during testing | Not needed after build |
| **Feels like** | Runs inside the Expo Go app | Real standalone app, your icon |
| **Best for** | Live demo while you present | Letting Android viewers try on their own time |
| **Setup time** | ~10 min | ~20 min (build queue) |
| **Cost** | Free | Free |

## The hard iOS truth
You **cannot** put a standalone app on someone else's iPhone without a paid
Apple Developer account ($99/yr). No TestFlight, no ad-hoc, no workaround.
For iPhone viewers, **Option A (Expo Go) is the only path tomorrow.**

## Recommendation for your presentation
- Keep **Option A** running on your laptop during the talk — that covers every
  iPhone in the room/call.
- Optionally also send the **Option B** APK link to Android viewers so they can
  poke at it independently.

## One-time prerequisites (both options)
1. A free Expo account → https://expo.dev/signup
2. EAS CLI installed:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. Run every command below **from the project root**
   (`heartloom-mobile/`), not from this folder.

Your project is already linked to EAS (projectId is in `app.json`), so you
should not need to run `eas init`.

→ See **OPTION-A-expo-go-live-demo.md** and **OPTION-B-android-apk.md**.

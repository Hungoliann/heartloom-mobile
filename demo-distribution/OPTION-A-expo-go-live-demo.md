# Option A — Expo Go live demo (iOS + Android)

Best for a **live presentation** where you're present. Viewers run your app
inside the free **Expo Go** app by scanning a QR / opening a link. Works on
iPhone and Android. **Your laptop must stay running** the whole time — it's
serving the app over a secure tunnel.

---

## What your viewers need (tell them in advance)
- Install **Expo Go** from the App Store (iOS) or Play Store (Android).
- That's it. No account required on their side.

## Steps (run from the project root)

### 1. Start the dev server with a tunnel
A tunnel lets phones connect from anywhere (different WiFi, cellular) — not just
your local network.

```bash
npx expo start --tunnel
```

- The first time, it may ask to install `@expo/ngrok` — say **yes**.
- Wait for the QR code to appear in your terminal.

### 2. Force "Expo Go" mode (important)
This project has `expo-dev-client` installed, so the server may default to a
"development build" QR that Expo Go can't open. In the terminal, press:

```
s
```

This toggles to **"Expo Go"**. The QR/banner should now say
*"Using Expo Go"*. (Press `s` again to toggle back if needed.)

### 3. Share with viewers
- **In the room:** put the QR code on the projector.
  - iPhone: open the **Camera** app, point at the QR, tap the banner.
  - Android: open **Expo Go** → **Scan QR code**.
- **Remote:** copy the `exp://...` URL the terminal prints and paste it into
  your chat/email. Viewers open it (iPhone: tap link → opens Expo Go;
  Android: paste into Expo Go's "Enter URL manually").

### 4. Keep the terminal open
As long as `expo start --tunnel` is running, viewers can connect, reconnect,
and reload. Closing the terminal or sleeping the laptop kills the demo.

---

## Known limitations in Expo Go (fine for a demo)
- **Push notifications won't fire** — Expo Go dropped remote push in SDK 53+.
  The letter-delivery and chat push features are background-only and not part of
  a live walkthrough, so this doesn't affect the demo.
- Shows the Expo Go wrapper, not your custom app icon.
- Slightly slower first load than a standalone build.

## Quick troubleshooting
- **"Something went wrong" / won't load:** confirm you pressed `s` for Expo Go
  mode (step 2).
- **Tunnel won't start:** re-run `npx expo start --tunnel`; accept the ngrok
  install. If it hangs, try once on a stable network.
- **Stale screen on a viewer's phone:** have them shake the device → **Reload**.
- **Want to clear cache:** `npx expo start --tunnel -c`.

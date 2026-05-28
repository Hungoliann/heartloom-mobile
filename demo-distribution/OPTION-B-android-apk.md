# Option B — Android APK (standalone, shareable link)

Best for letting **Android viewers** install a real, standalone build on their
own time. EAS builds the APK in the cloud and gives you a link/QR anyone can
use to download and install. **No laptop needed** once it's built.
**Android only** — iPhones can't use this without a paid Apple Developer account.

This uses the existing **`preview`** profile in `eas.json`, which is already set
to `distribution: "internal"` and `buildType: "apk"`.

---

## Steps (run from the project root)

### 1. Kick off the build
```bash
eas build --platform android --profile preview
```
- If prompted to generate a new Android Keystore, say **yes** (EAS manages it).
- The build runs in EAS's queue — typically **10–20 minutes**.
- You can close the terminal; the build continues in the cloud.

### 2. Get the shareable link
When the build finishes, the terminal prints a build URL. You can also find it
any time at:
```bash
eas build:list
```
or on the dashboard: **https://expo.dev** → your project → **Builds** → the
latest Android build. That page has a **QR code** and a **direct download
link** for the `.apk`.

### 3. Send it to your Android viewers
Share the build page link (or the direct APK link). Tell them:
1. Open the link on the Android phone and download the `.apk`.
2. Tap the downloaded file to install.
3. Android will warn about "install from unknown sources" — they tap
   **Settings → Allow from this source**, then **Install**. (This is normal for
   any app not from the Play Store.)

### 4. Done
The app installs with your real icon and runs standalone — no Expo Go, no laptop.

---

## Notes
- **Push notifications**: this is a real build, so push *can* work — but only if
  your Expo push credentials and the server are configured/deployed. Not
  required for a demo.
- **Rebuild after code changes**: an APK is a snapshot. If you change code, run
  the build command again to produce a new APK. (For tiny JS-only tweaks you
  could later wire up `eas update --branch preview`, but for tomorrow just
  rebuild if needed.)
- **iOS equivalent**: not possible without a paid Apple Developer account — use
  Option A (Expo Go) for iPhone viewers.

## Quick troubleshooting
- **Build fails immediately**: run `eas login` first; confirm you're on the
  right Expo account that owns the project.
- **"No credentials"**: let EAS generate them when prompted (say yes to the
  Keystore question).
- **Viewer can't install**: make sure they're downloading on an **Android**
  device and allowed unknown-source installs for their browser/files app.

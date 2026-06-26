# App Store App Previews (screen recordings)

Turn iPhone screen recordings into **App Preview** videos for App Store Connect.

**Important:** Preview video dimensions are **not** the same as screenshot dimensions.

| Asset | iPhone 6.3" size |
|-------|------------------|
| Screenshot | 1206 × 2622 |
| App Preview video | **886 × 1920** |

## Quick start

1. Record on your iPhone (Control Center → Screen Recording) while using TestFlight.
2. AirDrop or copy `.mov` / `.mp4` files into **`raw/`**.
3. Run:

   ```bash
   npm run prepare:app-store-previews
   ```

4. Upload from **`output/iphone-preview/`** to the **App Previews** section in Media Manager (not Screenshots).

## What the script does

- Resizes to **886 × 1920** (Apple's preview size for 6.3" / 6.5" / 6.9" slots)
- Re-encodes **HEVC → H.264** (required by App Store Connect)
- Forces **30 fps** constant frame rate
- Ensures **stereo AAC** audio (adds silent track if your recording has no audio)
- Trims to **30 seconds** max (warns if under 15 seconds)

## Tips

- Aim for **15–30 seconds** per preview (Apple's rule).
- You can upload up to **3** previews per device size.
- App Previews are **optional** — screenshots alone are enough to submit.
- Keep the phone **portrait**; the app is portrait-only.

## Custom paths

```bash
node scripts/prepare-app-store-previews.mjs path/to/input path/to/output
```

Uses `ffmpeg-static` (installed with `npm install`) — no separate FFmpeg install needed.

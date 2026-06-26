# App Store screenshots

Resize iPhone captures for App Store Connect (strips transparency, exports exact ASC dimensions).

## Quick start

1. AirDrop or copy screenshots into **`raw/`** (PNG or JPG from your iPhone).
2. Run:

   ```bash
   npm run prepare:app-store-screenshots
   ```

3. Upload from **`output/`**:
   - **`6.5-inch/`** or **`6.9-inch/`** — **required** for submission (either set is fine; 6.9" is preferred in 2026).
   - **`6.3-inch/`** — optional; native iPhone 17 size (1206×2622).

Files are numbered `01-…`, `02-…` in capture order (sorted by filename).

## Output sizes

| Folder | Dimensions | Use |
|--------|------------|-----|
| `6.3-inch` | 1206 × 2622 | iPhone 17 / 6.3" display slot |
| `6.5-inch` | 1284 × 2778 | Required tier if you skip 6.9" |
| `6.9-inch` | 1320 × 2868 | Primary showcase tier (2026) |

Exports are **JPEG** on a white background (no alpha channel).

## App Previews (screen recordings)

See [../app-store-previews/README.md](../app-store-previews/README.md) — `npm run prepare:app-store-previews`.

## Custom paths

```bash
node scripts/resize-app-store-screenshots.mjs path/to/input path/to/output
```

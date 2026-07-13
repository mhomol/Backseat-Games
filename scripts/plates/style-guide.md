# License Plate Art — Style Guide

Backseat Games uses **landmark scene tiles** — one recognizable place per state/territory — not photorealistic DMV plates.

## Canvas

- **Aspect ratio:** 2:1 (300×150 px export)
- **Format:** PNG, optimized for mobile bundle
- **Naming:** `{code}.png` (e.g. `TX.png`, `BC.png`) matching `src/data/plates.json`

## Visual language

- Family cartoon / road-trip illustration matching `scripts/brand-prompts.json` style bible
- Full-bleed landmark scene (no fake plate body, no tinted chrome bands, no bolts)
- Landmark from `plates.json` `landmark` field — manmade or natural, clearly readable at tile size
- Soft sky / landscape depth; cheerful and kid-friendly
- **No baked text** — state code and name render in React Native over the image
- **No government seals, flags, or official logos**

## Claim-state overlays (in app, not in art)

| State | UI treatment |
|-------|----------------|
| Available | Full-color landmark image + single pink board frame |
| Yours | Green tint overlay + green border + SPOTTED stamp |
| Taken | Dim overlay + owner name on the label bar |

## Generation

- Prefer Recraft V4 via `scripts/generate-plates.mjs --replicate`
- Filter with `--codes=GA,CA,AB` for pilots
- Landmark prompt seed comes from `plates.json`

## Legal

Art is **fictional and inspired by** well-known places. Do not trace official seal artwork or specialty plate graphics.

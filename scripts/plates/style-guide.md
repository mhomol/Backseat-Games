# License Plate Art — Style Guide

Backseat Games uses **original stylized plate backgrounds** — not photorealistic DMV replicas.

## Canvas

- **Aspect ratio:** 2:1 (300×150 px export)
- **Format:** PNG, optimized for mobile bundle
- **Naming:** `{code}.png` (e.g. `TX.png`, `BC.png`) matching `src/data/plates.json`

## Visual language

- Flat cartoon / game UI aesthetic (family road-trip app)
- White or cream plate body (`#FFFDF8`)
- **Accent color** from `plates.json` `tint` — used for border, top band, and corner accents
- Rounded rectangle with thick border (`border-radius` ~12px at 300px width)
- Simple geometric decorations only (stripes, dots, hills) — **no government seals or official logos**
- **No baked text** — state code and name render in React Native over the image

## Claim-state overlays (in app, not in art)

| State | UI treatment |
|-------|----------------|
| Available | Full-color plate image |
| Yours | Green tint overlay + green border |
| Taken | Desaturated overlay + owner name text |

## Generation

- Pilot style validated via Replicate `flux-schnell` (flat cartoon, no text)
- Production assets generated with `scripts/generate-plates.mjs` for consistency across all 63 jurisdictions
- Re-run with `REPLICATE_API_TOKEN` set to optionally regenerate via API (`--replicate`)

## Legal

Art is **fictional and inspired by** common plate color palettes only. Do not trace official seal artwork or specialty plate graphics.

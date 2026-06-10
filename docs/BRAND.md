# Backseat Games — Brand Guidelines

Canonical visual style: **Recraft V4** road-trip hero art (approved June 2026).  
Style bible: [`scripts/brand-prompts.json`](../scripts/brand-prompts.json)

## Core palette

| Token | Hex | Use |
|-------|-----|-----|
| Pink | `#F25B88` | License Plate Game |
| Green | `#3BCA6E` | Sign Game |
| Blue | `#3FA9F5` | Travel Bingo |
| Sky | `#7EC8F7` | Splash screen |
| Cream | `#FFF8EE` | Overlays, logo background |

## Logo

- **Lockup:** `assets/branding/logo-lockup.webp` (marketing + optional UI)
- **Typography:** BACKSEAT (pink) + GAMES (green), white dashed stitching, map-pin A
- **Marketing copies:** `assets/branding/marketing/`

## Scenery heroes (Recraft V4)

| File | Screen |
|------|--------|
| `home-hero.webp` | Home — Start / Join / Settings signs in art |
| `host-hero.webp` | Host setup — game signs in art |
| `join-hero.webp` | Join — scenery only, form overlay |

Drafts (for regen review): `assets/branding/drafts/*-draft-recraft-v4.webp`

## App icon

- `assets/icon.png` — regenerated in Recraft V4 style (1024×1024)
- Source draft: `assets/branding/drafts/icon-draft-recraft-v4.webp`

## Game headers

Pink / green / blue per game — see `src/theme/brand.ts`.

## Regenerating assets

```bash
# Generate drafts (needs REPLICATE_API_TOKEN)
npm run generate:brand
npm run generate:brand host join logo icon

# Promote approved drafts to production
node scripts/generate-brand-assets.mjs --promote home host join logo icon
```

**Model:** `recraft-ai/recraft-v4` — prompt-only (no reference image). Consistency comes from the locked `styleBlock` + `logoBlock` in `brand-prompts.json`.

## UI pattern

- Full-bleed hero WebP background (`SceneryBackground`)
- Interactive `SignPostButton` overlays (reliable taps)
- Logo baked into hero art; `BrandLogo` spacer preserves layout

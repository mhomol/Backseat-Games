# Backseat Games — Brand Guidelines

Canonical visual style: **Recraft V4** road-trip hero art (approved June 2026).  
Style bible: [`scripts/brand-prompts.json`](../scripts/brand-prompts.json)

## Core palette

| Token | Hex | Use |
|-------|-----|-----|
| Pink | `#F25B88` | License Plate Game |
| Green | `#3BCA6E` | Sign Game |
| Blue | `#3FA9F5` | Travel Bingo |
| Sky | `#5CB9E0` | Hero letterbox, nav bar, splash (sampled from hero art) |
| Road yellow | `#F0C060` | Accent buttons, road-dash UI (sampled from hero art) |
| Cream | `#FFF8EE` | Overlays, logo background |

## Logo

- **Lockup:** `assets/branding/logo-lockup.webp` (marketing + optional UI)
- **Typography:** BACKSEAT (pink) + GAMES (green), white dashed stitching, map-pin A
- **Marketing copies:** `assets/branding/marketing/`

## Scenery heroes (Recraft V4)

| File | Screen |
|------|--------|
| `home-hero.webp` | Home — logo + Start / Join / Settings signs (768×1536) |
| `host-hero.webp` | Host setup — game signs only, no logo (720×1456) |
| `waiting-hero.webp` | Join + waiting room — scenery only, no logo or signpost |

Drafts (for regen review): `assets/branding/drafts/*-draft-recraft-v4.webp`

### Hero size & screen fill

| Asset | Pixels | Source |
|-------|--------|--------|
| `home-hero.webp` | 768×1536 | Recraft V4 (`768x1536` max width) |
| `host-hero.webp`, `waiting-hero.webp` | 720×1456 | Flux Kontext edits from home hero |

**Kontext did not preserve home’s pixel dimensions** — host/waiting drafts arrived at 720×1456. Promotion only converts PNG→WebP; we do not resize heroes.

**Layout (all hero screens):** art scales **uniformly to full width** (no side bars), **bottom-anchored**. Extra space above is **`brand.sky` (`#5CB9E0`)**; if the scaled art is taller than the screen, the top crops off (usually sky in the illustration). Hotspots live inside the art frame so taps stay aligned.

Optional later: re-run Kontext with explicit output size, or pad host/waiting to 768×1536 with sky-colored bars before promoting.

**Taller art (optional):** **768×1664** would add sky/road for very tall phones. Recraft V4 cannot extend an existing image (prompt-only). Outpaint or regenerate, then update `heroDimensions` in `src/data/brandAssets.ts` and recalibrate `src/data/heroHotspots.ts`.

## UI pattern

- Hero WebP bottom-anchored at full width; sky `#5CB9E0` fills space above (`SceneryBackground`)
- Invisible tap targets on illustrated signs (`HeroSignHotspots`)
- Logo only on home hero art, not host/join

## App icon

- `assets/icon.png` — car-only square icon (1024×1024), Kontext from home hero
- Source draft: `assets/branding/drafts/app-icon-car-only.png`
- Promote after updating draft: copy draft → `assets/icon.png` + `assets/splash-icon.png`

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

**Model:** `recraft-ai/recraft-v4` — prompt-only (no reference image). Consistency comes from the locked `styleBlock` + `logoBlock` in `brand-prompts.json`. To extend an approved hero vertically, outpaint to **768×1664** (see targetHeroSize in prompts JSON).

# Holiday themes — art pipeline (iOS 1.5)

**v1 heroes are packed** (720×1456 WebP under `assets/branding/themes/`). Classic remains the fallback if a pack file is missing. **Do not** call Replicate from an agent until a look is vetted manually.

Thanksgiving host is packed from **v2** (`thanksgiving-host-hero-v2.png`) with a correct TRAVEL BINGO label.

## Model (first try)

[black-forest-labs/flux-kontext-pro](https://replicate.com/black-forest-labs/flux-kontext-pro) on Replicate (image-to-image). Same path as extra game backgrounds that keep the pink car. **Not** Recraft V4 (no reference image).

## Source images (one at a time)

| Screen | File | Must keep |
|--------|------|-----------|
| Home | `assets/branding/home-hero.webp` | Logo + three signs (hotspots) |
| Host | `assets/branding/host-hero.webp` | Five game signs |
| Scenery / waiting | `assets/branding/waiting-hero.webp` | Pink car + road |

## First Thanksgiving scenery prompt (waiting-hero)

Keep the exact same pink vintage compact car with luggage on the roof rack, same rear camera angle, same cartoon style and light blue sky. Change only the landscape to a late-autumn Thanksgiving road trip: orange and gold trees, pumpkins and hay bales along the roadside, warm afternoon light. Do not change the car, do not add text, logo, watermark, or extra vehicles.

## First Thanksgiving home-hero prompt

Keep the exact same composition: BACKSEAT GAMES logo, wooden signpost with the three level arrow signs and their existing labels, and the pink car in the same place. Add Thanksgiving autumn only in the scenery (fall foliage, pumpkins by the road). Do not move, restyle, or rewrite the signs or logo. No extra text.

## Christmas

Same model and sources after Thanksgiving is locked. Swap autumn for winter (snow on pines, optional wreath/lights that do not hide the car silhouette, warm lights in the distance). Do not restack signs.

## Promote

1. Save the Replicate download (URLs expire). Prefer `%USERPROFILE%\Pictures\Replicate\` then copy into `assets/branding/drafts/`.
2. Scenery: `node scripts/promote-game-scenery.mjs path/to.png "Thanksgiving roadside"` then register in `src/data/gameSceneryRotation.ts` **and** the theme pack in `src/data/themes.ts`. The script prints a `sky:` hex sampled from the top of the file — required on every `GameSceneryEntry`.
3. Heroes: convert PNG→WebP like today; wire `{ source, sky }` in `src/data/themes.ts`. Sample sky with `node scripts/sample-hero-sky.mjs path/to/hero.webp` (top ~2% of **that** file). Do not reuse another hero’s hex. Recalibrate `src/data/heroHotspots.ts` only if taps drift.
4. Bingo item icons: Recraft V4 (`recraft-ai/recraft-v4`), then add `require`s in `src/data/bingoItemImages.ts`. Holiday **ids** already live in `src/data/bingo-holiday-items.json` (emoji until PNGs exist).

Hangman pilgrim/Santa are **code costumes**, not Kontext.

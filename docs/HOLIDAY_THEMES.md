# Holiday themes — art pipeline (iOS 1.5)

**v1 heroes are packed** (720×1456 WebP under `assets/branding/themes/`). Halloween home/host/waiting plus four gameplay stills (cemetery, chapel, maze, trick-or-treat) are packed. Classic remains the fallback if a pack file is missing. **Do not** call Replicate from an agent until a look is vetted manually.

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

## Halloween (Flux Kontext Pro — you run these)

Same model and **one source at a time**. Keep logo, signs, pink car, luggage, rear camera angle. Change **only** the landscape. No extra cars, no new text, no watermark. Expect a **dark dusk/night sky** (purple-navy) so header bleed will be cream ink like Christmas — sample `sky` per file after promote.

### Waiting / game scenery (start here)

Source: `assets/branding/waiting-hero.webp`

Keep the exact same pink vintage compact car with luggage on the roof rack, same rear camera angle, same cartoon style. Change only the landscape to a Halloween road trip at dusk: deep purple-navy sky, a few jack-o-lanterns and hay bales along the roadside, orange-leaf trees, maybe a distant farmhouse porch light. Do not change the car, do not add people, witches flying, extra vehicles, text, logo, or watermark.

### Home hero

Source: `assets/branding/home-hero.webp`

Keep the exact same composition: BACKSEAT GAMES logo, wooden signpost with the three level arrow signs and their existing labels, and the pink car in the same place. Add Halloween only in the scenery (dusk sky, jack-o-lanterns, autumn trees). Do not move, restyle, or rewrite the signs or logo. No extra text.

### Host hero

Source: `assets/branding/host-hero.webp`

Keep the exact same five game signs, post, labels, pink car, and camera angle. Change only the landscape to Halloween dusk (pumpkins, hay, purple-navy sky). Do not restack, relabel, or redraw the signs. No extra text.

### Extra scenery rotation (after waiting is locked)

Same waiting-hero source, one prompt each. Keep the car.

1. **Small-town Halloween:** Main Street with porch jack-o-lanterns and paper bats, still the same pink car on the road.
2. **Corn maze dusk:** tall corn and a simple maze entrance off the shoulder, no people.
3. **Lighthouse / causeway night:** moonlit water, a few pumpkins on the rocks.
4. **Downtown trick-or-treat glow:** storefront warm lights and a couple of pumpkins on the curb, no crowds that hide the car.

### Bake a tiny logo beat (home hero only)

Feed the **already packed themed home hero**, not Classic. One source at a time. Change **only** the wordmark sticker. Keep BACKSEAT / GAMES lettering, signs, car, and landscape. No extra text or watermark. Christmas **lights stay in code** — do not paint lights onto the Christmas hero.

**Halloween** — source `assets/branding/themes/halloween/home-hero.webp`

Keep the exact same BACKSEAT GAMES logo, pin, signs, car, and Halloween landscape. The only change: inside the circular hole of the blue map-pin “O” in GAMES, paint two small glowing evil eyes (yellow-amber irises, vertical slit pupils, slightly menacing, still cute kids-app). Center them in that circle. Do not restyle the pin, letters, or anything else.

**Christmas** — source `assets/branding/themes/christmas/home-hero.webp`

Keep the exact same BACKSEAT GAMES lettering, white sticker, signs, car, and winter landscape. Replace **only** the blue map-pin “O” in GAMES with a small cute cartoon Christmas tree in that same slot (same size as the pin head, green tree, a few ornaments, tiny star or no star). Do not add string lights — those are a code overlay. Do not restyle the other letters.

**Thanksgiving** — source `assets/branding/themes/thanksgiving/home-hero.webp`

Keep the exact same BACKSEAT GAMES lettering, white sticker, signs, car, and autumn landscape. Two small logo-only changes: (1) replace the blue map-pin “O” in GAMES with a tiny cute cornucopia in that same slot; (2) scatter a few maple/oak leaves on the white sticker around the letters (not covering the type). Do not restyle the letters or add extra objects.

### After you like a still

Save locally (`Pictures\Replicate\`), then promote with `sky` sampled from **that** file. Hangman Halloween costume is a **code drawing** (ghost/witch hitchhiker), not Kontext. Bingo icons stay Recraft V4, cream `#FFF8EE`, bold black outline, subject only.

## Promote

1. Save the Replicate download (URLs expire). Prefer `%USERPROFILE%\Pictures\Replicate\` then copy into `assets/branding/drafts/`.
2. Scenery: `node scripts/promote-game-scenery.mjs path/to.png "Thanksgiving roadside"` then register in `src/data/gameSceneryRotation.ts` **and** the theme pack in `src/data/themes.ts`. The script prints a `sky:` hex sampled from the top of the file — required on every `GameSceneryEntry`.
3. Heroes: convert PNG→WebP like today; wire `{ source, sky }` in `src/data/themes.ts`. Sample sky with `node scripts/sample-hero-sky.mjs path/to/hero.webp` (top ~2% of **that** file). Do not reuse another hero’s hex. Recalibrate `src/data/heroHotspots.ts` only if taps drift.
4. Bingo item icons: Recraft V4 (`recraft-ai/recraft-v4`), then add `require`s in `src/data/bingoItemImages.ts`. Holiday **ids** already live in `src/data/bingo-holiday-items.json` (emoji until PNGs exist).

Hangman pilgrim/Santa are **code costumes**, not Kontext.

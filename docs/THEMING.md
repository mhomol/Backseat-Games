# Theming

Paid looks (currently $0.99 each) plus free **Classic**. A theme is one `ThemePack` plus the art, Hangman doodle, sounds, critters, and IAP wiring that pack points at.

Hero / scenery stills: sample **that file’s** top sky (`node scripts/sample-hero-sky.mjs …`) and store it on the same registry row. Never reuse one pack-wide `sky` for every screen. Art-generation notes live in [HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md).

Registry: `src/data/themes.ts`. IDs: `src/types/theme.ts`. Entitlement SKUs: `src/types/purchases.ts`.

---

## Checklist for a new theme

Work through these in roughly this order. Classic is the fallback if a pack list is empty or a file is missing.

### 1. Identity and IAP

- Add the id to `THEME_IDS`, `isThemeId`, and `isPaidThemeId` (skip paid helpers if it is free).
- Paid: App Store Connect non-consumable SKU, then `*_THEME_PRODUCT_ID`, `PAID_THEME_PRODUCT_IDS`, and `ALL_IAP_SKUS`.
- `ThemePack`: `id`, `name`, `productId` (`null` for Classic), `freeCenterLabel` (Bingo / Color Catch free square).
- `themePacks` and `PAID_THEME_PACKS`. Settings already lists paid packs from that array.

### 2. Heroes (home / host / join / lobby)

Four `HeroArt` rows: `{ source, sky }`. Join and lobby often share the waiting still.

| Slot | Typical file | Keep from Classic |
|------|----------------|-------------------|
| Home | `assets/branding/themes/<id>/home-hero.webp` | Logo, three level signs, pink car |
| Host | `…/host-hero.webp` | Five game signs, pink car |
| Join / lobby | `…/waiting-hero.webp` | Pink car + road, rear camera |

Optional **logo beat** is painted into the home hero (Halloween eyes, Thanksgiving cornucopia, Christmas tree-O). Christmas **string lights** are a code overlay (`HeroLogoSeasonalDoodles`) — do not bake lights into the still. Recalibrate `src/data/heroHotspots.ts` only if taps drift.

### 3. Gameplay scenery rotation

Five stills (waiting + four extras) as `GameSceneryEntry[]` on the pack (`id`, `label`, `source`, **per-file `sky`**). Same car, new landscape. Promote with `scripts/promote-game-scenery.mjs`. Empty `scenery` falls back to Classic’s seven-still rotation.

### 4. Chrome and weather

- `ThemePack.sky` — loading-shell fallback only (use the home-hero sample).
- `ThemePack.ambient`: `classic` \| `leaves` \| `snow` \| `halloween` (or add a `ThemeAmbient` and handle it in weather + tile garnish).
  - `leaves` / `snow` — falling weather (`HolidayWeatherEffects`).
  - `halloween` — floating ghosts.
  - `classic` — no weather.
- Tile corners (`HolidayTileGarnish`): leaf pile / snow drift / candy pile by ambient.

### 5. Critters

Map the theme in `CRITTERS_BY_THEME` (`AmbientSceneryEffects`): sky flyer, sky bird, ground critter. New sprites go under `assets/branding/critters/` (see that folder’s README).

### 6. Hangman doodle

Shared gallows: `assets/branding/hangman/stand-{base,post,beam}.png` (do not restyle per theme).

Per character (six misses, always head → torso → left arm → right arm → left leg → right leg):

- Four PNGs: `assets/branding/hangman/<character>-{head,torso,arm,leg}.png`
- `HangmanCharacter` union + `HangmanDrawing` doodle branch
- Layout in `src/data/hangmanFigureLayout.ts` (offsets from the locked head, sizes, z-index, flips)
- Pack with `scripts/promote-hangman.mjs`; compose with `scripts/compose-hangman.mjs`
- Set `ThemePack.hangmanCharacter`

A “leg” can be whatever PNG completes the drawing (snowman base halves). Unused types `santa` and `ghost` are still rectangle sketches.

### 7. Sounds

Shared (not themed): `tap`, `invalid`, `round-start`, `open-jingle`.

Themed (session theme in a trip, otherwise Settings): `claim`, `win`, `horn-car`, `horn-truck`.

- Classic files stay at `assets/sounds/<name>.wav`
- Paid packs: `assets/sounds/<themeId>/{claim,win,horn-car,horn-truck}.wav`
- Static `require` maps in `src/services/feedback.ts`
- Synth stand-ins: `npm run generate:theme-sounds`

`horn-car` is loaded but **not played** anywhere yet. Completing Bingo / Color Catch does **not** play a separate bingo sting; the winner modal plays `win` (and currently still stacks the truck sting).

### 8. Bingo extras

~20 extra items in `src/data/bingo-holiday-items.json` under the theme id, `require`s in `src/data/bingoItemImages.ts`. Until a PNG exists the UI can show the emoji. `extraBingoItems` on the pack; Classic is `[]`.

---

## Current packs

### Classic (free)

| Piece | What it is |
|-------|------------|
| IAP | None |
| Free square | Road Trip! |
| Ambient | none |
| Critters | plane, bird, gopher |
| Heroes | Classic home / host / join / lobby |
| Scenery | 7 stills (`gameSceneryRotation`) |
| Hangman | Hitchhiker rag doll (locked) |
| Sounds | Original tap/claim/win/horns/jingle |
| Bingo extras | none |
| Tile garnish | none |
| Logo overlay | none |

### Halloween — `$0.99` · `theme_halloween`

| Piece | What it is |
|-------|------------|
| Free square | Trick or Trip! |
| Ambient | floating ghosts; candy-pile tile garnish |
| Critters | witch, raven, ghost |
| Heroes | dusk home / host / waiting; pin-O **evil eyes** baked in |
| Scenery | cemetery road, lightning hill, chapel, corn maze, trick-or-treat street |
| Hangman | Skeleton doodle (locked) |
| Sounds | boo / laugh / ghost wail / cartoon shriek (synth) |
| Bingo extras | 20 Halloween roadside items |

### Thanksgiving — `$0.99` · `theme_thanksgiving`

| Piece | What it is |
|-------|------------|
| Free square | Turkey Trot! |
| Ambient | falling leaves; leaf-pile tile garnish |
| Critters | balloon, turkey, fox |
| Heroes | autumn home / host / waiting; **cornucopia-O** + sticker leaves baked in |
| Scenery | pumpkin road, lighthouse, small town, cornfield, sunflower road |
| Hangman | Pilgrim doodle (locked) |
| Sounds | glass clink / gobble / wind / cheers (synth) |
| Bingo extras | 20 harvest roadside items |

### Christmas — `$0.99` · `theme_christmas`

| Piece | What it is |
|-------|------------|
| Free square | Holiday Ride! |
| Ambient | falling snow; snow-drift tile garnish |
| Critters | sleigh, dove, reindeer |
| Heroes | winter home / host / waiting; **tree-O** baked in; **code** string lights on home |
| Scenery | snow road, Santa sleigh, cottage snowman, town tree, downtown |
| Hangman | Snowman doodle (locked; legs = bottom-ball halves) |
| Sounds | twinkle chime / ho-ho-ho / sleigh bells / Jingle Bells hook (synth) |
| Bingo extras | 20 holiday roadside items |

---

## Related docs

- [HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md) — Kontext stills, promote, sky sampling
- [assets/branding/themes/README.md](../assets/branding/themes/README.md) — packed hero filenames
- [MONETIZATION.md](./MONETIZATION.md) — SKUs and restore
- `.cursor/rules/hero-sky-bleed.mdc` — per-file sky, not `pack.sky` for every header

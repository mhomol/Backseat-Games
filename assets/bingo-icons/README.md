# Travel Bingo icons

## Category icons (fallback)

Locked Recraft V4 category set (July 2026):

| Live PNG | Source draft |
|----------|--------------|
| `animals.png` | `bingo-animals-v2.webp` |
| `businesses.png` | `bingo-businesses.webp` |
| `landmarks.png` | `bingo-landmarks.webp` |
| `scenery.png` | `bingo-scenery.webp` |
| `signs.png` | `bingo-signs.webp` |
| `vehicles.png` | `bingo-vehicles.webp` |

Drafts: `assets/branding/drafts/v11-recraft/`.

## Per-item icons (animals + signs + vehicles)

Live PNGs live in `items/{id}.png` (edge-flooded alpha). Lookup order in app:

1. Per-item (`bingoItemImages`)
2. Category (`bingoCategoryImages`)
3. Emoji

Animals + signs (Recraft):

```bash
node scripts/generate-bingo-item-icons.mjs --placeholders-only
node scripts/generate-bingo-item-icons.mjs --pilot
node scripts/generate-bingo-item-icons.mjs
```

Vehicles + signs + animals (Cursor GenerateImage → flood-clear promote):

```bash
node scripts/promote-bingo-vehicle-icons.mjs --vehicles
node scripts/promote-bingo-vehicle-icons.mjs --signs
node scripts/promote-bingo-vehicle-icons.mjs --animals
```

Drafts: `assets/branding/drafts/v11-bingo-items/` (legacy),
`assets/branding/drafts/v11-bingo-vehicles/`,
`assets/branding/drafts/v11-bingo-signs/`,
`assets/branding/drafts/v11-bingo-animals/`.

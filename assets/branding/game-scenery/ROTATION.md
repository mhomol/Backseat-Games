# Game scenery rotation

Randomized **waiting room** and **in-game** backgrounds. Home, host setup, and join screens keep their fixed heroes.

Drop new PNG/WebP art in this folder, run `node scripts/promote-game-scenery.mjs your-file.png "Short label"`, then review the entry it adds to `src/data/gameSceneryRotation.ts`.

Target size: **720×1456** (same as `waiting-hero.webp`). The promote script resizes to cover, bottom-anchored.

## Currently in rotation

| ID | File | Label |
|----|------|-------|
| `rolling-hills` | `../waiting-hero.webp` | Rolling hills (original waiting room) |
| `countryside-blue-sky` | `countryside-blue-sky.webp` | Countryside & open road |
| `canyon-blue-sky` | `canyon-blue-sky.webp` | Desert canyon |
| `snowy-moose-blue-sky` | `snowy-moose-blue-sky.webp` | Snowy mountains & moose |

All players in a session see the same pick (derived from session id).

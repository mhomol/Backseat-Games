# Backseat Games Roadmap

This roadmap is intentionally lightweight. It captures product direction without turning family-game polish into a heavy planning process.

## Shipped: App Store v1.0

- Relay-only multiplayer with join codes
- Free joining and $0.99 host unlock
- License Plates, Travel Bingo, and Sign Game
- Foreground sound effects and haptics only
- App Store listing, privacy answers, screenshots, and TestFlight validation

## Current: Delight + Solo Offline v1.1

Goal: make the three launch games feel more custom to Backseat Games, and let unlocked hosts play alone without a relay or waiting room.

- Opening jingle (toggleable, cold-start only)
- Richer SFX palette with purposeful semi-truck horn moments
- Travel Bingo fill-cell icons + animals/signs per-item art (other categories keep category icons)
- License Plates landmark scenes for all 63 jurisdictions + simplified single-frame chrome
- Ambient scenery critters (plane, bird, gopher)
- First-run teaching that stresses one-time, for-life host unlock
- Claim / bingo / letter micro-animations
- Solo Mode on host setup: offline local play for all three games (no relay / lobby)
- Screenshot refresh after TestFlight validation

## Later: Retention And Family Utility

Goal: make the app more useful across repeat road trips.

- Local achievements tied to wins, plate discoveries, and bingo streaks
- Optional push notifications for host started game or join reminders
- More themed bingo packs for city, highway, mountains, beach, and nighttime drives
- Additional family-friendly games that fit short attention spans
- Better reconnect and host recovery if a host device leaves the session
- Remaining per-item bingo icons (vehicles, businesses, landmarks, scenery)

## Longer-Term Options

- Android support using the relay join-code path
- Host migration if the host phone dies
- Relay Sign Game audio snippets to other players, if privacy and review risk remain acceptable
- Patch-based state sync if full snapshots ever become a performance issue
- Family stats export or shareable road-trip recap

## Planning Notes

- Prefer polish on the existing three games before adding new games.
- Keep App Store review risk low: no background audio, no local-network permission, no analytics unless there is a clear reason.
- Treat the brand art as the north star for UI, icons, and sounds.
- Backlog details live in [BACKLOG.md](./BACKLOG.md).

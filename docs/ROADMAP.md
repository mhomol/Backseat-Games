# Backseat Games Roadmap

This roadmap is intentionally lightweight. It captures product direction without turning family-game polish into a heavy planning process.

## Shipped: App Store v1.0

- Relay-only multiplayer with join codes
- Free joining and $0.99 host unlock
- License Plates, Travel Bingo, and Sign Game
- Foreground sound effects and haptics only
- App Store listing, privacy answers, screenshots, and TestFlight validation

## On hold: Android (Play Store)

Paused until we can recruit enough Play testers. Do not treat Google Play as an active release track.

- Solo launch (free offline, Join / Play online gated Coming soon) — [PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md)
- Follow-up: Android Online + Play Billing (parity with iOS host unlock)

## Current: Delight + Solo Offline (iOS 1.2)

Shipped through App Store **1.2.1** (approved). Next marketing train: **1.3.0**.

Goal: make the three launch games feel more custom to Backseat Games, and let anyone play Solo Mode free without a relay or waiting room (pay only to host online).

- Opening jingle (toggleable, cold-start only)
- Richer SFX palette with purposeful semi-truck horn moments
- Travel Bingo fill-cell icons + animals/signs per-item art (other categories keep category icons)
- License Plates landmark scenes for all 63 jurisdictions + simplified single-frame chrome
- Ambient scenery critters (plane, bird, gopher)
- First-run teaching: solo free; pay once to host online
- Claim / bingo / letter micro-animations
- Solo Mode free on host setup (Play online off); IAP gates Play online / join codes
- Done: Screenshot refresh after TestFlight validation

## Shipped: P2 polish (existing games)

- Sign Game invalid words stay in the dialog with the invalid sting; voice skips low STT confidence when the API reports it
- Lifetime license-plate collection on this device (sticky after unclaim)
- Wider session scenery rotation (no GPS/season routing)
- StoreKit review prompt after a finished session (14-day cooldown)
- Fake-SignalR reconnect tests; host-gone banner when the host phone leaves (no host handoff)

## Later: Retention And Family Utility

Goal: make the app more useful across repeat road trips.

- Local achievements tied to wins, plate discoveries, and bingo streaks
- Optional push notifications for host started game or join reminders
- Additional family-friendly games that fit short attention spans (Hangman, vehicle color hunt — separate plan)

## Longer-Term Options

- Later IAP: purchasable game themes (full look-and-feel, including themed bingo packs) and purchasable animations
- Host migration if the host phone dies (not in the current phase — host must reopen or start a new code)
- Relay Sign Game audio snippets to other players, if privacy and review risk remain acceptable
- Patch-based state sync if full snapshots ever become a performance issue
- Family stats export or shareable road-trip recap

## Planning Notes

- Prefer polish on the existing three games before adding new games.
- Keep App Store review risk low: no background audio, no local-network permission, no analytics unless there is a clear reason.
- Treat the brand art as the north star for UI, icons, and sounds.
- Android / Google Play is on hold until tester recruitment is realistic.
- Backlog details live in [BACKLOG.md](./BACKLOG.md).

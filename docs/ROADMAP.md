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

## Shipped: Delight + Solo Offline (through iOS 1.3)

Shipped through App Store **1.3.0** (approved). Hangman + Color Catch shipped in 1.4.

- Opening jingle (toggleable, cold-start only)
- Richer SFX palette with purposeful semi-truck horn moments
- Travel Bingo fill-cell icons + animals/signs per-item art (other categories keep category icons)
- License Plates landmark scenes for all 63 jurisdictions + simplified single-frame chrome
- Ambient scenery critters (plane, bird, gopher)
- First-run teaching: solo free; pay once to host online
- Claim / bingo / letter micro-animations
- Solo Mode free on host setup (Play online off); IAP gates Play online / join codes
- Hangman + Color Catch (shipped in 1.4)
- Done: Screenshot refresh after TestFlight validation

## Shipped: iOS 1.4 — Hangman + Color Catch

**Live on the App Store October 14–15, 2026** (What's New: Hangman + Color Catch; five games).

- Done: Hangman + Color Catch feature content
- Done: Hangman aesthetic polish — wooden hitchhiker drawing, road-dash letter tiles, Wrong Way sign on a loss
- Done: Hangman Solo uses a local Easy/Medium/Hard word list (no internet needed)

## Shipped: iOS 1.5 — Holiday themes

**Live on the App Store October 20, 2026** (version **1.5.0**). All three themes shipped in **one** release.

- Done: Three non-consumable IAPs ($0.99 each): Halloween, Thanksgiving, and Christmas — not a bundle
  — Product IDs: `com.homolworks.backseatgames.theme_halloween`, `com.homolworks.backseatgames.theme_thanksgiving`, `com.homolworks.backseatgames.theme_christmas`
- Done: Home **Store** corner control (not a fourth post sign) → Store screen (browse / preview / buy / restore)
- Done: **Apply** owned themes in Settings (Classic is always free). Store "Use this theme" writes the same preference
- Done: Host's selected theme syncs on the session so the car matches; joiners do not need to buy
- Done: Themed home / host / waiting heroes and scenery ([HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md))
- Done: Themed bingo packs mixed with classic sights; Hangman hitchhiker (Classic) / skeleton (Halloween) / pilgrim (Thanksgiving) / snowman (Christmas)
- Done: Falling leaves / snow + themed win overlay + extra theme sounds
- Skipped (as planned): 63 plate regenerations, App Store icon swap, Android
- Halloween shipped even though it is late for Oct 31 — evergreen / available for next season
- Freeze: no other builds during peak travel windows (**Nov 16-25**, **Dec 20-Jan 3**) except hotfixes
- Detail and acceptance criteria in [BACKLOG.md](./BACKLOG.md)

## Next: Marketing — holiday themes

1.5 is live, so marketing is the active track (launch plan lives with the Homol Works bot).

- **Mon Nov 2, 2026:** Thanksgiving social blitz (feed posts, Stories, Reel, pinned X post) across Homol Works accounts
- Around **Nov 30, 2026**: swap App Store promo text / promo art from Thanksgiving to Christmas (no new build)
- Ongoing: listing, ratings, outreach

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
- Additional family-friendly games that fit short attention spans (beyond Hangman and Color Catch)

## Longer-Term Options

- Holiday themes shipped in **1.5** (live Oct 20, 2026) — see **Shipped: iOS 1.5** above
- Host migration if the host phone dies (not in the current phase — host must reopen or start a new code)
- Relay Sign Game audio snippets to other players, if privacy and review risk remain acceptable
- Patch-based state sync if full snapshots ever become a performance issue
- Family stats export or shareable road-trip recap

## Planning Notes

- Prefer polish on shipped games before adding more.
- Keep App Store review risk low: no background audio, no local-network permission, no analytics unless there is a clear reason.
- Treat the brand art as the north star for UI, icons, and sounds.
- Android / Google Play is on hold until tester recruitment is realistic.
- Backlog details live in [BACKLOG.md](./BACKLOG.md).

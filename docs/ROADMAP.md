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

## Next: Marketing push (parallel with 1.5)

1.4 is live. Marketing (listing, ratings, outreach) can run alongside 1.5 prep — do not wait for another feature ship. The launch plan lives with the Homol Works bot.

## Current build: iOS 1.5 — Holiday themes

Quick follow-up after 1.4. All three themes ship in **one** release (one review pass, nothing changing mid-travel). 1.4 is live; **accelerated submit target Oct 19–20, 2026** (today/tomorrow) after finishing and testing extra theme sounds.

- Version **1.5.0**
- Three non-consumable IAPs ($0.99 each): Halloween, Thanksgiving, and Christmas — not a bundle
  — Product IDs: `com.homolworks.backseatgames.theme_halloween`, `com.homolworks.backseatgames.theme_thanksgiving`, `com.homolworks.backseatgames.theme_christmas`
  — **Done (Oct 19):** all three IAPs created in App Store Connect
- Remaining before submit: finish + test extra theme sounds, then upload and submit
- Home **Store** corner control (not a fourth post sign) → Store screen (browse / preview / buy / restore)
- **Apply** owned themes in Settings (Classic is always free). Store "Use this theme" writes the same preference
- Host's selected theme syncs on the session so the car matches; joiners do not need to buy
- Themed home / host / waiting heroes and scenery (Flux Kontext, keep the car; manual Replicate until vetted — [HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md))
- Themed bingo packs mixed with classic sights; Hangman hitchhiker (Classic) / skeleton (Halloween) / pilgrim (Thanksgiving) / snowman (Christmas)
- Falling leaves / snow + themed win overlay
- Skip: 63 plate regenerations, App Store icon swap, Android
- Halloween ships in this release even though it goes live after Oct 31 — treat as evergreen / available for next season
- Target: **submit Oct 19–20, 2026** (accelerated; was ~Nov 13) so it is live well before Thanksgiving travel
- Soft-launch social posts drafted with Homol Works bot — publish when 1.5 goes live
- Around **Nov 30**: swap App Store promo text from Thanksgiving to Christmas (no new build)
- Freeze: no other builds during peak travel windows (**Nov 16-25**, **Dec 20-Jan 3**) except hotfixes
- Detail and acceptance criteria in [BACKLOG.md](./BACKLOG.md)

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

- Holiday themes shipped in **1.5** — see **Current build: iOS 1.5** above
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

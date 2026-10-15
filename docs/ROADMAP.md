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

Shipped through App Store **1.3.0** (approved). Feature content for the next train is Hangman + Color Catch (already in app); release is still open for polish.

- Opening jingle (toggleable, cold-start only)
- Richer SFX palette with purposeful semi-truck horn moments
- Travel Bingo fill-cell icons + animals/signs per-item art (other categories keep category icons)
- License Plates landmark scenes for all 63 jurisdictions + simplified single-frame chrome
- Ambient scenery critters (plane, bird, gopher)
- First-run teaching: solo free; pay once to host online
- Claim / bingo / letter micro-animations
- Solo Mode free on host setup (Play online off); IAP gates Play online / join codes
- Hangman + Color Catch (in app; shipping in 1.4 — see Current below)
- Done: Screenshot refresh after TestFlight validation

## Current: iOS 1.4 — submitted for App Store review

**Submitted for review October 13, 2026. Not live yet.**

Feature content: Hangman + Color Catch.

- Done: Hangman + Color Catch feature content
- Done: Hangman aesthetic polish — wooden hitchhiker drawing, road-dash letter tiles, Wrong Way sign on a loss
- Done: Hangman Solo uses a local Easy/Medium/Hard word list (no internet needed)
- Open: App Store approval, then release

## Next: Marketing push (begins when 1.4 is approved)

Priority for this product once 1.4 is approved: marketing push (listing, ratings, outreach — not more features first). The launch plan lives with the Homol Works bot.

## Current build: iOS 1.5 — Holiday themes

Quick follow-up after 1.4. Both themes ship in **one** release (one review pass, nothing changing mid-travel). Do not submit until 1.4 is approved (or rejected and replaced).

- Version **1.5.0**
- Two non-consumable IAPs (~$0.99 each): Thanksgiving and Christmas — not a bundle
  — Product IDs: `com.homolworks.backseatgames.theme_thanksgiving`, `com.homolworks.backseatgames.theme_christmas`
- Home **Store** corner control (not a fourth post sign) → Store screen (browse / preview / buy / restore)
- **Apply** owned themes in Settings (Classic is always free). Store “Use this theme” writes the same preference
- Host’s selected theme syncs on the session so the car matches; joiners do not need to buy
- Themed home / host / waiting heroes and scenery (Flux Kontext, keep the car; manual Replicate until vetted — [HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md))
- Themed bingo packs mixed with classic sights; Hangman pilgrim (Thanksgiving) / Santa (Christmas)
- Falling leaves / snow + themed win overlay
- Skip: 63 plate regenerations, App Store icon swap, Android
- Target: **submit by ~Nov 13, 2026** so it is live before Thanksgiving travel (Nov 25-26)
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

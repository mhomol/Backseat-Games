# Backseat Games Backlog

Backlog items are grouped by theme. Priority is directional, not a promise of delivery order.

## Brand And Visual Polish

- Done in v1.1: Travel Bingo category icons (animals, signs, vehicles, businesses, landmarks, scenery) with emoji fallback
- Done in v1.1: Travel Bingo fill-cell layout + animals/signs per-item icons
- Done in v1.1: License Plates landmark scenes (63) + simplified single-frame chrome + SPOTTED stamp
- Done in v1.1: Ambient scenery critters (plane, bird, gopher)
- Done: Per-item Travel Bingo icons for all six categories (150/150 unique PNGs)
- Done: Expand scenery rotation (10 session-hashed backgrounds)
  - Seasonal or route-based sets stay later (no GPS this phase).
- P3: ~~Transparent/cutout critter sprites (current drafts have white canvas)~~ done — edge flood-fill alpha
- P3: ~~Full Recraft-style regeneration of all 63 plate PNGs~~ done — landmark scenes

## Sound And Haptics

- Done in v1.1: Opening jingle + separate Settings toggle
- Done in v1.1: Claim / bingo / invalid / round-start palette
- Done in v1.1: Truck horn for big moments; lighter claim sounds for routine marks
- **P1 bug (fixed-pending-verification in 1.6.0):** Game sounds sometimes don't play on iPhone. Root cause: expo-audio deactivates the iOS session ~100ms after a clip ends (`keepAudioSessionActive` was unset). Device checklist is on the 1.6.0 PR.
- Done in 1.5.1 (live Oct 31, 2026): all-new 20-sound set + road-trip opening jingle
- **Resolved:** old `generate-sounds.mjs` / `generate-theme-sounds.mjs` were replaced in 650525a by `scripts/sounds/make_sounds.py` (`npm run generate:sounds`)
- Done in 1.6.0: round-start.wav and horn-car.wav wired; Settings Sound check row; iOS audio-session reliability fix
- P3: Kid-friendly voice or announcer stings
  - Optional "Bingo!", "Nice spot!", or "Road trip win!" callouts.

## Game Improvements

- Done in v1.1: First-run teaching (host vs join, free join, one-time for-life host unlock)
- Done in v1.1: Claim / bingo stamp / letter-advance micro-animations
- Done: Solo Mode (offline) on host setup for all five games; Hangman Solo uses a local Easy/Medium/Hard list
- Done: Hangman (solo or exactly two phones; wooden hitchhiker drawing with road-dash letter tiles and a Wrong Way sign on a loss; first to 5; Solo uses a local Easy/Medium/Hard word list — no internet needed)
- Done for 1.4: Hangman drawing / aesthetic polish
- Done: Color Catch (Travel Bingo-style 5×5 of vehicle colors, free center)
- Done: License Plates collection progress (lifetime spotted codes on this device)
- Done: Sign Game quality-of-life (invalid stays in the word dialog + invalid sound; skip low STT confidence when reported)
- P3: New game concepts
  - Road-trip scavenger hunt
  - Alphabet categories
  - "Would you rather?" family prompts

## Accessibility

- Done: Support Larger Accessibility Sizes on host setup
  - Setup card is height-capped above the game signs and scrolls so the signs stay tappable.
- Done: Keep the Host IAP sheet within the viewport at larger text sizes
  - Sheet respects the top/bottom safe area and scrolls so unlock, restore, and dismiss stay reachable.

## Multiplayer And Reliability

- Done: Relay reconnect is implemented (SignalR automatic reconnect, re-JOIN, connection banner)
- Done: Focused tests around session reconnect (fake SignalR; no Azure)
- Done: Host-gone copy — banner when the host phone leaves; no host handoff
- P3: Patch-based state sync

## App Store And Growth

- **1.4:** shipped on App Store ~Oct 14–15, 2026 (Hangman + Color Catch)
- **1.5:** shipped — **live on the App Store Oct 20, 2026** (Holiday themes: Halloween + Thanksgiving + Christmas, $0.99 each) — see Monetization below
- **1.5.1:** shipped - **live on the App Store Oct 31, 2026** (new sound set)
- **1.6.0:** prepare before the Nov 16 iOS freeze — sound reliability, wire unused SFX, Sound check, version housekeeping. Mike builds/submits locally (no EAS submit from CI).
- **Marketing (now):** Thanksgiving social blitz **Mon Nov 2, 2026** (underway); swap App Store promo Thanksgiving -> Christmas around **Nov 30, 2026** (launch plan lives with the Homol Works bot)

- Done: App Store 1.2.1 approved (delight + Solo offline + accessibility)
- Done: Refresh screenshots after delight art + solo setup lands
- Done: Ratings prompt after successful play sessions (StoreKit, 14-day cooldown)

## Monetization

- Done in v1.1: Stronger one-time for-life copy on first-run + HostUnlockSheet
- **Done in 1.5 (live Oct 20, 2026) — Holiday themes:** purchasable game themes (look-and-feel, including themed bingo packs) for Halloween, Thanksgiving, and Christmas, plus Hangman costumes and extra motion — not a free host-setup filter
  — Three SKUs ($0.99): `com.homolworks.backseatgames.theme_halloween`, `com.homolworks.backseatgames.theme_thanksgiving`, `com.homolworks.backseatgames.theme_christmas`
  — **Done (Oct 19):** all three IAPs created in App Store Connect
  — Store from home (corner control) + Settings apply picker
  — All three themes shipped in one release (1.5.0, live Oct 20, 2026), with extra theme sounds
  — Halloween shipped even though it went live close to Oct 31 — evergreen / available for next season
  — Next: Thanksgiving social blitz Mon Nov 2, 2026 (Homol Works bot)
  — Next: swap promo text Thanksgiving -> Christmas around Nov 30, 2026 (no new build)
  — No other builds Nov 16-25 or Dec 20-Jan 3 except hotfixes
  — Manual Flux Kontext Pro art first ([HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md)); do not automate Replicate until vetted
  — Acceptance criteria:
    — [x] Theme IAP products created in App Store Connect (three $0.99 SKUs)
    — [x] Themes purchasable via IAP (sandbox / TestFlight verify)
    — [x] Restore Purchases restores owned themes (and host unlock)
    — [x] A selected theme applies across all games
    — [x] Theme previews available before buying (Store)
    — [x] Applying an owned theme is done in Settings
    — [x] Host theme syncs to joiners without them buying
    — [x] Extra theme sounds finished and tested
    — [x] Hangman: hitchhiker / skeleton / pilgrim / snowman; Wrong Way on loss unchanged
    — [x] Home Store entry is a corner control, not a fourth post sign
- P3: Promo-code friendly UI

## Technical Debt

- P3: Checklist for plist-impacting plugins before every App Store submission
- Done in 1.6.0: `package-lock.json` root version matched to the app (`1.6.0`)
- P3: Christmas / Halloween / Thanksgiving IAP promo art and `scripts/compose-theme-iap-promo.mjs` are untracked - commit or ignore

## On hold: Android

Paused until we can recruit enough Play testers. Keep the existing Android gates and Play checklist, but do not prioritize further Play Store work.

- Android Solo Launch — Play internal + listing ([PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md))
- Android Online + Play Billing (join codes, host unlock parity)

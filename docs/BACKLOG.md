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
- **Marketing:** can run now in parallel with 1.5 (launch plan lives with the Homol Works bot)
- **1.5 (in progress):** Holiday themes (Halloween + Thanksgiving + Christmas) — see Monetization below; version **1.5.0**, submit **Oct 19–20, 2026** (accelerated; ASC IAPs created; theme sounds finishing)

- Done: App Store 1.2.1 approved (delight + Solo offline + accessibility)
- Done: Refresh screenshots after delight art + solo setup lands
- Done: Ratings prompt after successful play sessions (StoreKit, 14-day cooldown)

## Monetization

- Done in v1.1: Stronger one-time for-life copy on first-run + HostUnlockSheet
- **1.5 track — Holiday themes:** purchasable game themes (look-and-feel, including themed bingo packs) for Halloween, Thanksgiving, and Christmas, plus Hangman costumes and extra motion — not a free host-setup filter
  — Three SKUs ($0.99): `com.homolworks.backseatgames.theme_halloween`, `com.homolworks.backseatgames.theme_thanksgiving`, `com.homolworks.backseatgames.theme_christmas`
  — **Done (Oct 19):** all three IAPs created in App Store Connect
  — Store from home (corner control) + Settings apply picker
  — All three themes ship in one release; **submit Oct 19–20, 2026** after finishing/testing extra theme sounds (accelerated from ~Nov 13)
  — Halloween stays in this release even though it goes live after Oct 31 — evergreen / available for next season
  — Soft-launch social posts drafted with Homol Works bot — publish when 1.5 goes live
  — Swap promo text Thanksgiving -> Christmas around Nov 30 (no new build)
  — No other builds Nov 16-25 or Dec 20-Jan 3 except hotfixes
  — Manual Flux Kontext Pro art first ([HOLIDAY_THEMES.md](./HOLIDAY_THEMES.md)); do not automate Replicate until vetted
  — Acceptance criteria:
    — [x] Theme IAP products created in App Store Connect (three $0.99 SKUs)
    — [ ] Themes purchasable via IAP (sandbox / TestFlight verify)
    — [ ] Restore Purchases restores owned themes (and host unlock)
    — [ ] A selected theme applies across all games
    — [ ] Theme previews available before buying (Store)
    — [ ] Applying an owned theme is done in Settings
    — [ ] Host theme syncs to joiners without them buying
    — [ ] Extra theme sounds finished and tested
    — [ ] Hangman: hitchhiker / skeleton / pilgrim / snowman; Wrong Way on loss unchanged
    — [ ] Home Store entry is a corner control, not a fourth post sign
- P3: Promo-code friendly UI

## Technical Debt

- P3: Checklist for plist-impacting plugins before every App Store submission

## On hold: Android

Paused until we can recruit enough Play testers. Keep the existing Android gates and Play checklist, but do not prioritize further Play Store work.

- Android Solo Launch — Play internal + listing ([PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md))
- Android Online + Play Billing (join codes, host unlock parity)

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
- Done in v1.1: Solo Mode (offline) on host setup for all three games
- Later (separate plan): Hangman
  - Standard letter-guessing game where incorrect guesses progressively draw the hangman.
  - Define the word source, age-appropriate categories, turn rules, and win conditions.
  - Explore whether online multiplayer adds value and how guesses, turns, and the secret word should synchronize.
- Later (separate plan): Vehicle color hunt (working title)
  - Find vehicles of different colors while traveling.
  - Explore variants such as a shared checklist, individual randomized cards, color rarity, timed rounds, and vehicle-type combinations.
  - Choose a more distinctive, kid-friendly name before implementation.
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

- Done: App Store 1.2.1 approved (delight + Solo offline + accessibility)
- Done: Refresh screenshots after delight art + solo setup lands
- Done: Ratings prompt after successful play sessions (StoreKit, 14-day cooldown)

## Monetization

- Done in v1.1: Stronger one-time for-life copy on first-run + HostUnlockSheet
- Later IAP: purchasable game themes (new look-and-feel, including themed bingo packs) plus purchasable animations — not a free host-setup filter
- P3: Promo-code friendly UI

## Technical Debt

- P3: Checklist for plist-impacting plugins before every App Store submission

## On hold: Android

Paused until we can recruit enough Play testers. Keep the existing Android gates and Play checklist, but do not prioritize further Play Store work.

- Android Solo Launch — Play internal + listing ([PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md))
- Android Online + Play Billing (join codes, host unlock parity)

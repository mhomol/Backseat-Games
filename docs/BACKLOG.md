# Backseat Games Backlog

Backlog items are grouped by theme. Priority is directional, not a promise of delivery order.

## Brand And Visual Polish

- Done in v1.1: Travel Bingo category icons (animals, signs, vehicles, businesses, landmarks, scenery) with emoji fallback
- Done in v1.1: Travel Bingo fill-cell layout + animals/signs per-item icons
- Done in v1.1: License Plates landmark scenes (63) + simplified single-frame chrome + SPOTTED stamp
- Done in v1.1: Ambient scenery critters (plane, bird, gopher)
- P2: Remaining per-item Travel Bingo icons (vehicles, businesses, landmarks, scenery)
- P2: Expand scenery rotation
  - Add more road-trip backgrounds for repeat play.
  - Consider seasonal or route-based sets later.
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
- P2: Hangman
  - Standard letter-guessing game where incorrect guesses progressively draw the hangman.
  - Define the word source, age-appropriate categories, turn rules, and win conditions.
  - Explore whether online multiplayer adds value and how guesses, turns, and the secret word should synchronize.
- P2: Vehicle color hunt (working title)
  - Find vehicles of different colors while traveling.
  - Explore variants such as a shared checklist, individual randomized cards, color rarity, timed rounds, and vehicle-type combinations.
  - Choose a more distinctive, kid-friendly name before implementation.
- P2: Travel Bingo themed packs
  - Highway, city, mountains, beach, small town, construction, nighttime.
- P2: License Plates collection progress
- P2: Sign Game quality-of-life (voice confidence, clearer invalid feedback)
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
- P2: Focused tests around session reconnect
- P2: Host recovery / host migration decision
- P3: Patch-based state sync

## App Store And Growth

- P1: TestFlight build + App Store submission for delight + Solo offline (foreground audio note; marketing version is 1.2.0)
- Done: Refresh screenshots after delight art + solo setup lands
- P2: Ratings prompt after successful play sessions

## Monetization

- Done in v1.1: Stronger one-time for-life copy on first-run + HostUnlockSheet
- P3: Promo-code friendly UI

## Technical Debt

- P3: Checklist for plist-impacting plugins before every App Store submission

## On hold: Android

Paused until we can recruit enough Play testers. Keep the existing Android gates and Play checklist, but do not prioritize further Play Store work.

- Android Solo Launch — Play internal + listing ([PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md))
- Android Online + Play Billing (join codes, host unlock parity)


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

- P1: Support Larger Accessibility Sizes on host setup
  - The setup section box currently grows over and obscures the game signs.
  - Make the layout adapt or scroll while keeping the game choices visible and reachable.
- P1: Keep the Host IAP sheet within the viewport at larger text sizes
  - The additional text currently pushes the dialog past the top edge of smaller phones.
  - Respect safe areas and allow scrolling without hiding purchase, restore, or dismiss controls.

## Multiplayer And Reliability

- P1: Keep relay reconnect behavior battle-tested
- P2: Host recovery / host migration decision
- P3: Patch-based state sync

## App Store And Growth

- P1: v1.1 TestFlight build + App Store submission (Delight + Solo offline; foreground audio note)
- P2: Refresh screenshots after delight art + solo setup lands
- P2: Ratings prompt after successful play sessions

## Monetization

- Done in v1.1: Stronger one-time for-life copy on first-run + HostUnlockSheet
- P3: Promo-code friendly UI

## Technical Debt

- P1: Keep permissions minimal (no background audio, no local network)
- P2: Focused tests around session reconnect
- P3: Checklist for plist-impacting plugins before every App Store submission

## Longer-term

- Android / Google Play (hosting already free on non-iOS in code)


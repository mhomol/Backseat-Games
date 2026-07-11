# Backseat Games Backlog

Backlog items are grouped by theme. Priority is directional, not a promise of delivery order.

## Brand And Visual Polish

- P1: Transition Travel Bingo to on-brand icons
  - Create a small icon set that matches the Recraft V4 road-trip art style.
  - Start with the most common bingo items so the card stays readable.
  - Keep text labels available for accessibility and quick recognition.

- P1: Revisit License Plates visuals
  - Explore a more on-brand board treatment while preserving fast scanning.
  - Consider illustrated plate tiles, state-region grouping, or a playful road-map frame.
  - Avoid adding visual noise that makes claiming plates slower in the car.

- P2: Add small game-moment animations
  - Plate claimed, bingo square marked, Sign Game letter advanced, and winner reveal.
  - Prefer short, low-motion animations that do not slow gameplay.

- P2: Expand scenery rotation
  - Add more road-trip backgrounds for repeat play.
  - Consider seasonal or route-based sets later.

## Sound And Haptics

- P1: Add semi-truck horn moments to gameplay
  - Use truck horn feedback for satisfying moments like first bingo, rare plate claims, or round wins.
  - Tune frequency so sounds feel fun, not noisy.
  - Keep all audio foreground-only for App Store review safety.

- P2: Build a small sound palette
  - Distinct sounds for tap, claim, bingo, win, invalid action, and round start.
  - Keep settings simple: sound effects on/off and haptics on/off.

- P3: Add kid-friendly voice or announcer stings
  - Optional "Bingo!", "Nice spot!", or "Road trip win!" callouts.
  - Revisit only if they improve delight without becoming annoying.

## Game Improvements

- P1: Improve first-run game teaching
  - Add concise "how this works" cards before the first hosted game.
  - Make host-vs-passenger roles obvious.

- P2: Travel Bingo themed packs
  - Highway, city, mountains, beach, small town, construction, nighttime.
  - Let the host pick a pack or use a balanced mixed deck.

- P2: License Plates collection progress
  - Show local lifetime discoveries across trips.
  - Consider a simple "states spotted" collection screen.

- P2: Sign Game quality-of-life
  - Improve voice-entry confidence handling.
  - Add clearer feedback for duplicate or invalid words.

- P3: New game concepts
  - Car color hunt
  - Road-trip scavenger hunt
  - Alphabet categories
  - "Would you rather?" family prompts

## Multiplayer And Reliability

- P1: Keep relay reconnect behavior battle-tested
  - Validate host and joiner reconnect from real TestFlight builds.
  - Keep the join-code path as the only production multiplayer model.

- P2: Host recovery
  - Explore what happens when the host app closes, loses network, or the phone dies.
  - Decide whether host migration is worth the complexity.

- P3: Patch-based state sync
  - Only revisit if full state snapshots become too slow or noisy.

## App Store And Growth

- P1: App Review resubmission follow-up
  - Verify new build does not declare background audio.
  - Include the review note that sound effects only play during active gameplay.

- P2: Store listing iteration
  - Refresh screenshots after icon and visual polish.
  - Add a short demo preview once the first App Store approval is complete.

- P2: Ratings prompt
  - Add a gentle prompt after successful play sessions.
  - Avoid interrupting the game or showing it too early.

## Monetization

- P2: Host unlock messaging
  - Make it very clear passengers join free.
  - Confirm the $0.99 value proposition in onboarding and App Store copy.

- P3: Promo-code friendly UI
  - Add a simple place to restore or explain unlocks for family testing and giveaways.

## Technical Debt

- P1: Keep permissions minimal
  - No background audio unless the app truly supports it.
  - No local-network permission unless local discovery returns.

- P2: Add focused tests around session reconnect
  - Cover host rejoin, player identity persistence, and join-code failure states.

- P3: Track native build configuration changes
  - Add a quick checklist for plist-impacting plugins before every App Store submission.

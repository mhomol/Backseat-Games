# Features & Rules

How to play Backseat Games — written for family testers, not engineers.

## Getting started

### Who should host?

Typically the front-seat parent on their phone. The host picks the game, waits for everyone to join, and taps **Start Game**.

**Pricing:** Joining is **free** for everyone. Starting a game (hosting) requires a **one-time $1.99 in-app purchase** on iPhone — see [MONETIZATION.md](./MONETIZATION.md). Passengers never pay.

### How to join

1. Open **Backseat Games** on your phone.
2. Tap **Join a Game**.
3. Enter your name (e.g. Emma, Dad).
4. Enter the **join code** the host reads from their waiting room (e.g. `AB-12CD`). Works on cellular or Wi‑Fi.
5. Wait in the **Waiting room** until the host starts.

**Optional on iPhone:** If everyone is on the same Wi‑Fi or Personal Hotspot, you may also tap a game under **Nearby games** instead of using a code.

### Waiting room

- Host sees a large **join code** to share with passengers, plus all joined players and the selected game type.
- Joiners see a spinner: "Waiting for host to start…"
- Host taps **Start Game!** when everyone is ready.
- Competitive games (License Plates, Sign Game) need **at least one other player**. Travel Bingo can be played solo for practice.

---

## Car rules

Default rules live in **Settings**. When you host, the waiting room copies those defaults — you can tweak rules for that trip before tapping **Start Game!** without changing your saved defaults. Everyone in the lobby sees the rules for that session.

## Your record (this device)

**Settings → Your record** shows wins, losses, and ties (**W–L–T**) for each game type. Stats are saved on **this iPhone only** — no internet or Game Center required. A round counts when the game reaches the finished celebration (host ends the game, or someone wins bingo/sign spotting). Ties and “nobody scored” endings count in the **T** column. Each phone tracks its own player in the car.

## Shared behavior

### Scoreboards

License Plates and Sign Game show live scores at the top. Travel Bingo announces a winner with a celebration animation.

### Error messages

If you break a rule, you'll see a friendly popup — for example:

- "Already claimed by Emma."
- "That word was already used by someone else."
- "Word must start with H."

### If someone disconnects (MVP)

If a player closes the app, they remain listed but may not receive updates. The host keeps running. Rejoining the same session in MVP starts fresh — full reconnect handling is a future improvement.

---

## License Plates

Spot license plates from US states and Canadian provinces/territories. First to **claim** a plate gets the point.

### Rules

1. The grid shows **63 plates** in alphabetical order by name.
2. When you spot a plate, **tap** its cell to claim it.
3. **Tap again** to unclaim a plate you hold (removes your point).
4. Once someone claims a plate, it is **locked** for everyone else.
5. Your score = number of plates you currently hold.

### Visual cues

Each cell shows a **stylized plate image** (jurisdiction accent colors) with the state/province code and name overlaid in the app. Plate tiles use a wide rectangular shape like real plates.

| State | Meaning |
|-------|---------|
| Full-color plate image | Available |
| Green tint overlay | You claimed it |
| Gray tint overlay + player name | Someone else claimed it |

### Ending the game

The host taps the red **End Game** button at the bottom of the screen to finish the round (with a confirmation dialog). Everyone sees final scores and a winner celebration (most plates claimed wins; ties show shared leaders). Swipe-back and header back are disabled during play.

Plate artwork lives in `assets/plates/` (regenerate with `npm run generate:plates`). See `scripts/plates/style-guide.md`.

---

## Travel Bingo

Each player gets a **unique 5×5 card** with road-trip sights. First to get **bingo** wins.

### Rules

1. Cards are generated when the host starts — no two cards are alike.
2. The center square is a free **"Road Trip!"** space (always marked).
3. When you spot something on your card, **tap** the square to mark it.
4. **Tap again** to unmark (except the free center).
5. First player to complete any **row, column, or diagonal** wins.

### What's on the cards?

Animals, vehicles, road signs, landmarks, scenery, and roadside businesses — drawn from a pool of ~150 items (cow, red barn, golden arches, wind turbine, etc.).

---

## Sign Game

Race from **A to Z** using words on road signs. Each player advances **independently** — first to finish Z wins.

### Rules

1. You start on letter **A**.
2. When you spot a valid word, tap **"I found one!"**, type the word (or say it if voice input is on in car rules), and submit.
3. After a valid submission, you advance to the next letter.
4. **Duplicate words are not allowed** — once anyone uses a word, nobody else can.
5. You cannot skip letters.

### Letter matching (car rules)

| Letters | Rule |
|---------|------|
| A–P, R–Y | Word must **start with** the letter |
| **Q, X, Z** | Letter must **appear anywhere** in the word |

Examples:

- On **B**: "Bridge" ✓
- On **Q**: "BBQ" ✓ (contains Q)
- On **X**: "Exit" ✓ (contains X)
- On **Q**: "Queen" ✓ (starts with Q — also valid)

### Voice input (optional car rule)

When enabled in car rules, tap **Say the word** in the submit dialog. Your phone converts speech to text — other players see the typed word, not audio.

---

## FAQ / Troubleshooting

### Players can't find the host

1. Make sure the host created a waiting room (not just sitting on the home screen).
2. Keep both apps **open in the foreground**.
3. Connect all phones to the **same Personal Hotspot** (usually the host's or a parent's phone).
4. Tap **Refresh** on the Join screen.

### App stopped syncing

- iOS limits background networking. Keep Backseat Games **open and on screen** during play.
- If sync stops, ask the host to restart the session.

### How many players?

Designed for **2–6** family members. More may work but isn't tested.

### Minimum iOS version

Follows Expo SDK 56 requirements (iOS 15.1+).

### TestFlight install

1. Accept the TestFlight invite email on each iPhone.
2. Install **TestFlight** from the App Store.
3. Open TestFlight → **Backseat Games (road trip fun)** → Install. (The icon on your home screen still shows as **Backseat Games**.)
4. For multiplayer testing, use the installed TestFlight build (not Expo Go).

---

## Car rules changelog

These differ slightly from how some families played growing up:

| Classic habit | Backseat Games behavior |
|---------------|-------------------------|
| Q/X/Z must start the word | Q, X, Z: letter anywhere in word (configurable car rule — enforced as documented above) |
| Sign game shared letter | Individual A→Z race (first to Z wins) |
| License plate pen and paper | Digital grid with tap to claim/unclaim |

---

## Known limitations (MVP)

- No Android support yet
- No cloud accounts or cross-trip leaderboards
- Voice input requires a TestFlight/dev build (not Expo Go)
- Host migration not supported if host phone dies
- App must stay in foreground for reliable multiplayer sync
- **Push notifications:** entitlement is included in native builds, but no alerts are sent yet (see [PUSH_SETUP.md](./PUSH_SETUP.md))

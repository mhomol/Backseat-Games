# Features & Rules

How to play Backseat Games — written for family testers, not engineers.

## Getting started

### Who should host?

Typically the front-seat parent on their phone. The host picks the game, waits for everyone to join, and taps **Start Game**.

### How to join

1. Open **Backseat Games** on your iPhone.
2. Tap **Join a Game**.
3. Enter your name (e.g. Emma, Dad).
4. Tap the host's session when it appears in **Nearby games**.
5. Wait in the **Waiting room** until the host starts.

If no sessions appear after ~30 seconds, ask the host to confirm they created a room. Try connecting all phones to the same **Personal Hotspot** (see FAQ).

### Waiting room

- Host sees all joined players and the selected game type.
- Joiners see a spinner: "Waiting for host to start…"
- Host taps **Start Game!** when everyone is ready.
- Competitive games (License Plates, Sign Game) need **at least one other player**. Travel Bingo can be played solo for practice.

---

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

| State | Meaning |
|-------|---------|
| White / colored border | Available |
| Green highlight | You claimed it |
| Gray with name | Someone else claimed it |

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
2. When you spot a valid word, tap **"I found one!"**, type the word, optionally record yourself saying it, and submit.
3. After a valid submission, you advance to the next letter.
4. **Duplicate words are not allowed** — once anyone uses a word, nobody else can.
5. You cannot skip letters.

### Letter matching (house rules)

| Letters | Rule |
|---------|------|
| A–P, R–Y | Word must **start with** the letter |
| **Q, X, Z** | Letter must **appear anywhere** in the word |

Examples:

- On **B**: "Bridge" ✓
- On **Q**: "BBQ" ✓ (contains Q)
- On **X**: "Exit" ✓ (contains X)
- On **Q**: "Queen" ✓ (starts with Q — also valid)

### Audio

You can record a short clip when you call out your find. Recordings stay on **your phone** for playback — other players see the word but don't hear your clip in MVP.

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

## House rules changelog

These differ slightly from how some families played growing up:

| Classic habit | Backseat Games behavior |
|---------------|-------------------------|
| Q/X/Z must start the word | Q, X, Z: letter anywhere in word (configurable house rule — enforced as documented above) |
| Sign game shared letter | Individual A→Z race (first to Z wins) |
| License plate pen and paper | Digital grid with tap to claim/unclaim |

---

## Known limitations (MVP)

- No Android support yet
- No cloud accounts or cross-trip leaderboards
- Sign game audio is local-only (not streamed to other players)
- Host migration not supported if host phone dies
- App must stay in foreground for reliable multiplayer sync
- **Push notifications:** entitlement is included in native builds, but no alerts are sent yet (see [PUSH_SETUP.md](./PUSH_SETUP.md))

# Backseat Games

**Classic road-trip fun for the whole car.**

> **App Store / TestFlight listing name:** Backseat Games (road trip fun)  
> **Home screen name:** Backseat Games

Backseat Games is an iPhone app that brings classic family car games to everyone's phone — License Plates, Travel Bingo, and the Sign Game. One person hosts a session; passengers join with a **join code** (works on cellular or Wi‑Fi).

**Pricing:** Free to download and join games. **$0.99 one-time** in-app purchase unlocks hosting (start a session for the car). See [docs/MONETIZATION.md](docs/MONETIZATION.md).

## Games included

- **[License Plates](docs/FEATURES.md#license-plates)** — spot and claim state/province plates on a visual grid
- **[Travel Bingo](docs/FEATURES.md#travel-bingo)** — unique 5×5 cards with road-trip sights
- **[Sign Game](docs/FEATURES.md#sign-game)** — race A→Z with audio call-outs

## Screenshots

_Screenshots will be added before TestFlight. Run the app in Expo Go to preview UI._

## Tech stack

- **Expo (React Native) + TypeScript**
- **expo-router** for navigation
- **Zustand** for session state
- **Join-code multiplayer** — SignalR relay on Azure
- **expo-audio** for Sign Game recordings
- **Lottie** for win celebrations

## Prerequisites

- Node.js 20+
- npm
- [Expo Go](https://expo.dev/go) on a physical iPhone (recommended)
- Apple Developer account ($99/yr) for TestFlight / App Store builds

## Quick start (Windows)

```bash
git clone <repo-url>
cd Homol-Rides
npm install
npx expo start
```

Scan the QR code with your iPhone camera to open in **Expo Go**.

> **Note:** Expo Go uses a **mock multiplayer adapter** for single-device UI dev. Real join-code multiplayer requires a **TestFlight or release build**. **In-app purchases** (host unlock) also require TestFlight/release — not Expo Go.

## Development build (mic + TestFlight)

When you need microphone recording or a device build for TestFlight:

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform ios
```

Install the resulting build on family iPhones via the link EAS provides, then run:

```bash
npx expo start --dev-client
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the multiplayer protocol and [docs/FEATURES.md](docs/FEATURES.md) for game rules.

## Project structure

```
app/                  expo-router screens (Home, Lobby, Games)
src/
  components/         Shared UI (BigButton, Scoreboard, …)
  data/               plates.json, bingo-items.json
  games/              Rule engine per game
  hooks/              useSignGameSpeech
  multiplayer/        Mock (Expo Go) + relay adapters
  store/              Zustand session store
  theme/              Cartoon design tokens
  types/              Shared TypeScript types
docs/
  ARCHITECTURE.md     System design
  FEATURES.md         Player-facing rules & FAQ
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Rule engine unit tests |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — multiplayer, rule engine, state model
- [Features & rules](docs/FEATURES.md) — how to play, troubleshooting
- [Monetization](docs/MONETIZATION.md) — host unlock IAP, sandbox testing

## TestFlight (recommended — no EAS cloud quota)

Use **GitHub Actions** with `eas build --local` on `macos-26` runners (same pattern as Memento Mori / Homol Invests):

1. One-time setup: [docs/TESTFLIGHT_CI.md](docs/TESTFLIGHT_CI.md) — `testflight` environment, Apple signing secrets, `EXPO_TOKEN`.
2. Run **Actions → iOS TestFlight → Run workflow** on `master`.
3. Install from TestFlight when App Store Connect finishes processing (~5–15 min).

Build numbers come from GitHub `run_number` via [`app.config.js`](app.config.js).

### Optional (uses EAS cloud quota)

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

## License

Private — Homol family project.

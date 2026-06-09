# Backseat Games

**Classic road-trip fun for the whole car.**

Backseat Games is an iPhone app that brings classic family car games to everyone's phone — License Plates, Travel Bingo, and the Sign Game. One person hosts a session; everyone else joins over local peer-to-peer networking. No internet, no accounts.

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
- **Multipeer Connectivity** (iOS dev/production builds) with mock networking in Expo Go
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

> **Note:** Multipeer networking uses a **mock adapter** in Expo Go so you can build UI and rules on one device. Real in-car multiplayer requires an **EAS development build** (see below).

## Development build (Multipeer + mic)

When you need native Multipeer Connectivity or microphone recording on device:

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
  hooks/              useSignGameAudio
  multiplayer/        Mock + native Multipeer adapters
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

## TestFlight

1. Configure `eas.json` with your Apple Team ID and App Store Connect app ID.
2. Create the app record **Backseat Games** in App Store Connect.
3. Run `eas build --profile production --platform ios`.
4. Run `eas submit --platform ios`.

## License

Private — Homol family project.

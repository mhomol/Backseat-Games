# App Store v1 release checklist

Complete this **after** gameplay playtesting with Grace and TestFlight validation of host-unlock IAP. See [MONETIZATION.md](./MONETIZATION.md) and [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md).

## Already in the codebase


| Item                      | Location                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| Bundle ID                 | `com.homolworks.backseatgames` — [app.config.js](../app.config.js) |
| Home screen name          | `Backseat Games`                                                   |
| App Store Connect name    | **Backseat Games (road trip fun)**                                 |
| Icon, splash, permissions | [app.config.js](../app.config.js)                                  |
| Export encryption         | `ITSAppUsesNonExemptEncryption: false`                             |
| Host unlock IAP           | Product ID `com.homolworks.backseatgames.host_unlock`              |
| Privacy policy            | https://mhomol.github.io/Backseat-Games-Site/privacy.html          |
| Support URL (in-app)      | https://mhomol.github.io/Backseat-Games-Site/support.html          |


Everything below is **App Store Connect** (browser) unless noted.

---

## Phase 1 — Account prerequisites

- [x] **Paid Apps Agreement** active (Agreements, Tax, and Banking)
- [x] App record exists: **Backseat Games (road trip fun)**
- [x] IAP product created — non-consumable, **$0.99** (Tier 1), **Ready to Submit** — update price in App Store Connect if still at $1.99 ([MONETIZATION.md](./MONETIZATION.md))

---

## Phase 2 — App Information

- [x] **Subtitle** (30 chars) — e.g. `Road trip games for the car`
- [x] **Primary category** — Games → Family (or Travel)
- [x] **Secondary category** — optional
- [x] **Age rating** questionnaire — expect 4+; declare local network + optional mic honestly
- [x] **Privacy Policy URL** — https://mhomol.github.io/Backseat-Games-Site/privacy.html
- [x] **Support URL** — https://mhomol.github.io/Backseat-Games-Site/support.html

---

## Phase 3 — Privacy Nutrition Label

Declare honestly:

- Player display name — passed through ephemeral relay during active games; not linked to accounts, not used for tracking
- Game state — ephemeral relay during active sessions only
- Sign Game audio — optional, session-local (not relayed)
- Purchases — via Apple IAP only
- Internet — join-code multiplayer relay
- Local network + microphone — optional iOS nearby play / voice input

---

## Phase 4 — Listing copy (Version 1.0)

**Promotional text** (170 chars):

> Turn road trips into a game. License plates, sign spotting, and travel bingo — one phone hosts, passengers join with a code.

**Description** (paste into App Store Connect — 4,000 char max):

> Turn long drives into play time. Backseat Games brings classic road-trip games to one phone: the host runs the session, passengers join with a short code, and everyone plays together from the back seat.
>
> HOW IT WORKS
> One person taps Start a Game and shares a join code from the waiting room. Everyone else enters the code on their own phone — works on cellular or Wi‑Fi, no accounts, no sign-up. When the crew is ready, the host starts the round and scores stay in sync for the whole trip.
>
> THREE GAMES FOR THE CAR
>
> License Plates — Spot plates from US states and Canadian provinces. Tap to claim on a shared grid; most plates when the host ends the round wins.
>
> Sign Game — Race from A to Z using words on road signs. Each player advances at their own pace. First to reach Z wins.
>
> Travel Bingo — Everyone gets a unique 5×5 card filled with things to spot along the road. First bingo — a row, column, or diagonal — wins.
>
> BUILT FOR FAMILY ROAD TRIPS
> • Car rules — Set defaults in Settings, then tweak rules per trip in the waiting room
> • Share invite — Send a link so passengers can join with the code pre-filled
> • Your record — Wins, losses, and ties tracked on each phone (no Game Center required)
> • Rejoin mid-trip — Same join code and name if someone loses signal
> • Optional voice input in Sign Game — Say the word instead of typing
>
> PRICING
> • Free to download; passengers join for free
> • One-time $0.99 unlock to host and start games on your Apple ID
> • Three games included — no subscriptions
>
> No ads. No login. Just games for the drive.

**Keywords** (100 chars):

```
road trip,car games,family,bingo,license plate,travel,kids,offline,multiplayer,vacation
```

**What’s New:**

> Initial release — host road-trip games for the whole car.

---

## Phase 5 — Screenshots

Capture from **TestFlight on a physical iPhone**, then resize for App Store Connect:

```bash
# 1. Drop PNG/JPG captures into assets/marketing/app-store-screenshots/raw/
# 2. Run:
npm run prepare:app-store-screenshots
# 3. Upload JPEGs from assets/marketing/app-store-screenshots/output/
```

| Slot | Output folder | Resolution | Notes |
| ---- | ------------- | ---------- | ----- |
| 6.9" | `output/6.9-inch/` | 1320 × 2868 | Preferred primary tier (2026) |
| 6.5" | `output/6.5-inch/` | 1284 × 2778 | Required tier if 6.9" not uploaded |
| 6.3" | `output/6.3-inch/` | 1206 × 2622 | Optional — iPhone 17 native |

Suggested screens: Home, host setup, lobby, game, settings/paywall.

The script flattens transparency (fixes ASC “alpha channel” errors) and exports opaque JPEG.

### App Previews (optional screen recordings)

```bash
# 1. Drop .mov/.mp4 screen recordings into assets/marketing/app-store-previews/raw/
# 2. Run:
npm run prepare:app-store-previews
# 3. Upload MP4s from assets/marketing/app-store-previews/output/iphone-preview/
```

Preview videos use **886 × 1920** (not screenshot dimensions). See [assets/marketing/app-store-previews/README.md](../assets/marketing/app-store-previews/README.md).

iPhone only for v1 (`supportsTablet: false` in [app.config.js](../app.config.js)) — no iPad screenshots required.

---

## Phase 6 — Pricing

- [ ] App price: **Free**
- [ ] In-App Purchases: **Yes** — `host_unlock` at **$0.99** (Tier 1 in App Store Connect)
- [ ] Countries: start with US (expand as needed)
- [ ] Regenerate IAP review/promo images if ASC still shows old price (`node scripts/prepare-iap-review-screenshot.mjs`)

---

## Phase 7 — Submit

- [x] Playtesting sign-off (family road trip — Travel Bingo + Sign Game validated)
- [ ] TestFlight sandbox IAP + restore verified at **$0.99**
- [ ] Upload build (GitHub Actions iOS TestFlight workflow)
- [ ] Select build on version 1.0
- [ ] Attach `host_unlock` IAP to submission
- [ ] **App Review notes:**

```
Backseat Games is family road-trip multiplayer.

- No login.
- Join is free. Start/host requires one-time $0.99 IAP.
- Multiplayer: host shares a 6-character join code (internet relay). Nearby join on iPhone is optional same-Wi‑Fi only — join code works on cellular.
- Microphone optional (Sign Game voice input only).
- Rejoin: enter the same join code and player name if disconnected mid-trip.

IAP: sandbox Apple ID on Start a Game.
Multiplayer: host reads join code from waiting room; joiner enters code on Join screen.
```

- [ ] Export compliance: No (non-exempt encryption already declared in app)
- [ ] Submit for Review

---

## After approval

- [ ] Smoke-test production listing and IAP
- [ ] Add App Store screenshots to README

## Related

- [MONETIZATION.md](./MONETIZATION.md) — IAP product setup
- [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md) — build upload + IAP sandbox testing
- [FEATURES.md](./FEATURES.md) — player-facing rules


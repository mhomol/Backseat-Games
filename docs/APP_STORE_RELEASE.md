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

**Description** — include:

- Free download; join free
- $0.99 one-time host unlock
- Three games, local multiplayer, no accounts, works offline on the trip

**Keywords** (100 chars):

```
road trip,car games,family,bingo,license plate,travel,kids,offline,multiplayer,vacation
```

**What’s New:**

> Initial release — host road-trip games for the whole car.

---

## Phase 5 — Screenshots

Capture from **TestFlight on a physical iPhone**.


| Size | Resolution  | Suggested screens                               |
| ---- | ----------- | ----------------------------------------------- |
| 6.7" | 1290 × 2796 | Home, host setup, lobby, game, settings/paywall |
| 6.5" | 1284 × 2778 | Same set                                        |


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


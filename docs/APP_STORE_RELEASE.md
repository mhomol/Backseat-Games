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
| Privacy policy            | [PRIVACY.md](../PRIVACY.md)                                        |
| Support URL (in-app)      | GitHub Issues — [src/constants/urls.ts](../src/constants/urls.ts)  |


Everything below is **App Store Connect** (browser) unless noted.

---

## Phase 1 — Account prerequisites

- [x] **Paid Apps Agreement** active (Agreements, Tax, and Banking)
- [x] App record exists: **Backseat Games (road trip fun)**
- [ ] IAP product created — non-consumable, $1.99, **Ready to Submit** ([MONETIZATION.md](./MONETIZATION.md))

---

## Phase 2 — App Information

- [x] **Subtitle** (30 chars) — e.g. `Road trip games for the car`
- [x] **Primary category** — Games → Family (or Travel)
- [x] **Secondary category** — optional
- [x] **Age rating** questionnaire — expect 4+; declare local network + optional mic honestly
- [ ] **Privacy Policy URL** — `https://github.com/Homol-Works/Homol-Rides/blob/master/PRIVACY.md`
- [ ] **Support URL** — `https://github.com/Homol-Works/Homol-Rides/issues`

---

## Phase 3 — Privacy Nutrition Label

No backend / no analytics in v1. Declare on-device only:

- Player display name — not linked, not used for tracking
- Sign Game audio — optional, session-local
- Purchases — via Apple IAP only
- Local network + microphone — capability disclosure

---

## Phase 4 — Listing copy (Version 1.0)

**Promotional text** (170 chars):

> Turn road trips into a game. License plates, sign spotting, and travel bingo — one phone hosts, everyone nearby joins. No internet needed.

**Description** — include:

- Free download; join free
- $1.99 one-time host unlock
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


iPad supported in app — provide iPad screenshots or decide to drop tablet support before v1.

---

## Phase 6 — Pricing

- [ ] App price: **Free**
- [ ] In-App Purchases: **Yes**
- [ ] Countries: start with US (expand as needed)

---

## Phase 7 — Submit

- [ ] Playtesting sign-off (you + Grace)
- [ ] TestFlight sandbox IAP + restore verified
- [ ] Upload build (GitHub Actions iOS TestFlight workflow)
- [ ] Select build on version 1.0
- [ ] Attach `host_unlock` IAP to submission
- [ ] **App Review notes:**

```
Backseat Games is offline local-network multiplayer for family road trips.

- No login. No backend.
- Join is free. Start/host requires one-time $1.99 IAP.
- Multiplayer uses local network between nearby devices.
- Microphone optional (Sign Game only).

IAP: sandbox Apple ID on Start a Game.
Multiplayer: two devices on same Wi‑Fi or Personal Hotspot.
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


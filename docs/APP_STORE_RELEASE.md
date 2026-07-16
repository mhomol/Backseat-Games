# App Store v1 release checklist

Complete this **after** gameplay playtesting with Grace and TestFlight validation of host-unlock IAP. See [MONETIZATION.md](./MONETIZATION.md) and [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md).

## Already in the codebase


| Item                      | Location                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Bundle ID                 | `com.homolworks.backseatgames` — [app.config.js](../app.config.js)                                                     |
| Home screen name          | `Backseat Games`                                                                                                       |
| App Store Connect name    | **Backseat Games (road trip fun)**                                                                                     |
| Icon, splash, permissions | [app.config.js](../app.config.js)                                                                                      |
| Export encryption         | `ITSAppUsesNonExemptEncryption: false`                                                                                 |
| Host unlock IAP           | Product ID `com.homolworks.backseatgames.host_unlock`                                                                  |
| Privacy policy            | [https://mhomol.github.io/Backseat-Games-Site/privacy.html](https://mhomol.github.io/Backseat-Games-Site/privacy.html) |
| Support URL (in-app)      | [https://mhomol.github.io/Backseat-Games-Site/support.html](https://mhomol.github.io/Backseat-Games-Site/support.html) |


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
- [x] **Age rating** questionnaire — expect 4+; declare optional mic honestly
- [x] **Privacy Policy URL** — [https://mhomol.github.io/Backseat-Games-Site/privacy.html](https://mhomol.github.io/Backseat-Games-Site/privacy.html)
- [x] **Support URL** — [https://mhomol.github.io/Backseat-Games-Site/support.html](https://mhomol.github.io/Backseat-Games-Site/support.html)

---

## Phase 3 — Privacy Nutrition Label

Complete in App Store Connect → **your app** → **App Privacy** (left sidebar). An **Account Holder** or **Admin** must finish this before the first submission.

**Privacy Policy URL** (required in this section):  
[https://mhomol.github.io/Backseat-Games-Site/privacy.html](https://mhomol.github.io/Backseat-Games-Site/privacy.html)

### Questionnaire (Backseat Games v1)

**Do you or your third-party partners collect data from this app?** → **Yes**  
(Display names and game state pass through your relay during active sessions; IAP uses StoreKit.)

Add these data types:


| Data type            | Collected? | Purpose           | Linked to user?            | Used for tracking? |
| -------------------- | ---------- | ----------------- | -------------------------- | ------------------ |
| **Name**             | Yes        | App Functionality | No                         | No                 |
| **Gameplay Content** | Yes        | App Functionality | No                         | No                 |
| **Purchases**        | Yes        | App Functionality | Yes (Apple ID for restore) | No                 |


Do **not** declare (unless you add them later): Location, Contact Info, Browsing History, Identifiers for advertising, Audio Data (mic stays on-device; only text is shared), Analytics.

**Third-party partners:** None for v1 (no ads, no analytics SDKs). Your Azure relay is first-party infrastructure.

Click **Publish** (or **Save**) when the privacy label shows complete.

---

## Phase 3b — Copyright & Content Rights (required before review)

### Copyright

**App Store Connect → Apps → Backseat Games → App Information → General Information → Copyright**

Example:

```
© 2026 Homol Works
```

Use your legal name or sole-prop name if you publish as an individual (e.g. `© 2026 Mike Homol`). Must match who holds the Apple developer account.

Also check the **version 1.0** page — some accounts show Copyright again on the submission form.

### Content Rights Information

**App Store Connect → Apps → Backseat Games → App Information** → scroll to **Content Rights**

**Does your app contain, show, or access third-party content?** → **No**  
(Original art, in-app plate graphics, and your own relay — no licensed music, stock photos, or third-party catalogs.)

Choose **Yes** only if you embed content you do not own (licensed music, third-party characters, etc.) and be prepared to document rights.

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
> • Free to download; Solo Mode free; passengers join for free
> • One-time $0.99 unlock to host online with a join code on your Apple ID
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


| Slot | Output folder      | Resolution  | Notes                              |
| ---- | ------------------ | ----------- | ---------------------------------- |
| 6.9" | `output/6.9-inch/` | 1320 × 2868 | Preferred primary tier (2026)      |
| 6.5" | `output/6.5-inch/` | 1284 × 2778 | Required tier if 6.9" not uploaded |
| 6.3" | `output/6.3-inch/` | 1206 × 2622 | Optional — iPhone 17 native        |


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

- [x] App price: **Free**
- [x] In-App Purchases: **Yes** — `host_unlock` at **$0.99** (Tier 1 in App Store Connect)
- [x] Countries: start with US (expand as needed)
- [x] Regenerate IAP review/promo images if ASC still shows old price (`node scripts/prepare-iap-review-screenshot.mjs`)

---

## Phase 7 — Submit

- [x] Playtesting sign-off (family road trip — Travel Bingo + Sign Game validated)
- [x] TestFlight sandbox IAP + restore verified at **$0.99**
- [x] Upload build (GitHub Actions iOS TestFlight workflow)
- [x] Select build on version 1.0
- [x] Attach `host_unlock` IAP to submission
- [x] **App Review notes:**

```
Backseat Games is family road-trip multiplayer.

- No login.
- Join is free. Solo Mode is free. Online host requires one-time $0.99 IAP.
- Multiplayer: host shares a 6-character join code (internet relay on cellular or Wi‑Fi).
- Microphone optional (Sign Game voice input only).
- Rejoin: enter the same join code and player name if disconnected mid-trip.

IAP: Host setup → Play online on → sandbox Apple ID.
Multiplayer: host reads join code from waiting room; joiner enters code on Join screen.
```

- [x] Export compliance: No (non-exempt encryption already declared in app)
- [x] Submit for Review

---

## Version 1.1 — Delight + Solo offline

Marketing version: **1.1.0** (`app.config.js` / `package.json`). Build number still comes from CI `run_number`.

### What’s New (App Store Connect — paste into version 1.1)

```
What’s new in 1.1

• Solo Mode — play License Plates, Sign Game, or Travel Bingo offline by yourself — free for everyone
• Play online unlock — one-time $0.99 only when you share a join code (passengers still join free)
• Travel Bingo — unique illustrated icons for every square, plus clearer filled-cell layout
• License Plates — landmark scene art for every state and province, with cleaner plate chrome
• Sound & motion — opening jingle, richer SFX (including truck horns on big wins), and ambient critters on menus
• Clearer first-run tips — solo free; pay only to host online; unlock is one-time for life
```

### App Review notes (submission form)

```
Backseat Games 1.1 polish release.

- Opening jingle plays once on cold start (Settings: Opening jingle). Not background audio.
- Game sound effects only while the app is in the foreground (taps, horns, bingo, win).
- Semi-truck horn on big moments (bingo / wins / first plate claim).
- First-run cards explain: solo is free; passengers join free; host unlock is one-time for life (online hosting only).
- Visual polish: per-item Travel Bingo icons across all categories; landmark plate scenes; ambient scenery critters (plane propeller spin, bird, gopher).
- Solo Mode: anyone can play any game alone offline with Play online off (no IAP, no relay / waiting room).
- Online: Play online toggle on host setup gates the $0.99 host unlock; then join codes work as before.

IAP: Host setup → turn on Play online → paywall (sandbox Apple ID).
Multiplayer: host reads join code from waiting room; joiner enters code on Join screen.
Solo: Host setup → leave Play online off → tap a game sign.
```

### Ship checklist

- [ ] Run **Actions → iOS TestFlight** on `master` after this release is pushed
- [ ] Install TestFlight build; confirm no local-network / background-audio prompts
- [ ] Confirm Solo Mode starts License Plates / Sign Game / Bingo with airplane mode on
- [ ] Confirm bingo cells show large per-item icons + readable labels across categories; plates show landmark scenes with one frame
- [ ] Capture fresh App Store screenshots (home, bingo board, plates grid, solo setup, first-run / paywall)
- [ ] Drop captures into `assets/marketing/app-store-screenshots/raw/` then run `npm run prepare:app-store-screenshots`
- [ ] Create App Store Connect version **1.1** and attach the new build
- [ ] Paste **What’s New** (customer) + App Review notes above; submit for review

---

## After approval

- [ ] Smoke-test production listing and IAP
- [ ] Add App Store screenshots to README

## Related

- [MONETIZATION.md](./MONETIZATION.md) — IAP product setup
- [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md) — build upload + IAP sandbox testing
- [FEATURES.md](./FEATURES.md) — player-facing rules
- [ROADMAP.md](./ROADMAP.md) — product direction


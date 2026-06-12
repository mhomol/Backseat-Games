# Monetization — Backseat Games

How hosting is priced, how purchases work, and how to test them before App Store release.

## Overview

| Role | Cost | Can do |
|------|------|--------|
| **Passenger (joiner)** | Free | Install, join nearby games, play |
| **Host (trip starter)** | **$1.99 one-time** IAP | Start a Game, host lobby, run sessions |

- App Store listing: **Free** with **Offers In-App Purchases**
- Product type: **Non-consumable** (buy once per Apple ID; restore on new devices)
- Product ID: `com.homolworks.backseatgames.host_unlock`
- **Join stays free** — only the Start sign and host flow are gated
- **Offline trips:** purchase needs internet once; cached entitlement allows hosting offline afterward
- **Android v1:** hosting is free (no IAP wiring yet)

## User-facing copy

**Paywall headline:** Unlock hosting

**Bullets:**
- Passengers join for free — only the host pays once.
- Works offline after you unlock — no subscription.
- All three games included.

**FAQ**

| Question | Answer |
|----------|--------|
| Do passengers pay? | No. Only whoever taps **Start a Game** needs the host unlock. |
| Do I need internet on the trip? | No, after the one-time unlock. You need connectivity once to buy or restore. |
| New phone? | Settings → Restore purchases with the same Apple ID. |
| Family Sharing? | Optional in App Store Connect — one purchase may cover family Apple IDs if enabled. |

## App Store Connect setup

Complete before TestFlight IAP testing:

1. **Agreements, Tax, and Banking** — Paid Apps Agreement must be active (required even for free apps with IAP).
2. App pricing → **Free**
3. **Features → In-App Purchases** → **+** → **Non-Consumable**
4. Reference name: `Host Unlock`
5. Product ID: `com.homolworks.backseatgames.host_unlock` (must match code exactly)
6. Price: **$1.99** (Tier 2)
7. Display name: **Host games**
8. Description: e.g. "Unlock hosting for road-trip games. Passengers join free."
9. Optional: enable **Family Sharing**
10. Status: **Ready to Submit** (sandbox works before App Store approval)
11. Attach the IAP to your first app version submission

## TestFlight and Sandbox

| Topic | Detail |
|-------|--------|
| Cost to testers | $0 — sandbox transactions are fake |
| Sandbox account | [App Store Connect → Users and Access → Sandbox](https://appstoreconnect.apple.com/access/testers) |
| When prompted | iOS asks for sandbox Apple ID during purchase in TestFlight |
| Physical device | Required — simulator IAP is unreliable |
| Expo Go | IAP does **not** work; use TestFlight or EAS dev client release build |
| Dev builds (`__DEV__`) | Hosting auto-unlocked for local development only |

See [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md) § Testing In-App Purchases for the step-by-step checklist.

## Implementation reference

| File | Purpose |
|------|---------|
| [`src/types/purchases.ts`](../src/types/purchases.ts) | Product ID constant |
| [`src/services/iapService.ts`](../src/services/iapService.ts) | StoreKit init, purchase, restore |
| [`src/services/purchaseStorage.ts`](../src/services/purchaseStorage.ts) | AsyncStorage entitlement cache |
| [`src/store/purchaseStore.ts`](../src/store/purchaseStore.ts) | Zustand entitlement state |
| [`src/components/purchases/HostUnlockSheet.tsx`](../src/components/purchases/HostUnlockSheet.tsx) | Paywall UI |
| [`src/utils/hostEntitlement.ts`](../src/utils/hostEntitlement.ts) | Pure entitlement helpers |

**Gate points:** home Start sign → paywall; `/host/setup` redirect; `sessionStore.hostGame()` toast guard.

## Before App Store release

Separate checklist (not blocking IAP):

- Privacy policy URL live ([`PRIVACY.md`](../PRIVACY.md))
- Support URL
- App Store screenshots and description
- Privacy Nutrition Label questionnaire
- Age rating
- App Review notes (offline multiplayer, sandbox test steps)

## Future

- Android Google Play Billing
- Achievements tied to local stats
- Promo codes UI

# Push notifications (planned)

Backseat Games includes **push notification entitlements** in every native build, even before notification UX ships. This avoids App ID / provisioning profile churn later.

## What is configured today

| Layer | Status |
|-------|--------|
| App ID capability | **Push Notifications** — enable in Developer Portal (see [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md)) |
| `expo-notifications` plugin | In [`app.json`](../app.json) |
| Usage string | `NSUserNotificationsUsageDescription` |
| Background mode | `remote-notification` (receive alerts when app is backgrounded) |
| Runtime code | **Not implemented yet** — no tokens registered, no notifications sent |

## Apple setup (one-time)

1. Enable **Push Notifications** on App ID `com.homolworks.backseatgames`.
2. Create an **APNs Auth Key** (.p8) in the Developer portal if you do not already have one (can be shared across Homol Works apps).
3. Ensure the **App Store provisioning profile** was created **after** Push was enabled.

## Future use cases (ideas)

- Host tapped **Start Game** → notify joiners in the waiting room
- Player disconnected / reconnected
- Optional: remind front-seat parent that kids are waiting to join

In-car multiplayer remains **foreground-first**; push is a supplement, not a replacement for relay sync.

## Implementation checklist (when ready)

1. Request permission and register for push token (`expo-notifications`) on first launch or in Settings.
2. Store Expo push tokens per device (local-only MVP, or a small worker later — see Memento Mori's `push-worker` pattern).
3. Send via [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/) or your own APNs sender.
4. Handle notification tap → deep link to lobby or active game (`expo-router`).

## CI / TestFlight

TestFlight builds already include push entitlements if the provisioning profile includes Push. Testers may be prompted for notification permission once runtime code is added.

APNs key in CI: optional for **building** the IPA; required only when **sending** push from a backend. Add `pushKey` to `credentials.json` (see [`credentials.json.example`](../credentials.json.example)) if EAS local build requests it.

## Related

- [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md) — App ID capabilities and provisioning
- [FEATURES.md](./FEATURES.md) — player-facing behavior

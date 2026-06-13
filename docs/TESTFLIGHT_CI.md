# TestFlight CI (Backseat Games)

Ship **Backseat Games** to internal TestFlight via GitHub Actions on `macos-26` (Xcode 26+). Builds use **`eas build --local`** on the runner — **no EAS cloud build quota**. Upload uses `xcrun altool` with App Store Connect API keys (same pattern as [Memento Mori](https://github.com/mhomol/90-Day) and [Homol Invests](https://github.com/Homol-Works/Homol-Invests)).

## Prerequisites

- Apple Developer Program membership
- App Store Connect access
- GitHub repo admin (to add secrets and the `testflight` environment)
- Expo account + **`EXPO_TOKEN`** ([expo.dev access token](https://expo.dev/settings/access-tokens))
- Valid **`extra.eas.projectId`** in `app.json` (UUID from `eas init` — see §5). A placeholder value causes `Invalid UUID appId` in CI.

Bundle ID: **`com.homolworks.backseatgames`**

**App Store Connect name:** **Backseat Games (road trip fun)** — required listing name in App Store Connect (base name was unavailable). TestFlight and the App Store show this name.

**On-device home screen name:** **Backseat Games** — set by `expo.name` in [`app.json`](../app.json) (shorter label under the icon).

## Reuse secrets from Homol Invests / Memento Mori

If you already ship via GitHub Actions, copy these **same values** into this repo's `testflight` environment:

| Secret | Reuse? |
|--------|--------|
| `APPLE_API_ISSUER_ID` | Yes |
| `APPLE_API_KEY_ID` | Yes |
| `APPLE_API_KEY_BASE64` | Yes |
| `IOS_DIST_CERT_BASE64` | Yes |
| `IOS_DIST_CERT_PASSWORD` | Yes |
| `IOS_CODESIGN_KEY` | Yes (reference only — EAS local uses P12 + profile paths) |
| `IOS_PROVISION_PROFILE_BASE64` | **No** — Backseat Games profile |
| `IOS_CODESIGN_PROVISION` | **No** — Backseat Games profile name |

Also add:

| Secret | Value |
|--------|--------|
| `EXPO_TOKEN` | Expo access token (project identity for `eas build --local`) |

GitHub environments are **per-repo**. Duplicate secret values from Homol Invests or promote the six reusable ones to **org-level secrets**.

## 1. Register the bundle ID (browser)

1. [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list) → **+** → **App IDs** → **App**.
2. Platform: **iOS**.
3. Description: `Backseat Games`.
4. Bundle ID: **Explicit** → `com.homolworks.backseatgames`.
5. **Capabilities (Developer Portal checkboxes only):** On the App ID registration screen, Apple shows a fixed list of optional capabilities. **Most Backseat Games features are not on that list** — they are configured in [`app.json`](../app.json) and granted at runtime on the device.

   **What you should enable in the portal for this app:**

   | Portal checkbox | Action |
   |-----------------|--------|
   | **Push Notifications** | **Turn on** — only portal capability we need today. |
   | Everything else on the list | Leave **off** unless you add a feature that needs it (App Groups, iCloud, etc.). |

   **What you will not find in the portal** (this is normal — not a mistake):

   | Feature | Where it is configured | When the user sees it |
   |---------|------------------------|------------------------|
   | In-car P2P / **Multipeer Connectivity** | iOS system framework; no App ID checkbox | Works after local network permission |
   | **Bonjour** / local discovery | `NSBonjourServices` in Info.plist (`_backseatgames._tcp`) | Part of local network permission |
   | **Local network** | `NSLocalNetworkUsageDescription` in Info.plist | iOS prompt: “Backseat Games would like to find and connect to devices on your local network” |
   | **Microphone** (Sign Game voice input) | `NSMicrophoneUsageDescription` in Info.plist | iOS prompt when voice input is used |
   | **Speech recognition** | `NSSpeechRecognitionUsageDescription` in Info.plist | iOS prompt for Sign Game voice-to-text |
   | **Photo library** (SDK reference) | `NSPhotoLibraryUsageDescription` in Info.plist | Required by speech library; app does not read photos |
   | Notification permission text | `NSUserNotificationsUsageDescription` in Info.plist | iOS prompt when push UX is implemented |

   All of the Info.plist entries above are already in [`app.json`](../app.json). Expo bakes them into the IPA at build time — **no extra Developer Portal toggles required.**

   **Enable Push before creating the provisioning profile.** If you add Push after the profile exists, regenerate the App Store profile and update `IOS_PROVISION_PROFILE_BASE64`.

   **APNs Auth Key (one-time):** [Keys](https://developer.apple.com/account/resources/authkeys/list) → **+** → enable **Apple Push Notifications service (APNs)** → download `.p8` (once). Note the **Key ID**. Needed when you send push (see [PUSH_SETUP.md](./PUSH_SETUP.md)); not required just to build the IPA.

6. Register.

## 2. App Store Connect app (browser)

1. [App Store Connect → Apps](https://appstoreconnect.apple.com/apps) → **+** → **New App**.
2. Platform: **iOS**, name: **Backseat Games (road trip fun)**, bundle ID: `com.homolworks.backseatgames`.
3. SKU: e.g. `backseat-games-ios`.

## 3. App Store Connect API key (browser)

Same key as Homol Invests if you reuse secrets:

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API**.
2. Download `.p8` once; note **Issuer ID** and **Key ID**.

Base64 for GitHub (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXXXXXX.p8"))
```

## 4. Provisioning profile (browser + Windows — no Mac)

You **reuse** the Homol Invests **Apple Distribution** certificate. Only the **provisioning profile** is app-specific.

1. [Developer portal → Profiles](https://developer.apple.com/account/resources/profiles/list) → **+**.
2. Type: **App Store Connect** (distribution to App Store / TestFlight).
3. App ID: `com.homolworks.backseatgames`.
4. Certificate: your existing **Apple Distribution** cert.
5. Name: e.g. `Backseat Games App Store` → note this name for troubleshooting.
6. Download `.mobileprovision` to Windows.

Base64 (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\Backseat_Games_App_Store.mobileprovision"))
```

Store as **`IOS_PROVISION_PROFILE_BASE64`**.

## 5. Link Expo project (one-time, local)

From the repo root (once per machine / after cloning):

```bash
npm ci
npx eas login
# If app.json has no projectId or a bad placeholder, remove extra.eas.projectId first, then:
npx eas init --force
```

This creates `@<your-expo-account>/backseat-games` on expo.dev and writes a real UUID to `extra.eas.projectId` in `app.json`. **Commit that change** before the first CI build.

Current project: `@sevign/backseat-games` — `3760b2e7-04b8-4d7f-b7c1-b6b21e65c387`

## 6. GitHub environment and secrets

1. [Backseat-Games](https://github.com/mhomol/Backseat-Games) → **Settings** → **Environments** → **New environment** → name: `testflight`.
2. Add all secrets from the tables above.
3. Optional: require approval before deploy.

## 7. Run the workflow

1. GitHub → **Actions** → **iOS TestFlight**.
2. **Run workflow** → branch `master` → **Run workflow**.
3. When green, App Store Connect → **Backseat Games (road trip fun)** → **TestFlight** (processing ~5–15 minutes).
4. Add **Internal Testing** testers (family iPhones).

Workflow file: [`.github/workflows/ios-testflight.yml`](../.github/workflows/ios-testflight.yml)

## Build numbers

CI sets **`IOS_BUILD_NUMBER`** from the GitHub Actions **`run_number`** (monotonic per workflow). [`app.config.js`](../app.config.js) maps that to `ios.buildNumber` / `CFBundleVersion`.

User-visible marketing version (`expo.version` in `app.json`, e.g. `1.0.0`) is edited manually when you want a release bump.

## Verify on device

1. Install from TestFlight on family iPhones.
2. Host a game on one phone; others join (requires native Multipeer dev build when that plugin is added — MVP TestFlight build supports UI and mock networking validation).
3. See [FEATURES.md](./FEATURES.md) for play instructions.

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| `Decoded P12 is empty` / OpenSSL P12 errors | Wrong `IOS_DIST_CERT_PASSWORD` or truncated `IOS_DIST_CERT_BASE64`. Re-export `.p12` with private key; re-encode single-line base64. |
| Codesign / provisioning errors | Profile must be **App Store** type for `com.homolworks.backseatgames`. Regenerate profile if bundle ID or capabilities changed. |
| `credentials.json` / local credentials errors | Ensure `eas.json` production profile has `"credentialsSource": "local"`. Workflow writes `credentials.json` from decoded secrets. |
| `built with the iOS 18.5 SDK` / must use iOS 26 SDK | Workflow uses `runs-on: macos-26`. Do not change to `macos-latest`. |
| EAS local build fails on CocoaPods | Re-run once; check `eas build --local` logs in the job. |
| `CryptoKit...error: -7` on upload | Corrupt `.p8`. Use **`APPLE_API_KEY_BASE64` only**; delete `APPLE_API_PRIVATE_KEY` if set. |
| `Cannot determine the Apple ID from Bundle ID` | Confirm App Store Connect has an iOS app for `com.homolworks.backseatgames`; API key role **App Manager** or **Admin**. |
| Upload rejected (duplicate build) | `run_number` increases each run; bump `expo.version` in `app.json` if Apple requires a new marketing version. |
| EAS cloud quota exhausted | Use **iOS TestFlight** workflow only (`eas build --local`). Do **not** use cloud `eas build`. |
| Invalid `projectId` | Run `eas init` and commit updated `app.json`. |

## Related

- [README.md](../README.md) — local dev with Expo Go
- [ARCHITECTURE.md](./ARCHITECTURE.md) — build & deploy summary
- [MONETIZATION.md](./MONETIZATION.md) — host unlock IAP and App Store Connect product setup
- [PUSH_SETUP.md](./PUSH_SETUP.md) — APNs key and future notification work
- Memento Mori reference: `90-Day/memento-mori/docs/TESTFLIGHT_CI.md`

## Testing In-App Purchases

Host unlock IAP is enforced in **TestFlight and App Store builds only** (`__DEV__` builds skip the paywall for local development).

### Prerequisites

1. **Paid Apps Agreement** active in App Store Connect (Agreements, Tax, and Banking).
2. Non-consumable product `com.homolworks.backseatgames.host_unlock` created at **$1.99**, status **Ready to Submit** — see [MONETIZATION.md](./MONETIZATION.md).
3. **Sandbox Apple ID** — App Store Connect → Users and Access → Sandbox → Testers.
4. **Physical iPhone** with TestFlight build installed.

### Sandbox test flow

1. Fresh install from TestFlight (or delete app and reinstall).
2. Tap **Start a Game** on the home signpost → paywall appears.
3. Tap **Unlock for $1.99** → sign in with sandbox Apple ID when iOS prompts.
4. Confirm purchase completes → host setup screen opens.
5. Host a session; confirm **Join** still works on a second phone without purchase.
6. **Settings → Restore purchases** on a reinstall → hosting works without repurchasing.
7. Optional: enable airplane mode after unlock → confirm hosting still works offline.

### Troubleshooting IAP

| Issue | Fix |
|-------|-----|
| Product not found | Product ID must match code; wait up to a few hours after creating in ASC |
| Purchase sheet never appears | Paid Apps Agreement incomplete; use physical device not simulator |
| Restore finds nothing | Same sandbox Apple ID used for original test purchase |
| Paywall missing in TestFlight | Ensure release/TestFlight build (`__DEV__` false), not Metro dev session |

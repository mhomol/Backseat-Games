# Google Play solo launch checklist

Ship **Backseat Games** to Google Play as a **free, solo/offline-first** Android app. Multiplayer (Join / Play online) and Play Billing ship later — see the Android Online + Billing follow-up plan.

Related: [APP_STORE_RELEASE.md](./APP_STORE_RELEASE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [MONETIZATION.md](./MONETIZATION.md).

## Already in the codebase


| Item                   | Location                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Package name           | `com.homolworks.backseatgames` — [app.config.js](../app.config.js)                            |
| Marketing version      | `1.3.0` (`version` / Play `versionName`)                                                      |
| Android `versionCode`  | `ANDROID_VERSION_CODE` env (CI `run_number`) → [app.config.js](../app.config.js)              |
| Adaptive icons         | `assets/android-icon-*.png`                                                                   |
| Coming soon gates      | Join + Play online toast on Android — [platformFeatures.ts](../src/utils/platformFeatures.ts) |
| CI workflow            | [`.github/workflows/android-play.yml`](../.github/workflows/android-play.yml)                 |
| Privacy / support URLs | Same GitHub Pages URLs as iOS                                                                 |




## Product (Android v1)

- Free app — **no in-app purchases**
- Solo Mode for License Plates, Sign Game, Travel Bingo
- **Join** and **Play online** stay visible; tap shows “coming soon”
- Optional Sign Game microphone (runtime permission)



## Phase 1 — Play Console prerequisites

- [x] Google Play developer account (personal) registered ($25)
- [x] App created in Play Console (Backseat Games)
- [x] Identity + **physical Android device** verification (Play Console mobile app)
- [x] Accept Play App Signing
- [x] Internal testing track: add yourself (and family) as testers
- [x] Google Cloud service account with Play Console API access (Release Manager) — JSON for CI / EAS Submit



### Service account for EAS Submit

1. Play Console → **Users and permissions** / API access → link Google Cloud project
2. Create a service account; grant **Release to production / edit store listing** or **Release Manager** as appropriate
3. Download JSON key
4. Upload to EAS: `eas credentials --platform android` → Google Service Account, **or** store full JSON as GitHub secret `GOOGLE_SERVICE_ACCOUNT_JSON` on the `play` environment
5. Keep `EXPO_TOKEN` available (same as iOS TestFlight)

Do **not** commit `google-service-account.json`.

## Phase 2 — Build profiles


| Profile              | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `preview`            | Internal APK via EAS-managed keystore — device smoke install |
| `production-android` | AAB for Play internal track submit                           |


```bash
# Local smoke (APK) — uses .easignore so marketing/docs stay out of the upload
eas build --platform android --profile preview

# CI / release (AAB → internal)
# Actions → Android Play Internal
```

First Android credentials: choose **EAS-managed keystore** when prompted (`credentialsSource: remote` in [eas.json](../eas.json)). A project keystore can also be generated automatically on the first cloud build.

## Phase 3 — Store listing (solo)

- [x] App name: **Backseat Games**
- [x] Short description — solo road-trip games; multiplayer coming soon if mentioned
- [x] Full description — adapt iOS copy; stress **free solo**, no paywall in v1
- [ ] Screenshots (phone): home, host setup, each game; optional Coming soon toast
- [x] Feature graphic — `assets/marketing/play-feature-graphic-1024x500.png` (1024×500, no alpha)
- [x] Hi-res icon — `assets/marketing/play-store-icon-512.png` (512×512)
- [ ] Privacy policy URL + support URL (same as iOS)
- [ ] Data safety form (Name / Gameplay; no purchases in v1)
- [ ] Content rating questionnaire
- [ ] Target audience / Families policies as applicable



### Sample What’s New (internal)

```
First Android release — Solo Mode.

• Play License Plates, Sign Game, and Travel Bingo offline for free
• Join and Play online coming soon
• No in-app purchases in this version
```



## Phase 4 — Device QA

- [ ] Airplane mode: start all three games with Play online off
- [ ] Join shows coming-soon toast; does not open join flow
- [ ] Play online toggle shows coming soon and stays off; no paywall
- [ ] First-run cards are Android solo / coming-soon wording
- [ ] Sign Game mic: grant and deny both work
- [ ] SFX / haptics / ambient critters with system sound on
- [ ] No leftover “Apple ID” purchase prompts on Android



## Phase 5 — Internal → closed → production

1. Run **Actions → Android Play Internal** (or `eas build` + `eas submit`)
2. Install from internal testing link; complete QA
3. If personal account needs it: closed test with **12 testers / 14 days** before production access
4. Complete listing + Data safety
5. Promote when ready



## Out of scope (follow-up)

- Enabling Join / Play online on Android
- Play Billing / `$0.99` host unlock
- Production relay bake for multiplayer QA



## Related

- iOS CI: [TESTFLIGHT_CI.md](./TESTFLIGHT_CI.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)


/**
 * Push notification scaffolding — entitlements are in native builds;
 * runtime registration and handlers are added when notification UX ships.
 * See docs/PUSH_SETUP.md.
 */

export const PUSH_ENABLED_IN_BUILD = true;

/** Request permission and return an Expo push token, or null if declined / unavailable. */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // TODO: expo-notifications getPermissionsAsync + getExpoPushTokenAsync
  return null;
}

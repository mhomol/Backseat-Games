/** Shown when Join or Play online is tapped on Android (solo launch). */
export const MULTIPLAYER_COMING_SOON_MESSAGE =
  'Multiplayer is coming soon on Android. Solo Mode is ready now — leave Play online off and tap a game.';

/** Online join codes / Play online are iOS-only until Android Online + Billing ships. */
export function isOnlineMultiplayerAvailable(): boolean {
  // Lazy require so node unit tests can import message constants without RN.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Platform } = require('react-native') as typeof import('react-native');
  return Platform.OS !== 'android';
}

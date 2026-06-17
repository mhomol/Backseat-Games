import Constants from 'expo-constants';

const DEFAULT_RELAY_URL = 'http://localhost:5080';

/** Base URL for the SignalR relay (no trailing slash). */
export function getRelayBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_RELAY_URL?.trim();
  const fromExtra = (
    Constants.expoConfig?.extra as { relayUrl?: string } | undefined
  )?.relayUrl?.trim();
  return (fromEnv || fromExtra || DEFAULT_RELAY_URL).replace(/\/$/, '');
}

export function formatJoinCode(code: string): string {
  const normalized = code.replace(/-/g, '').toUpperCase();
  if (normalized.length !== 6) {
    return normalized;
  }
  return `${normalized.slice(0, 2)}-${normalized.slice(2)}`;
}

export function normalizeJoinCode(code: string): string {
  return code.replace(/-/g, '').trim().toUpperCase();
}

export function isJoinCode(value: string): boolean {
  return /^[A-Z0-9]{6}$/.test(normalizeJoinCode(value));
}

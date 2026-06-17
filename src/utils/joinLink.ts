import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import { formatJoinCode, normalizeJoinCode } from '@/constants/relay';

export function buildJoinInviteUrl(code: string): string {
  return Linking.createURL('/join', {
    queryParams: { code: normalizeJoinCode(code) },
  });
}

export async function shareJoinInvite(code: string, hostName?: string): Promise<void> {
  const formatted = formatJoinCode(code);
  const url = buildJoinInviteUrl(code);
  const host = hostName?.trim() || 'Someone';

  await Share.share({
    message: `${host} invited you to play Backseat Games!\nJoin code: ${formatted}\n${url}`,
    url,
  });
}

export function joinCodeFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const path = parsed.path?.replace(/^\//, '') ?? '';
  if (path !== 'join') {
    return null;
  }

  const raw = parsed.queryParams?.code;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const normalized = normalizeJoinCode(value);
  return normalized.length === 6 ? normalized : null;
}

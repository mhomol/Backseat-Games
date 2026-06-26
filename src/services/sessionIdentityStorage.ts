import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@backseatgames/session_identity';

export type SessionIdentity = {
  peerId: string;
  sessionId: string;
  joinCode: string;
  isHost: boolean;
  displayName: string;
};

export async function loadSessionIdentity(): Promise<SessionIdentity | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SessionIdentity;
  } catch {
    return null;
  }
}

export async function saveSessionIdentity(identity: SessionIdentity): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // Best-effort persistence for rejoin.
  }
}

export async function clearSessionIdentity(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

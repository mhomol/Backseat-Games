import { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { gameSceneryForSession } from '@/data/gameSceneryRotation';
import { useSessionStore } from '@/store/sessionStore';

/** Session-stable randomized scenery for lobby + gameplay screens. */
export function useSessionGameScenery(): ImageSourcePropType | undefined {
  const sessionId = useSessionStore((state) => state.session?.sessionId);

  return useMemo(() => {
    if (!sessionId) {
      return undefined;
    }
    return gameSceneryForSession(sessionId).source;
  }, [sessionId]);
}

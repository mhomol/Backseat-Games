import { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { gameSceneryForSession } from '@/data/gameSceneryRotation';
import { sceneryRotationForTheme } from '@/data/themes';
import { useSessionStore } from '@/store/sessionStore';
import { isThemeId } from '@/types/theme';

/** Session-stable randomized scenery for lobby + gameplay screens. */
export function useSessionGameScenery(): ImageSourcePropType | undefined {
  const sessionId = useSessionStore((state) => state.session?.sessionId);
  const themeId = useSessionStore((state) => state.session?.themeId);

  return useMemo(() => {
    if (!sessionId) {
      return undefined;
    }
    const theme = isThemeId(themeId) ? themeId : 'classic';
    return gameSceneryForSession(sessionId, sceneryRotationForTheme(theme)).source;
  }, [sessionId, themeId]);
}

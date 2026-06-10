import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';

export function useGameSessionGuard() {
  const navigation = useNavigation();
  const router = useRouter();
  const session = useSessionStore((state) => state.session);
  const isHost = useSessionStore((state) => state.isHost);
  const returnToLobbyAsHost = useSessionStore((state) => state.returnToLobbyAsHost);
  const leaveActiveGame = useSessionStore((state) => state.leaveActiveGame);

  const [exitPromptVisible, setExitPromptVisible] = useState(false);
  const pendingNavigation = useRef<unknown>(null);

  const isInProgress = session?.phase === 'playing';
  const isFinished = session?.phase === 'finished';

  const completeExit = useCallback(() => {
    setExitPromptVisible(false);
    pendingNavigation.current = null;
    if (isHost) {
      returnToLobbyAsHost();
      if (session?.sessionId) {
        router.replace(`/lobby/${session.sessionId}`);
      }
      return;
    }
    leaveActiveGame();
    if (pendingNavigation.current) {
      navigation.dispatch(pendingNavigation.current as never);
      pendingNavigation.current = null;
      return;
    }
    router.replace('/');
  }, [isHost, leaveActiveGame, navigation, returnToLobbyAsHost, router, session?.sessionId]);

  useEffect(() => {
    if (session?.phase === 'lobby' && session.sessionId) {
      router.replace(`/lobby/${session.sessionId}`);
    }
  }, [router, session?.phase, session?.sessionId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!isInProgress) {
        return;
      }
      event.preventDefault();
      pendingNavigation.current = event.data.action;
      setExitPromptVisible(true);
    });
    return unsubscribe;
  }, [isInProgress, navigation]);

  const cancelExit = useCallback(() => {
    pendingNavigation.current = null;
    setExitPromptVisible(false);
  }, []);

  const exitPrompt = isInProgress
    ? {
        visible: exitPromptVisible,
        title: isHost ? 'End game for everyone?' : 'Leave this game?',
        message: isHost
          ? 'No one has won yet. Ending now returns everyone to the waiting room.'
          : 'You can join again if the host is still in the waiting room.',
        confirmLabel: isHost ? 'End game' : 'Leave game',
        onConfirm: completeExit,
        onCancel: cancelExit,
      }
    : null;

  return {
    session,
    isHost,
    isInProgress,
    isFinished,
    exitPrompt,
    returnToLobbyAsHost: () => {
      returnToLobbyAsHost();
      if (session?.sessionId) {
        router.replace(`/lobby/${session.sessionId}`);
      }
    },
    leaveToHome: () => {
      leaveActiveGame();
      router.replace('/');
    },
  };
}

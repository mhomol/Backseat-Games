import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import { WinCelebration } from '@/components/WinCelebration';
import type { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionStore } from '@/store/sessionStore';

type GameSessionOverlaysProps = {
  guard: ReturnType<typeof useGameSessionGuard>;
  winnerHeadline?: string;
  isWinnerYou?: boolean;
};

export function GameSessionOverlays({
  guard,
  winnerHeadline,
  isWinnerYou = false,
}: GameSessionOverlaysProps) {
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const connectionStatus = useSessionStore((state) => state.connectionStatus);
  const showWin = guard.isFinished && !!winnerHeadline;
  const showConnectionBanner =
    connectionStatus === 'reconnecting' || connectionStatus === 'disconnected';

  useEffect(() => {
    if (!guard.isFinished) {
      setCelebrationDismissed(false);
    }
  }, [guard.isFinished]);

  return (
    <>
      {showConnectionBanner ? (
        <ConnectionBanner
          status={connectionStatus === 'reconnecting' ? 'reconnecting' : 'disconnected'}
        />
      ) : null}
      {guard.exitPrompt ? (
        <ConfirmDialog
          visible={guard.exitPrompt.visible}
          title={guard.exitPrompt.title}
          message={guard.exitPrompt.message}
          confirmLabel={guard.exitPrompt.confirmLabel}
          onConfirm={guard.exitPrompt.onConfirm}
          onCancel={guard.exitPrompt.onCancel}
        />
      ) : null}
      {showWin ? (
        <WinCelebration
          visible={!celebrationDismissed}
          winnerName={winnerHeadline}
          isWinnerYou={isWinnerYou}
          isHost={guard.isHost}
          onStartNewGame={guard.returnToLobbyAsHost}
          onDismiss={() => setCelebrationDismissed(true)}
          onLeaveHome={guard.leaveToHome}
        />
      ) : null}
    </>
  );
}

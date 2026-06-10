import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { WinCelebration } from '@/components/WinCelebration';
import type { useGameSessionGuard } from '@/hooks/useGameSessionGuard';

type GameSessionOverlaysProps = {
  guard: ReturnType<typeof useGameSessionGuard>;
  winnerLabel?: string;
};

export function GameSessionOverlays({ guard, winnerLabel }: GameSessionOverlaysProps) {
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const showWin = guard.isFinished && !!guard.session?.winnerId && !!winnerLabel;

  useEffect(() => {
    if (!guard.isFinished) {
      setCelebrationDismissed(false);
    }
  }, [guard.isFinished]);

  return (
    <>
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
          winnerName={winnerLabel}
          isHost={guard.isHost}
          onStartNewGame={guard.returnToLobbyAsHost}
          onDismiss={() => setCelebrationDismissed(true)}
          onLeaveHome={guard.leaveToHome}
        />
      ) : null}
    </>
  );
}

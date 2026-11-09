import { useEffect } from 'react';
import { playRoundStartFeedback } from '@/services/feedback';
import { consumeRoundStartOpportunity, roundStartSoundKey } from '@/services/gameSoundCues';
import { useSessionStore } from '@/store/sessionStore';

/** Plays round-start.wav when a game (or Hangman round) begins. Respects the sound toggle inside the player. */
export function useGameCueSounds(): void {
  const session = useSessionStore((state) => state.session);
  const phase = session?.phase;
  const sessionId = session?.sessionId;
  const hangmanRound = session?.gameState?.type === 'hangman' ? session.gameState.round : 0;

  useEffect(() => {
    const key = roundStartSoundKey(session);
    if (consumeRoundStartOpportunity(key)) {
      void playRoundStartFeedback();
    }
  }, [session, phase, sessionId, hangmanRound]);
}

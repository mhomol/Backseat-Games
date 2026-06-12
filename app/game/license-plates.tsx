import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SceneryScreenFrame } from '@/components/brand/SceneryScreenFrame';
import { GameEndBar } from '@/components/GameEndBar';
import { GameSessionOverlays } from '@/components/GameSessionOverlays';
import { Scoreboard } from '@/components/Scoreboard';
import { plates } from '@/data';
import { plateImageByCode } from '@/data/plateImages';
import { getLicensePlateScores } from '@/games/licensePlates';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { colors, fonts, radii, spacing } from '@/theme';

export default function LicensePlatesScreen() {
  const guard = useGameSessionGuard();
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);

  const requestEnd = useCallback(() => guard.requestEndGame(), [guard]);

  const gameState = session?.gameState?.type === 'license-plates' ? session.gameState : null;

  const scores = useMemo(() => {
    if (!gameState || !session) {
      return [];
    }
    const totals = getLicensePlateScores(gameState, session.players);
    return session.players.map((player) => ({
      name: player.name,
      score: totals[player.id] ?? 0,
      isYou: player.id === localPlayerId,
    }));
  }, [gameState, session, localPlayerId]);

  const winnerDisplay = useMemo(() => {
    if (!session) {
      return null;
    }
    return getSessionWinnerDisplay(session, localPlayerId);
  }, [session, localPlayerId]);

  if (!gameState || !session) {
    return null;
  }

  return (
    <SceneryScreenFrame>
      <GameSessionOverlays
        guard={guard}
        winnerHeadline={winnerDisplay?.headline}
        isWinnerYou={winnerDisplay?.isYou}
      />
      <Scoreboard scores={scores} />
      <FlashList
        style={styles.list}
        data={plates}
        numColumns={2}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const ownerId = gameState.claims[item.code];
          const isMine = ownerId === localPlayerId;
          const isTaken = ownerId !== null && !isMine;
          const ownerName = session.players.find((p) => p.id === ownerId)?.name;

          const plateImage = plateImageByCode[item.code];

          return (
            <Pressable
              style={styles.cell}
              onPress={() => {
                void Haptics.selectionAsync();
                if (isMine) {
                  dispatchAction({ type: 'UNCLAIM_PLATE', plateCode: item.code });
                } else if (!isTaken) {
                  dispatchAction({ type: 'CLAIM_PLATE', plateCode: item.code });
                }
              }}
            >
              {plateImage ? (
                <Image source={plateImage} style={styles.plateImage} resizeMode="cover" />
              ) : null}
              {isMine ? <View style={styles.overlayMine} /> : null}
              {isTaken ? <View style={styles.overlayTaken} /> : null}
              <View style={styles.labelStack}>
                <Text style={[styles.code, isTaken && styles.textMuted]}>{item.code}</Text>
                <Text style={[styles.name, isTaken && styles.textMuted]} numberOfLines={2}>
                  {item.name}
                </Text>
                {isTaken ? (
                  <Text style={styles.owner} numberOfLines={1}>
                    {ownerName}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
      {guard.isInProgress ? (
        <GameEndBar isHost={guard.isHost} onPress={requestEnd} />
      ) : null}
    </SceneryScreenFrame>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  cell: {
    flex: 1,
    margin: spacing.xs,
    aspectRatio: 2.2,
    borderRadius: radii.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  overlayMine: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(72, 160, 88, 0.28)',
  },
  overlayTaken: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(120, 120, 120, 0.45)',
  },
  labelStack: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    zIndex: 1,
  },
  code: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.roadGray,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textAlign: 'center',
    color: colors.roadGray,
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textMuted: {
    color: colors.cloudWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
  },
  owner: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.coral,
    marginTop: spacing.xs,
  },
});

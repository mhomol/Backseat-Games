import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Scoreboard } from '@/components/Scoreboard';
import { plates } from '@/data';
import { getLicensePlateScores } from '@/games/licensePlates';
import { useSessionStore } from '@/store/sessionStore';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function LicensePlatesScreen() {
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);

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

  if (!gameState || !session) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Scoreboard scores={scores} />
      <FlashList
        data={plates}
        numColumns={3}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const ownerId = gameState.claims[item.code];
          const isMine = ownerId === localPlayerId;
          const isTaken = ownerId !== null && !isMine;
          const ownerName = session.players.find((p) => p.id === ownerId)?.name;

          return (
            <Pressable
              style={[
                styles.cell,
                { borderColor: item.tint },
                isMine && styles.cellMine,
                isTaken && styles.cellTaken,
              ]}
              onPress={() => {
                void Haptics.selectionAsync();
                if (isMine) {
                  dispatchAction({ type: 'UNCLAIM_PLATE', plateCode: item.code });
                } else if (!isTaken) {
                  dispatchAction({ type: 'CLAIM_PLATE', plateCode: item.code });
                }
              }}
            >
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              {isTaken ? (
                <Text style={styles.owner} numberOfLines={1}>
                  {ownerName}
                </Text>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.cream,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  cell: {
    flex: 1,
    margin: spacing.xs,
    minHeight: 100,
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellMine: {
    backgroundColor: '#E8F8EA',
    borderColor: colors.grassGreenDark,
  },
  cellTaken: {
    backgroundColor: colors.plateOther,
    opacity: 0.85,
  },
  code: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.roadGray,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: 'center',
    color: colors.roadGrayLight,
    marginTop: spacing.xs,
  },
  owner: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.coral,
    marginTop: spacing.xs,
  },
});

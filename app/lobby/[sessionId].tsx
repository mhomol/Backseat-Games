import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { GameRulesEditor } from '@/components/settings/GameRulesEditor';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { PlayerChip } from '@/components/PlayerChip';
import { GAME_LABELS } from '@/data';
import { getMultiplayerService } from '@/multiplayer';
import { useSessionStore } from '@/store/sessionStore';
import type { GameType } from '@/types/game';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const GAME_ROUTES: Record<GameType, string> = {
  'license-plates': '/game/license-plates',
  bingo: '/game/bingo',
  'sign-game': '/game/sign-game',
};

export default function LobbyScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = useSessionStore((state) => state.session);
  const isHost = useSessionStore((state) => state.isHost);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const startHostedGame = useSessionStore((state) => state.startHostedGame);
  const updateSessionRules = useSessionStore((state) => state.updateSessionRules);

  useEffect(() => {
    if (session?.phase === 'playing' && session.gameType) {
      router.replace(GAME_ROUTES[session.gameType]);
    }
  }, [session?.phase, session?.gameType]);

  useEffect(() => {
    if (isHost && sessionId && session?.gameType) {
      getMultiplayerService().registerHostedSessionGameType(
        sessionId,
        session.gameType,
      );
    }
  }, [isHost, sessionId, session?.gameType]);

  if (!session) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.skyBlueDark} />
      </View>
    );
  }

  const otherPlayers = session.players.filter((player) => player.id !== session.hostId);
  const canStart =
    isHost &&
    session.phase === 'lobby' &&
    (session.gameType === 'bingo' ? session.players.length >= 1 : otherPlayers.length >= 1);

  return (
    <SceneryBackground variant="lobby">
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.subtitle}>
            {isHost
              ? 'Friends can join while you get ready.'
              : 'Hang tight — the host will start the game.'}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Game</Text>
            <Text style={styles.badgeValue}>
              {session.gameType ? GAME_LABELS[session.gameType] : 'Unknown'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Players ({session.players.length})</Text>
          <View style={styles.playerRow}>
            {session.players.map((player) => (
              <PlayerChip
                key={player.id}
                name={player.name}
                isHost={player.isHost}
                highlight={player.id === localPlayerId}
              />
            ))}
          </View>

          {session.gameType ? (
            <SettingsSection title="House rules">
              <GameRulesEditor
                gameType={session.gameType}
                rules={session.gameRules}
                readOnly={!isHost}
                onChange={updateSessionRules}
              />
            </SettingsSection>
          ) : null}

          {!isHost ? (
            <View style={styles.waitBox}>
              <ActivityIndicator color={colors.skyBlueDark} />
              <Text style={styles.waitText}>Waiting for host to start…</Text>
            </View>
          ) : (
            <>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  Session code: {sessionId}{'\n'}
                  Other players tap Join and look for your name.
                </Text>
              </View>
              <BigButton
                label="Start Game!"
                disabled={!canStart}
                onPress={startHostedGame}
                variant="accent"
              />
              {!canStart ? (
                <Text style={styles.helper}>
                  Need at least one other player for competitive games.
                </Text>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGray,
    lineHeight: 22,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: borders.thick,
    borderColor: colors.lavender,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  badgeLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.roadGrayLight,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.roadGray,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.roadGray,
  },
  playerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  waitBox: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: radii.lg,
  },
  waitText: {
    fontFamily: fonts.body,
    color: colors.roadGrayLight,
  },
  tipBox: {
    backgroundColor: 'rgba(232, 244, 255, 0.92)',
    borderWidth: borders.thick,
    borderColor: colors.skyBlueDark,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tipText: {
    fontFamily: fonts.body,
    color: colors.roadGray,
    lineHeight: 22,
  },
  helper: {
    fontFamily: fonts.body,
    color: colors.roadGrayLight,
    textAlign: 'center',
  },
});

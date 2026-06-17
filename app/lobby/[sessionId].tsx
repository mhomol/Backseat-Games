import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BigButton } from '@/components/BigButton';
import { ContentCapsule } from '@/components/brand/ContentCapsule';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { GameRulesEditor } from '@/components/settings/GameRulesEditor';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { PlayerChip } from '@/components/PlayerChip';
import { formatJoinCode } from '@/constants/relay';
import { GAME_LABELS } from '@/data';
import { getMultiplayerService } from '@/multiplayer';
import { useSessionStore } from '@/store/sessionStore';
import { useSessionGameScenery } from '@/hooks/useSessionGameScenery';
import { shareJoinInvite } from '@/utils/joinLink';
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
  const scenerySource = useSessionGameScenery();
  const relayJoinCode = useSessionStore((state) => state.relayJoinCode);

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
    <SceneryScrollShell scenerySource={scenerySource} contentContainerStyle={styles.container}>
      {isHost && relayJoinCode ? (
        <View style={styles.joinCodeCard}>
          <Text style={styles.joinCodeLabel}>Share this join code</Text>
          <Text style={styles.joinCodeValue}>{formatJoinCode(relayJoinCode)}</Text>
          <Text style={styles.joinCodeHint}>
            Share the invite link or code — passengers can join on cellular or Wi‑Fi.
          </Text>
          <BigButton
            label="Share invite"
            variant="secondary"
            onPress={() => {
              const hostName = session.players.find((p) => p.isHost)?.name;
              void shareJoinInvite(relayJoinCode, hostName);
            }}
          />
        </View>
      ) : null}

      <ContentCapsule>
        <Text style={styles.subtitle}>
          {isHost
            ? 'Friends can join while you get ready.'
            : 'Hang tight — the host will start the game.'}
        </Text>
      </ContentCapsule>

      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>Game</Text>
        <Text style={styles.badgeValue}>
          {session.gameType ? GAME_LABELS[session.gameType] : 'Unknown'}
        </Text>
      </View>

      <ContentCapsule style={styles.playersHeader}>
        <Text style={styles.sectionTitle}>Players ({session.players.length})</Text>
      </ContentCapsule>
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
        <SettingsSection title="Car rules">
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
              Passengers can join with the code above or nearby discovery on iPhone.
            </Text>
          </View>
          <BigButton
            label="Start Game!"
            disabled={!canStart}
            onPress={startHostedGame}
            variant="accent"
          />
          {!canStart ? (
            <ContentCapsule>
              <Text style={styles.helper}>
                Need at least one other player for competitive games.
              </Text>
            </ContentCapsule>
          ) : null}
        </>
      )}
    </SceneryScrollShell>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.heroSky,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGray,
    lineHeight: 22,
  },
  joinCodeCard: {
    backgroundColor: 'rgba(255, 243, 176, 0.95)',
    borderWidth: borders.thick,
    borderColor: colors.sunnyYellowDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  joinCodeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.roadGrayLight,
    textTransform: 'uppercase',
  },
  joinCodeValue: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    letterSpacing: 6,
    color: colors.roadGray,
  },
  joinCodeHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.roadGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: borders.thick,
    borderColor: colors.skyBlueDark,
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
  playersHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BigButton } from '@/components/BigButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GAME_LABELS } from '@/data';
import { useSessionStore } from '@/store/sessionStore';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function JoinScreen() {
  const refreshDiscovery = useSessionStore((state) => state.refreshDiscovery);
  const joinDiscoveredSession = useSessionStore((state) => state.joinDiscoveredSession);
  const discoveredSessions = useSessionStore((state) => state.discoveredSessions);
  const connectionStatus = useSessionStore((state) => state.connectionStatus);
  const [playerName, setPlayerName] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    refreshDiscovery();
  }, [refreshDiscovery]);

  const canJoin = playerName.trim().length >= 2;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader
        title="Join nearby"
        subtitle="Looking for hosts in this car. Allow Local Network when iOS asks, and stay on the same Wi‑Fi or hotspot."
      />

      <Text style={styles.label}>Your name</Text>
      <TextInput
        value={playerName}
        onChangeText={setPlayerName}
        placeholder="e.g. Emma"
        placeholderTextColor={colors.roadGrayLight}
        style={styles.input}
        autoCapitalize="words"
      />

      <View style={styles.discoveryHeader}>
        <Text style={styles.label}>Nearby games</Text>
        <Pressable onPress={refreshDiscovery}>
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>

      {discoveredSessions.length === 0 ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.skyBlueDark} />
          <Text style={styles.emptyText}>
            Waiting for a host…{'\n'}
            Tip: connect all phones to the same Personal Hotspot if needed.
          </Text>
        </View>
      ) : (
        discoveredSessions.map((session) => (
          <Pressable
            key={session.sessionId}
            style={styles.sessionCard}
            disabled={!canJoin || joiningId !== null}
            onPress={async () => {
              setJoiningId(session.sessionId);
              try {
                await joinDiscoveredSession(session.sessionId, playerName.trim());
                router.push(`/lobby/${session.sessionId}`);
              } finally {
                setJoiningId(null);
              }
            }}
          >
            <Text style={styles.sessionHost}>{session.hostName}&apos;s game</Text>
            <Text style={styles.sessionMeta}>
              {session.gameType ? GAME_LABELS[session.gameType] : 'Getting ready…'}
            </Text>
            {joiningId === session.sessionId || connectionStatus === 'connecting' ? (
              <ActivityIndicator color={colors.skyBlueDark} />
            ) : (
              <Text style={styles.tapHint}>Tap to join</Text>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
  input: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.roadGray,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refresh: {
    fontFamily: fonts.bodyBold,
    color: colors.skyBlueDark,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    textAlign: 'center',
    color: colors.roadGrayLight,
    lineHeight: 22,
  },
  sessionCard: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.skyBlueDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sessionHost: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.roadGray,
  },
  sessionMeta: {
    fontFamily: fonts.body,
    color: colors.roadGrayLight,
  },
  tapHint: {
    fontFamily: fonts.bodyBold,
    color: colors.grassGreenDark,
    marginTop: spacing.sm,
  },
});

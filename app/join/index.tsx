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
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { GAME_LABELS } from '@/data';
import { useSessionStore } from '@/store/sessionStore';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function JoinScreen() {
  const refreshDiscovery = useSessionStore((state) => state.refreshDiscovery);
  const joinDiscoveredSession = useSessionStore((state) => state.joinDiscoveredSession);
  const discoveredSessions = useSessionStore((state) => state.discoveredSessions);
  const connectionStatus = useSessionStore((state) => state.connectionStatus);
  const savedName = useSessionStore((state) => state.localPlayerName);
  const [playerName, setPlayerName] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (savedName) {
      setPlayerName(savedName);
    }
  }, [savedName]);

  useEffect(() => {
    refreshDiscovery();
  }, [refreshDiscovery]);

  const canJoin = playerName.trim().length >= 2;

  return (
    <SceneryBackground variant="join">
      <SafeAreaView style={styles.safe} pointerEvents="box-none">
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="e.g. Emma"
              placeholderTextColor={colors.roadGrayLight}
              style={styles.input}
              autoCapitalize="words"
            />
            <Text style={styles.hint}>
              Looking for hosts in this car. Allow Local Network when iOS asks, and stay on the
              same Wi‑Fi or hotspot.
            </Text>
          </View>

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
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    lineHeight: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
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

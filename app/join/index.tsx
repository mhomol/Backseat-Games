import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { formatJoinCodeInput, normalizeJoinCode } from '@/constants/relay';
import { GAME_LABELS } from '@/data';
import { useSessionStore } from '@/store/sessionStore';
import { joinCodeFromUrl } from '@/utils/joinLink';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function JoinScreen() {
  const { code: codeParam } = useLocalSearchParams<{ code?: string }>();
  const refreshDiscovery = useSessionStore((state) => state.refreshDiscovery);
  const joinDiscoveredSession = useSessionStore((state) => state.joinDiscoveredSession);
  const joinWithCode = useSessionStore((state) => state.joinWithCode);
  const discoveredSessions = useSessionStore((state) => state.discoveredSessions);
  const connectionStatus = useSessionStore((state) => state.connectionStatus);
  const savedName = useSessionStore((state) => state.localPlayerName);
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joiningByCode, setJoiningByCode] = useState(false);
  const [inviteJoinPending, setInviteJoinPending] = useState(false);
  const autoJoinStarted = useRef(false);

  const applyInviteCode = useCallback((rawCode: string) => {
    const normalized = normalizeJoinCode(rawCode);
    if (normalized.length !== 6) {
      return;
    }
    setJoinCode(formatJoinCodeInput(normalized));
    setInviteJoinPending(true);
  }, []);

  useEffect(() => {
    const raw = Array.isArray(codeParam) ? codeParam[0] : codeParam;
    if (typeof raw === 'string' && raw) {
      applyInviteCode(raw);
    }
  }, [codeParam, applyInviteCode]);

  useEffect(() => {
    const handleUrl = (url: string) => {
      const code = joinCodeFromUrl(url);
      if (code) {
        applyInviteCode(code);
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, [applyInviteCode]);

  const runJoinWithCode = useCallback(async () => {
    setJoiningByCode(true);
    try {
      const sessionId = await joinWithCode(joinCode, playerName.trim());
      router.push(`/lobby/${sessionId}`);
    } finally {
      setJoiningByCode(false);
      setInviteJoinPending(false);
    }
  }, [joinCode, joinWithCode, playerName]);

  useEffect(() => {
    if (
      !inviteJoinPending ||
      autoJoinStarted.current ||
      joiningByCode ||
      normalizeJoinCode(joinCode).length !== 6 ||
      playerName.trim().length < 2
    ) {
      return;
    }

    autoJoinStarted.current = true;
    void runJoinWithCode();
  }, [inviteJoinPending, joiningByCode, joinCode, playerName, runJoinWithCode]);

  useEffect(() => {
    if (savedName) {
      setPlayerName(savedName);
    }
  }, [savedName]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      refreshDiscovery();
    }
  }, [refreshDiscovery]);

  const canJoin = playerName.trim().length >= 2;
  const canJoinByCode = canJoin && normalizeJoinCode(joinCode).length === 6;
  const busy = joiningId !== null || joiningByCode;
  const showNearbyDiscovery =
    Platform.OS === 'ios' && normalizeJoinCode(joinCode).length === 0;

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
              On the road, use the host&apos;s join code — it works on cellular or Wi‑Fi. Nearby
              games below only work when every phone is on the same Wi‑Fi or hotspot.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Join code</Text>
            <TextInput
              value={joinCode}
              onChangeText={(value) => setJoinCode(formatJoinCodeInput(value))}
              placeholder="e.g. ABC-12D"
              placeholderTextColor={colors.roadGrayLight}
              style={[styles.input, styles.codeInput]}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
            />
            <Pressable
              style={[styles.codeButton, (!canJoinByCode || busy) && styles.codeButtonDisabled]}
              disabled={!canJoinByCode || busy}
              onPress={() => {
                void runJoinWithCode();
              }}
            >
              {joiningByCode ? (
                <ActivityIndicator color={colors.roadGray} />
              ) : (
                <Text style={styles.codeButtonText}>Join with code</Text>
              )}
            </Pressable>
          </View>

          {showNearbyDiscovery ? (
            <>
              <View style={styles.discoveryHeader}>
                <Text style={styles.label}>Nearby games (same Wi‑Fi only)</Text>
                <Pressable onPress={refreshDiscovery}>
                  <Text style={styles.refresh}>Refresh</Text>
                </Pressable>
              </View>

              {discoveredSessions.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    No nearby hosts found. Use the join code from the host&apos;s waiting room.
                  </Text>
                </View>
              ) : (
                discoveredSessions.map((session) => (
                  <Pressable
                    key={session.sessionId}
                    style={styles.sessionCard}
                    disabled={!canJoin || busy}
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
                      <Text style={styles.tapHint}>Tap to join nearby</Text>
                    )}
                  </Pressable>
                ))
              )}
            </>
          ) : null}
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
  codeInput: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    letterSpacing: 4,
    textAlign: 'center',
  },
  codeButton: {
    backgroundColor: colors.sunnyYellow,
    borderWidth: borders.thick,
    borderColor: colors.roadGray,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  codeButtonDisabled: {
    opacity: 0.5,
  },
  codeButtonText: {
    fontFamily: fonts.bodyBold,
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
    padding: spacing.lg,
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

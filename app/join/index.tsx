import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { formatJoinCodeInput, normalizeJoinCode } from '@/constants/relay';
import { useSessionStore } from '@/store/sessionStore';
import { joinCodeFromUrl } from '@/utils/joinLink';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function JoinScreen() {
  const { code: codeParam } = useLocalSearchParams<{ code?: string }>();
  const joinWithCode = useSessionStore((state) => state.joinWithCode);
  const savedName = useSessionStore((state) => state.localPlayerName);
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
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

  const canJoinByCode =
    playerName.trim().length >= 2 && normalizeJoinCode(joinCode).length === 6;

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
              Ask the host for their join code or tap a shared invite link. Works on cellular or
              Wi‑Fi — keep the app open during the trip.
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
              style={[styles.codeButton, (!canJoinByCode || joiningByCode) && styles.codeButtonDisabled]}
              disabled={!canJoinByCode || joiningByCode}
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
});

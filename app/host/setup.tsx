import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroSignHotspots } from '@/components/brand/HeroSignHotspots';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import type { GameType } from '@/types/game';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const signToGameType: Record<string, GameType> = {
  'license-plates': 'license-plates',
  'sign-game': 'sign-game',
  bingo: 'bingo',
};

export default function HostSetupScreen() {
  const hostGame = useSessionStore((state) => state.hostGame);
  const savedName = useSessionStore((state) => state.localPlayerName);
  const canHost = usePurchaseStore((state) => state.canHost);
  const [hostName, setHostName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canHost()) {
      router.replace('/');
    }
  }, [canHost]);

  useEffect(() => {
    if (savedName) {
      setHostName(savedName);
    }
  }, [savedName]);

  const canContinue = hostName.trim().length >= 2;

  const handleSignPress = async (signId: string) => {
    const gameType = signToGameType[signId];
    if (!gameType || !canContinue || loading) {
      return;
    }

    setLoading(true);
    try {
      const sessionId = await hostGame(gameType, hostName.trim());
      router.push(`/lobby/${sessionId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SceneryBackground variant="host">
      <HeroSignHotspots
        variant="host"
        disabled={!canContinue || loading}
        onPress={(signId) => {
          void handleSignPress(signId);
        }}
      />
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.skyBlueDark} />
        </View>
      ) : null}
      <SafeAreaView style={styles.safe} edges={['left', 'right']} pointerEvents="box-none">
        <View style={styles.formCard}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            value={hostName}
            onChangeText={setHostName}
            placeholder="e.g. Dad"
            placeholderTextColor={colors.roadGrayLight}
            style={styles.input}
            autoCapitalize="words"
          />
          <Text style={styles.hint}>You will host this session for everyone in the car.</Text>
          {!canContinue ? (
            <Text style={styles.nameHint}>Enter your name, then tap a game sign above.</Text>
          ) : null}
        </View>
      </SafeAreaView>
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 188,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    marginTop: spacing.sm,
  },
  nameHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.skyBlueDark,
    marginTop: spacing.sm,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 238, 0.45)',
  },
});

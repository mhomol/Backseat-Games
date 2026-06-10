import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { SignPostButton } from '@/components/brand/SignPostButton';
import { GAME_EMOJI, GAME_LABELS } from '@/data';
import { useSessionStore } from '@/store/sessionStore';
import type { GameType } from '@/types/game';
import type { SignPostColor } from '@/theme/brand';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const GAME_TYPES: GameType[] = ['license-plates', 'bingo', 'sign-game'];

const gameSignColor: Record<GameType, SignPostColor> = {
  'license-plates': 'pink',
  bingo: 'blue',
  'sign-game': 'green',
};

export default function HostSetupScreen() {
  const hostGame = useSessionStore((state) => state.hostGame);
  const savedName = useSessionStore((state) => state.localPlayerName);
  const [hostName, setHostName] = useState('');
  const [selected, setSelected] = useState<GameType>('license-plates');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (savedName) {
      setHostName(savedName);
    }
  }, [savedName]);

  const canContinue = hostName.trim().length >= 2;

  return (
    <SceneryBackground variant="host">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.heroSpacer} />

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
          </View>

          <View style={styles.signColumn}>
            {GAME_TYPES.map((gameType) => (
              <SignPostButton
                key={gameType}
                color={gameSignColor[gameType]}
                label={GAME_LABELS[gameType].toUpperCase()}
                icon={GAME_EMOJI[gameType]}
                selected={selected === gameType}
                onPress={() => setSelected(gameType)}
              />
            ))}
          </View>

          <BigButton
            label="Create waiting room"
            disabled={!canContinue}
            loading={loading}
            onPress={async () => {
              setLoading(true);
              try {
                const sessionId = await hostGame(selected, hostName.trim());
                router.push(`/lobby/${sessionId}`);
              } finally {
                setLoading(false);
              }
            }}
            style={styles.cta}
          />
        </ScrollView>
      </SafeAreaView>
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroSpacer: {
    minHeight: '34%',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
  signColumn: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  cta: {
    marginTop: spacing.sm,
  },
});

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BigButton } from '@/components/BigButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  GAME_DESCRIPTIONS,
  GAME_EMOJI,
  GAME_LABELS,
} from '@/data';
import { useSessionStore } from '@/store/sessionStore';
import type { GameType } from '@/types/game';
import { borders, colors, fonts, radii, shadows, spacing } from '@/theme';

const GAME_TYPES: GameType[] = ['license-plates', 'bingo', 'sign-game'];

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
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader
        title="Pick a game"
        subtitle="You will host this session for everyone in the car."
      />

      <Text style={styles.label}>Your name</Text>
      <TextInput
        value={hostName}
        onChangeText={setHostName}
        placeholder="e.g. Dad"
        placeholderTextColor={colors.roadGrayLight}
        style={styles.input}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Game type</Text>
      {GAME_TYPES.map((gameType) => {
        const active = selected === gameType;
        return (
          <Pressable
            key={gameType}
            onPress={() => setSelected(gameType)}
            style={[styles.gameCard, active && styles.gameCardActive]}
          >
            <Text style={styles.gameEmoji}>{GAME_EMOJI[gameType]}</Text>
            <View style={styles.gameCopy}>
              <Text style={styles.gameTitle}>{GAME_LABELS[gameType]}</Text>
              <Text style={styles.gameDescription}>
                {GAME_DESCRIPTIONS[gameType]}
              </Text>
            </View>
          </Pressable>
        );
      })}

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
      />
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
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  gameCardActive: {
    borderColor: colors.grassGreenDark,
    backgroundColor: '#E8F8EA',
  },
  gameEmoji: {
    fontSize: 36,
  },
  gameCopy: {
    flex: 1,
  },
  gameTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.roadGray,
  },
  gameDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.roadGrayLight,
    marginTop: spacing.xs,
  },
});

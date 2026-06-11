import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { GameRulesEditor } from '@/components/settings/GameRulesEditor';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { GAME_RULES_TITLE } from '@/data/gameRulesCopy';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { GameType } from '@/types/game';
import { colors, fonts, spacing } from '@/theme';

function parseGameType(value: string | string[] | undefined): GameType | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'license-plates' || raw === 'sign-game' || raw === 'bingo') {
    return raw;
  }
  return null;
}

export default function GameRulesSettingsScreen() {
  const { gameType: gameTypeParam } = useLocalSearchParams<{ gameType: string }>();
  const gameType = parseGameType(gameTypeParam);
  const preferences = usePreferencesStore((state) => state.preferences);
  const updateGameRules = usePreferencesStore((state) => state.updateGameRules);

  if (!gameType) {
    return null;
  }

  return (
    <SceneryBackground variant="lobby">
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.lead}>
            These defaults apply when you host a new game. Change rules for a single trip in the
            waiting room before you start.
          </Text>
          <SettingsSection title={GAME_RULES_TITLE[gameType]}>
            <GameRulesEditor
              gameType={gameType}
              rules={preferences.gameRules}
              onChange={updateGameRules}
            />
          </SettingsSection>
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
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.roadGray,
    lineHeight: 20,
  },
});

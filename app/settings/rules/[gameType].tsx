import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { GameRulesEditor } from '@/components/settings/GameRulesEditor';
import { SettingsScreenShell } from '@/components/settings/SettingsScreenShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { GAME_RULES_TITLE } from '@/data/gameRulesCopy';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { GameType } from '@/types/game';
import { colors, fonts } from '@/theme';

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
    <SettingsScreenShell>
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
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.roadGray,
    lineHeight: 20,
  },
});

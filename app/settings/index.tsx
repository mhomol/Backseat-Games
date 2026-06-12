import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { GameRecordRow } from '@/components/settings/GameRecordRow';
import { SettingsLinkRow } from '@/components/settings/SettingsLinkRow';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsToggle } from '@/components/settings/SettingsToggle';
import { GAME_RULES_TITLE } from '@/data/gameRulesCopy';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useStatsStore } from '@/store/statsStore';
import type { GameType } from '@/types/game';
import { colors, fonts, spacing } from '@/theme';

const GAME_TYPES: GameType[] = ['license-plates', 'sign-game', 'bingo'];

export default function SettingsScreen() {
  const preferences = usePreferencesStore((state) => state.preferences);
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  const stats = useStatsStore((state) => state.stats);

  return (
    <SceneryScrollShell>
      <SettingsSection title="Sound & Haptics">
        <SettingsToggle
          label="Sound effects"
          description="Button taps and winner celebrations."
          value={preferences.soundEffectsEnabled}
          onValueChange={(soundEffectsEnabled) => updatePreferences({ soundEffectsEnabled })}
        />
        <SettingsToggle
          label="Haptics"
          description="Light vibration on button presses."
          value={preferences.hapticsEnabled}
          onValueChange={(hapticsEnabled) => updatePreferences({ hapticsEnabled })}
        />
      </SettingsSection>

      <SettingsSection title="Your record">
        <Text style={styles.recordHint}>W–L–T per game. Saved on this device only.</Text>
        {GAME_TYPES.map((gameType) => (
          <GameRecordRow
            key={gameType}
            label={GAME_RULES_TITLE[gameType]}
            outcome={stats.byGame[gameType]}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="House rules (defaults)">
        {GAME_TYPES.map((gameType) => (
          <SettingsLinkRow
            key={gameType}
            label={GAME_RULES_TITLE[gameType]}
            description="Default rules for new games you host"
            onPress={() => router.push(`/settings/rules/${gameType}`)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Help">
        <SettingsLinkRow
          label="How to play"
          onPress={() => router.push('/settings/how-to-play')}
        />
        <SettingsLinkRow
          label="Multiplayer tips"
          onPress={() => router.push('/settings/tips')}
        />
        <SettingsLinkRow label="About" onPress={() => router.push('/settings/about')} />
      </SettingsSection>
    </SceneryScrollShell>
  );
}

const styles = StyleSheet.create({
  recordHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    marginBottom: spacing.xs,
  },
});

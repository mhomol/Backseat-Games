import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { SettingsLinkRow } from '@/components/settings/SettingsLinkRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsToggle } from '@/components/settings/SettingsToggle';
import { GAME_RULES_TITLE } from '@/data/gameRulesCopy';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { GameType } from '@/types/game';
import { spacing } from '@/theme';

const GAME_TYPES: GameType[] = ['license-plates', 'sign-game', 'bingo'];

export default function SettingsScreen() {
  const preferences = usePreferencesStore((state) => state.preferences);
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);

  return (
    <SceneryBackground variant="lobby">
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container}>
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
});

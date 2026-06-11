import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts, spacing } from '@/theme';

const TIPS = [
  'Make sure the host created a waiting room before others try to join.',
  'Keep every phone on the same Personal Hotspot — usually the host or a parent phone.',
  'Leave Backseat Games open and on screen during play. iOS limits background sync.',
  'Tap Refresh on the Join screen if a session does not appear after ~30 seconds.',
  'Competitive games need at least one other player. Travel Bingo can be played solo.',
];

export default function TipsScreen() {
  return (
    <SceneryBackground variant="lobby">
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container}>
          <SettingsSection title="Multiplayer tips">
            {TIPS.map((tip) => (
              <Text key={tip} style={styles.tip}>
                • {tip}
              </Text>
            ))}
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
  tip: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.roadGray,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});

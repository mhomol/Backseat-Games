import { StyleSheet, Text } from 'react-native';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts, spacing } from '@/theme';

const TIPS = [
  'Make sure the host created a waiting room before others try to join.',
  'Keep every phone on the same Personal Hotspot — usually the host or a parent phone.',
  'Leave Backseat Games open and on screen during play. iOS limits background sync.',
  'Tap Refresh on the Join screen if a session does not appear after ~30 seconds.',
  'Competitive online games need at least one other player. Solo Mode is free on this phone with Play online off.',
];

export default function TipsScreen() {
  return (
    <SceneryScrollShell>
      <SettingsSection title="Multiplayer tips">
        {TIPS.map((tip) => (
          <Text key={tip} style={styles.tip}>
            • {tip}
          </Text>
        ))}
      </SettingsSection>
    </SceneryScrollShell>
  );
}

const styles = StyleSheet.create({
  tip: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.roadGray,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});

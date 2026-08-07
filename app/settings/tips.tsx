import { Platform, StyleSheet, Text } from 'react-native';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts, spacing } from '@/theme';

const IOS_TIPS = [
  'Make sure the host created a waiting room before others try to join.',
  'Keep every phone on the same Personal Hotspot — usually the host or a parent phone.',
  'Leave Backseat Games open and on screen during play. iOS limits background sync.',
  'Tap Refresh on the Join screen if a session does not appear after ~30 seconds.',
  'Competitive online games need at least one other player. Solo Mode is free on this phone with Play online off.',
];

const ANDROID_TIPS = [
  'Solo Mode is ready now — leave Play online off and tap a game sign to play offline.',
  'Join and Play online are coming soon on Android. They will share join codes like iPhone.',
  'Leave Backseat Games open and on screen during play for the best experience.',
  'Optional Sign Game voice input may ask for microphone permission — you can deny and type instead.',
];

export default function TipsScreen() {
  const tips = Platform.OS === 'android' ? ANDROID_TIPS : IOS_TIPS;
  const title = Platform.OS === 'android' ? 'Android tips' : 'Multiplayer tips';

  return (
    <SceneryScrollShell>
      <SettingsSection title={title}>
        {tips.map((tip) => (
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

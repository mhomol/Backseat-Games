import Constants from 'expo-constants';
import { StyleSheet, Text } from 'react-native';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts, spacing } from '@/theme';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SceneryScrollShell>
      <SettingsSection title="Backseat Games">
        <Text style={styles.body}>
          Road-trip games for the whole car — license plates, sign spotting, and travel bingo.
          One phone hosts; everyone else joins nearby with no internet required.
        </Text>
        <Text style={styles.meta}>Version {version}</Text>
        <Text style={styles.body}>
          Questions or feedback from TestFlight? Tell us what worked and what felt confusing on
          your next drive.
        </Text>
      </SettingsSection>
    </SceneryScrollShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.roadGray,
    lineHeight: 22,
  },
  meta: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.roadGrayLight,
    marginVertical: spacing.sm,
  },
});

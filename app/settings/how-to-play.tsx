import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts, spacing } from '@/theme';

const SECTIONS = [
  {
    title: 'Getting started',
    body:
      'One phone hosts the game. Everyone else joins from the Join screen. Keep all phones on the same Personal Hotspot and leave Backseat Games open during play.',
  },
  {
    title: 'License Plates',
    body:
      'Spot plates from US states and Canadian provinces. Tap a cell to claim it; tap again to unclaim if house rules allow. Most plates when the host ends the game wins.',
  },
  {
    title: 'Sign Game',
    body:
      'Race from A to Z using words on road signs. Each player advances independently. Duplicate words are blocked unless house rules allow them. Q, X, and Z matching depends on your house rules.',
  },
  {
    title: 'Travel Bingo',
    body:
      'Each player gets a unique 5×5 card. Mark squares when you spot items. Win on a line or a full-card blackout, depending on house rules.',
  },
];

export default function HowToPlayScreen() {
  return (
    <SceneryBackground variant="lobby">
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.container}>
          {SECTIONS.map((section) => (
            <SettingsSection key={section.title} title={section.title}>
              <Text style={styles.body}>{section.body}</Text>
            </SettingsSection>
          ))}
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
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.roadGray,
    lineHeight: 22,
  },
});

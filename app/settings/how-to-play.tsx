import { StyleSheet, Text } from 'react-native';
import { SettingsScreenShell } from '@/components/settings/SettingsScreenShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts } from '@/theme';

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
    <SettingsScreenShell>
      {SECTIONS.map((section) => (
        <SettingsSection key={section.title} title={section.title}>
          <Text style={styles.body}>{section.body}</Text>
        </SettingsSection>
      ))}
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.roadGray,
    lineHeight: 22,
  },
});

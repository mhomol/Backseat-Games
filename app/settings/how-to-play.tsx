import { StyleSheet, Text } from 'react-native';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts } from '@/theme';

const SECTIONS = [
  {
    title: 'Getting started',
    body:
      'One phone hosts the game. Passengers join with the host join code — it works on cellular or Wi‑Fi. Keep Backseat Games open in the foreground during play. If you lose signal, re-enter the same join code and name to rejoin.',
  },
  {
    title: 'License Plates',
    body:
      'Spot plates from US states and Canadian provinces. Tap a cell to claim it; tap again to unclaim if car rules allow. Most plates when the host ends the game wins.',
  },
  {
    title: 'Sign Game',
    body:
      'Race from A to Z using words on road signs. Each player advances independently. Duplicate words are blocked unless car rules allow them. Q, X, and Z matching depends on your car rules.',
  },
  {
    title: 'Travel Bingo',
    body:
      'Each player gets a unique 5×5 card. Mark squares when you spot items. Win on a line or a full-card blackout, depending on car rules.',
  },
];

export default function HowToPlayScreen() {
  return (
    <SceneryScrollShell>
      {SECTIONS.map((section) => (
        <SettingsSection key={section.title} title={section.title}>
          <Text style={styles.body}>{section.body}</Text>
        </SettingsSection>
      ))}
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
});

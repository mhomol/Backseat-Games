import { StyleSheet, Text } from 'react-native';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { colors, fonts } from '@/theme';

const SECTIONS = [
  {
    title: 'Getting started',
    body:
      'One phone hosts the game. Passengers join with the host join code — it works on cellular or Wi‑Fi. Keep Backseat Games open in the foreground during play. If you lose signal, re-enter the same join code and name to rejoin. If the host’s phone leaves, keep this app open so they can come back; the app does not hand hosting to a passenger. If they cannot return, start a new game with a new join code.',
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
  {
    title: 'Hangman',
    body:
      'Solo: pick Easy, Medium, or Hard; words come from a local list on this phone. Online Hangman is exactly two phones: one player types a word, the other guesses letters. Roles swap each round. First to 5 points wins.',
  },
  {
    title: 'Color Catch',
    body:
      'Each player gets a unique 5×5 card of vehicle colors. The center is always marked. Tap when you spot that color on a vehicle. Win on a line or blackout, same as Travel Bingo.',
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

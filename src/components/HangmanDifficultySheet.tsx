import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { HangmanDifficulty } from '@/data/hangmanDictionary';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const OPTIONS: { id: HangmanDifficulty; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: 'Short everyday words' },
  { id: 'medium', label: 'Medium', hint: 'Longer words and fun phrases' },
  { id: 'hard', label: 'Hard', hint: 'Tricky words and longer phrases' },
];

type HangmanDifficultySheetProps = {
  visible: boolean;
  onPick: (difficulty: HangmanDifficulty) => void;
  onCancel: () => void;
};

export function HangmanDifficultySheet({
  visible,
  onPick,
  onCancel,
}: HangmanDifficultySheetProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Hangman Solo</Text>
          <Text style={styles.message}>Pick a difficulty for this trip.</Text>
          {OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={styles.choice}
              onPress={() => onPick(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
            >
              <Text style={styles.choiceLabel}>{option.label}</Text>
              <Text style={styles.choiceHint}>{option.hint}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onCancel} accessibilityRole="button">
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.cream,
    borderWidth: borders.extraThick,
    borderColor: colors.coralDark,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.roadGray,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGrayLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  choice: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  choiceLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.roadGray,
  },
  choiceHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    marginTop: 2,
  },
  cancel: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGrayLight,
  },
});

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ColorCatchDifficulty } from '@/types/preferences';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const OPTIONS: { id: ColorCatchDifficulty; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: '9 squares, middle already marked' },
  { id: 'hard', label: 'Hard', hint: '25 squares, unique 5×5 card' },
];

type ColorCatchDifficultySheetProps = {
  visible: boolean;
  onPick: (difficulty: ColorCatchDifficulty) => void;
  onCancel: () => void;
};

export function ColorCatchDifficultySheet({
  visible,
  onPick,
  onCancel,
}: ColorCatchDifficultySheetProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Color Catch</Text>
          <Text style={styles.message}>Pick a board for this trip.</Text>
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

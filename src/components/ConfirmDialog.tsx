import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '@/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Keep playing',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
            </Pressable>
          </View>
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
    gap: spacing.md,
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
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
  confirmButton: {
    backgroundColor: colors.coral,
    borderWidth: borders.thick,
    borderColor: colors.coralDark,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.cloudWhite,
  },
});

import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '../theme';

type ToastBannerProps = {
  message: string | null;
  onDismiss: () => void;
};

export function ToastBanner({ message, onDismiss }: ToastBannerProps) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={!!message}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.banner}>
          <Text style={styles.title}>Hold on!</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  banner: {
    backgroundColor: colors.coral,
    borderWidth: borders.extraThick,
    borderColor: colors.coralDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.cloudWhite,
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.cloudWhite,
  },
});

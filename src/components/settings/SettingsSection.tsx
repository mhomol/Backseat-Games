import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '@/theme';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.roadGray,
    marginBottom: spacing.xs,
  },
});

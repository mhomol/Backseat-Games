import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

type SettingsLinkRowProps = {
  label: string;
  description?: string;
  onPress: () => void;
};

export function SettingsLinkRow({ label, description, onPress }: SettingsLinkRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
  },
  chevron: {
    fontFamily: fonts.bodyBold,
    fontSize: 24,
    color: colors.roadGrayLight,
    marginLeft: spacing.sm,
  },
});

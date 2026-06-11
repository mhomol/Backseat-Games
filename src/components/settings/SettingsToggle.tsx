import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

type SettingsToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingsToggleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.plateOther, true: colors.grassGreen }}
        thumbColor={value ? colors.grassGreen : colors.cloudWhite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
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
    lineHeight: 18,
  },
});

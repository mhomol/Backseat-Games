import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '../theme';

type PlayerChipProps = {
  name: string;
  isHost?: boolean;
  highlight?: boolean;
};

export function PlayerChip({ name, isHost, highlight }: PlayerChipProps) {
  return (
    <View
      style={[
        styles.chip,
        highlight && styles.highlight,
        isHost && styles.host,
      ]}
    >
      <Text style={styles.text}>
        {isHost ? '★ ' : ''}
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.cream,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlight: {
    backgroundColor: colors.grassGreen,
    borderColor: colors.grassGreenDark,
  },
  host: {
    borderColor: colors.sunnyYellowDark,
  },
  text: {
    fontFamily: fonts.bodyBold,
    color: colors.roadGray,
    fontSize: 16,
  },
});

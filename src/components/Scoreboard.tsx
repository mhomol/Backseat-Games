import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '../theme';

type ScoreboardProps = {
  scores: Array<{ name: string; score: number; isYou?: boolean }>;
};

export function Scoreboard({ scores }: ScoreboardProps) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  return (
    <View style={styles.container}>
      {sorted.map((entry) => (
        <View
          key={entry.name}
          style={[styles.row, entry.isYou && styles.youRow]}
        >
          <Text style={styles.name}>{entry.name}</Text>
          <Text style={styles.score}>{entry.score}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  youRow: {
    borderColor: colors.grassGreenDark,
    backgroundColor: '#E8F8EA',
  },
  name: {
    fontFamily: fonts.bodyBold,
    color: colors.roadGray,
  },
  score: {
    fontFamily: fonts.display,
    color: colors.skyBlueDark,
    fontSize: 18,
  },
});

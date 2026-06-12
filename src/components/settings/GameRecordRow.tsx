import { StyleSheet, Text, View } from 'react-native';
import type { GameOutcome } from '@/types/stats';
import { colors, fonts, spacing } from '@/theme';

type GameRecordRowProps = {
  label: string;
  outcome: GameOutcome;
};

function formatRecord({ wins, losses, ties }: GameOutcome): string {
  return `${wins}–${losses}–${ties}`;
}

export function GameRecordRow({ label, outcome }: GameRecordRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.record}>{formatRecord(outcome)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
  record: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.skyBlueDark,
  },
});

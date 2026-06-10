import { StyleSheet, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { colors, spacing } from '@/theme';

type GameEndBarProps = {
  isHost: boolean;
  onPress: () => void;
};

export function GameEndBar({ isHost, onPress }: GameEndBarProps) {
  return (
    <View style={styles.bar}>
      <BigButton
        label={isHost ? 'End Game' : 'Leave Game'}
        variant="danger"
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.roadGrayLight,
    backgroundColor: colors.cream,
  },
});

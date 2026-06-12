import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/theme';

type StackBackButtonProps = {
  label?: string;
};

/** Matches the default stack back control on child screens (chevron + Back). */
export function StackBackButton({ label = 'Back' }: StackBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.back()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.hit}
    >
      <Text style={styles.chevron}>‹</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginLeft: -8,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 28,
    lineHeight: 28,
    color: colors.roadGray,
    marginTop: -2,
    marginRight: -2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.roadGray,
  },
});

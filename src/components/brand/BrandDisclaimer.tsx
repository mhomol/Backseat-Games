import { StyleSheet, Text } from 'react-native';
import { fonts, spacing } from '@/theme';

export function BrandDisclaimer() {
  return (
    <Text style={styles.text}>
      One phone hosts. Everyone else joins nearby — no internet needed.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.body,
    fontStyle: 'italic',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'right',
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

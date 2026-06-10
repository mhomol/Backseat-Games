import { StyleSheet, Text } from 'react-native';
import { fonts, spacing } from '@/theme';
import { brand } from '@/theme/brand';

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
    color: brand.road,
    textAlign: 'right',
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
});

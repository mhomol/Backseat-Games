import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export function SettingsBackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() => router.back()}
      style={styles.hit}
    >
      <Text style={styles.glyph}>{'<'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
  glyph: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 30,
    color: colors.roadGray,
  },
});

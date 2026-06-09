import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '../theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.roadGray,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGrayLight,
    marginTop: spacing.xs,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { borders, colors, fonts, radii, shadows, spacing } from '../theme';

type BigButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const variantColors = {
  primary: { bg: colors.skyBlue, border: colors.skyBlueDark, text: colors.roadGray },
  secondary: { bg: colors.cream, border: colors.roadGrayLight, text: colors.roadGray },
  accent: { bg: colors.sunnyYellow, border: colors.sunnyYellowDark, text: colors.roadGray },
  danger: { bg: colors.coral, border: colors.coralDark, text: colors.cloudWhite },
};

export function BigButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: BigButtonProps) {
  const scale = useSharedValue(1);
  const palette = variantColors[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        disabled={disabled || loading}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[
          styles.button,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={palette.text} />
        ) : (
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: borders.thick,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...shadows.button,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 20,
  },
});

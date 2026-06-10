import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

type Options = {
  title: string;
  showEndButton: boolean;
  endLabel: string;
  onEndPress: () => void;
};

export function useGameScreenHeader({
  title,
  showEndButton,
  endLabel,
  onEndPress,
}: Options) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerBackVisible: false,
      gestureEnabled: !showEndButton,
      headerRight: showEndButton
        ? () => (
            <Pressable
              onPress={onEndPress}
              style={styles.endButton}
              accessibilityRole="button"
              accessibilityLabel={endLabel}
            >
              <Text style={styles.endButtonText}>{endLabel}</Text>
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, title, showEndButton, endLabel, onEndPress]);
}

const styles = StyleSheet.create({
  endButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  endButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.coral,
  },
});

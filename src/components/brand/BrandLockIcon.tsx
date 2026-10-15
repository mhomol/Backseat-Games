import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

type BrandLockIconProps = {
  size?: number;
  color?: string;
};

/** Cartoon padlock — cream body, brand-pink shackle. Replaces lock emoji. */
export function BrandLockIcon({
  size = 22,
  color = colors.coral,
}: BrandLockIconProps) {
  const shackleWidth = size * 0.52;
  const shackleHeight = size * 0.42;
  const stroke = Math.max(2, size * 0.11);
  const bodyWidth = size * 0.78;
  const bodyHeight = size * 0.52;
  const keyhole = Math.max(3, size * 0.16);

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <View
        style={{
          width: shackleWidth,
          height: shackleHeight,
          borderWidth: stroke,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: shackleWidth / 2,
          borderTopRightRadius: shackleWidth / 2,
          marginBottom: -stroke,
        }}
      />
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          backgroundColor: colors.cream,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: size * 0.16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: keyhole,
            height: keyhole,
            borderRadius: keyhole / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

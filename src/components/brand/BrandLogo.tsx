import { Image, StyleSheet, View } from 'react-native';
import { logoLockup } from '@/data/brandAssets';
import { spacing } from '@/theme';

type BrandLogoProps = {
  /** Use on screens where the hero already includes the logo (smaller / hidden). */
  variant?: 'hero' | 'standalone';
};

export function BrandLogo({ variant = 'standalone' }: BrandLogoProps) {
  if (variant === 'hero') {
    return <View style={styles.heroSpacer} />;
  }

  return (
    <View style={styles.wrap}>
      <Image source={logoLockup} style={styles.logo} resizeMode="contain" accessibilityLabel="Backseat Games" />
    </View>
  );
}

const styles = StyleSheet.create({
  heroSpacer: {
    minHeight: '32%',
  },
  wrap: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: '100%',
    height: 120,
  },
});

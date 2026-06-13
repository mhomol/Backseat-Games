import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SceneryVariant } from '@/data/brandAssets';
import { STACK_HEADER_CLEARANCE } from '@/components/brand/SceneryScrollShell';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { spacing } from '@/theme';

type SceneryScreenFrameProps = {
  children: ReactNode;
  variant?: SceneryVariant;
  scenerySource?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  headerClearance?: boolean;
};

/** Full-bleed scenery with flex layout (game boards, grids). */
export function SceneryScreenFrame({
  children,
  variant = 'lobby',
  scenerySource,
  style,
  headerClearance = true,
}: SceneryScreenFrameProps) {
  return (
    <SceneryBackground variant={variant} scenerySource={scenerySource}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View
          style={[
            styles.content,
            headerClearance && styles.withHeaderClearance,
            style,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  withHeaderClearance: {
    paddingTop: STACK_HEADER_CLEARANCE,
  },
});

import type { ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  type ImageSourcePropType,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SceneryVariant } from '@/data/brandAssets';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { spacing } from '@/theme';

/** Opaque stack headers float over full-bleed scenery — keep scroll content below them. */
export const STACK_HEADER_CLEARANCE =
  (Platform.select({ ios: 44, android: 56, default: 44 }) ?? 44) + spacing.lg;

type SceneryScrollShellProps = {
  children: ReactNode;
  variant?: SceneryVariant;
  scenerySource?: ImageSourcePropType;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  headerClearance?: boolean;
};

export function SceneryScrollShell({
  children,
  variant = 'lobby',
  scenerySource,
  contentContainerStyle,
  headerClearance = true,
}: SceneryScrollShellProps) {
  return (
    <SceneryBackground variant={variant} scenerySource={scenerySource}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            headerClearance && styles.withHeaderClearance,
            contentContainerStyle,
          ]}
          contentInsetAdjustmentBehavior="never"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  withHeaderClearance: {
    paddingTop: STACK_HEADER_CLEARANCE,
  },
});

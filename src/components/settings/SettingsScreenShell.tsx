import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { spacing } from '@/theme';

/** Native stack header floats over full-bleed scenery in the settings group. */
export const SETTINGS_HEADER_CLEARANCE =
  (Platform.select({ ios: 44, android: 56, default: 44 }) ?? 44) + spacing.lg;

type SettingsScreenShellProps = {
  children: ReactNode;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
};

export function SettingsScreenShell({ children, contentContainerStyle }: SettingsScreenShellProps) {
  return (
    <SceneryBackground variant="lobby">
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={[styles.container, contentContainerStyle]}
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
    paddingTop: SETTINGS_HEADER_CLEARANCE,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
});

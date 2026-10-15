import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BrandLockIcon } from '@/components/brand/BrandLockIcon';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsLinkRow } from '@/components/settings/SettingsLinkRow';
import { themePacks } from '@/data/themes';
import type { ThemeId } from '@/types/theme';
import { THEME_IDS } from '@/types/theme';
import { colors, fonts, radii, spacing } from '@/theme';

type ThemePickerSectionProps = {
  selectedThemeId: ThemeId;
  ownsTheme: (themeId: ThemeId) => boolean;
  onSelect: (themeId: ThemeId) => void;
};

export function ThemePickerSection({
  selectedThemeId,
  ownsTheme,
  onSelect,
}: ThemePickerSectionProps) {
  return (
    <SettingsSection title="Theme">
      <Text style={styles.hint}>
        Classic is free. Holiday looks you own apply on this phone and on trips you host.
      </Text>
      {THEME_IDS.map((themeId) => {
        const pack = themePacks[themeId];
        const owned = ownsTheme(themeId);
        const selected = selectedThemeId === themeId && owned;
        return (
          <Pressable
            key={themeId}
            onPress={() => {
              if (owned) {
                onSelect(themeId);
                return;
              }
              router.push('/store');
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: false }}
            accessibilityLabel={
              owned ? `${pack.name} theme${selected ? ', selected' : ''}` : `${pack.name} theme, locked. Open Store`
            }
          >
            <View style={styles.copy}>
              <Text style={styles.label}>{pack.name}</Text>
              <Text style={styles.description}>
                {owned
                  ? selected
                    ? 'In use on this phone'
                    : 'Tap to apply'
                  : 'Locked — get it in the Store'}
              </Text>
            </View>
            {owned ? (
              <Text style={styles.mark}>{selected ? '●' : '○'}</Text>
            ) : (
              <View style={styles.lock}>
                <BrandLockIcon />
              </View>
            )}
          </Pressable>
        );
      })}
      <SettingsLinkRow
        label="Store"
        description="Preview, buy, and restore holiday themes"
        onPress={() => router.push('/store')}
      />
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
  },
  mark: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.roadGray,
    marginLeft: spacing.sm,
  },
  lock: {
    marginLeft: spacing.sm,
  },
});

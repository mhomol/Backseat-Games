import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnSkyText } from '@/components/brand/OnSkyText';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { BigButton } from '@/components/BigButton';
import { PAID_THEME_PACKS, themePacks } from '@/data/themes';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import type { PaidThemeId } from '@/types/theme';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function StoreScreen() {
  const selectedThemeId = usePreferencesStore((state) => state.preferences.selectedThemeId);
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  const ownsTheme = usePurchaseStore((state) => state.ownsTheme);
  const themePrice = usePurchaseStore((state) => state.themePrice);
  const busy = usePurchaseStore((state) => state.busy);
  const purchaseTheme = usePurchaseStore((state) => state.purchaseTheme);
  const restorePurchases = usePurchaseStore((state) => state.restorePurchases);

  const applyTheme = (themeId: PaidThemeId | 'classic') => {
    updatePreferences({ selectedThemeId: themeId });
    useSessionStore.setState({ toast: `${themePacks[themeId].name} theme is on.` });
  };

  const handleBuy = async (themeId: PaidThemeId) => {
    const result = await purchaseTheme(themeId);
    if (result.success) {
      applyTheme(themeId);
      return;
    }
    if (!result.cancelled) {
      useSessionStore.setState({
        toast: 'Could not complete purchase. Try again or use Restore purchases.',
      });
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    useSessionStore.setState({
      toast: restored
        ? 'Purchases restored for this Apple ID.'
        : 'No previous purchases found for this Apple ID.',
    });
  };

  return (
    <SceneryScrollShell>
      <OnSkyText style={styles.lead}>
        Holiday looks for the whole trip. Preview below, buy once, then apply anytime in Settings.
      </OnSkyText>
      <View style={styles.card}>
        <Image source={themePacks.classic.heroes.home} style={styles.preview} resizeMode="cover" />
        <Text style={styles.name}>Classic</Text>
        <Text style={styles.blurb}>The original road-trip look. Always free.</Text>
        <BigButton
          label={selectedThemeId === 'classic' ? 'In use' : 'Use this theme'}
          onPress={() => applyTheme('classic')}
          variant={selectedThemeId === 'classic' ? 'secondary' : 'accent'}
        />
      </View>
      {PAID_THEME_PACKS.map((pack) => {
        const themeId = pack.id as PaidThemeId;
        const owned = ownsTheme(themeId);
        const inUse = selectedThemeId === themeId && owned;
        return (
          <View key={pack.id} style={styles.card}>
            <Image source={pack.heroes.home} style={styles.preview} resizeMode="cover" />
            <Text style={styles.name}>{pack.name}</Text>
            <Text style={styles.blurb}>
              {themeId === 'thanksgiving'
                ? 'Autumn roadside, Turkey Trot bingo, and a pilgrim on Hangman.'
                : 'Winter roadside, Holiday Ride bingo, and Santa on Hangman.'}
            </Text>
            {owned ? (
              <BigButton
                label={inUse ? 'In use' : 'Use this theme'}
                onPress={() => applyTheme(themeId)}
                variant={inUse ? 'secondary' : 'accent'}
              />
            ) : (
              <BigButton
                label={busy ? 'Working…' : `Unlock for ${themePrice(themeId)}`}
                onPress={() => {
                  void handleBuy(themeId);
                }}
                variant="accent"
              />
            )}
          </View>
        );
      })}
      <Pressable onPress={() => void handleRestore()} accessibilityRole="button">
        <OnSkyText tone="link" style={styles.restore}>
          Restore purchases
        </OnSkyText>
      </Pressable>
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <OnSkyText tone="link" style={styles.restore}>
          Back
        </OnSkyText>
      </Pressable>
    </SceneryScrollShell>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.cream,
    borderWidth: borders.thick,
    borderColor: colors.sunnyYellowDark,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.roadGray,
  },
  blurb: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.roadGrayLight,
  },
  restore: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});

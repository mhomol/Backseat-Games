import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroSignHotspots } from '@/components/brand/HeroSignHotspots';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { HostUnlockSheet } from '@/components/purchases/HostUnlockSheet';
import { SettingsToggle } from '@/components/settings/SettingsToggle';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import type { GameType } from '@/types/game';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const signToGameType: Record<string, GameType> = {
  'license-plates': 'license-plates',
  'sign-game': 'sign-game',
  bingo: 'bingo',
};

const GAME_ROUTES: Record<GameType, string> = {
  'license-plates': '/game/license-plates',
  bingo: '/game/bingo',
  'sign-game': '/game/sign-game',
};

export default function HostSetupScreen() {
  const hostGame = useSessionStore((state) => state.hostGame);
  const savedName = useSessionStore((state) => state.localPlayerName);
  const canHost = usePurchaseStore((state) => state.canHost);
  const requiresPurchase = usePurchaseStore((state) => state.requiresPurchase);
  const productPrice = usePurchaseStore((state) => state.productPrice);
  const busy = usePurchaseStore((state) => state.busy);
  const purchaseHostUnlock = usePurchaseStore((state) => state.purchaseHostUnlock);
  const restorePurchases = usePurchaseStore((state) => state.restorePurchases);
  const [hostName, setHostName] = useState('');
  const [playOnline, setPlayOnline] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (savedName) {
      setHostName(savedName);
    }
  }, [savedName]);

  const canContinue = hostName.trim().length >= 2;

  const handlePlayOnlineChange = (next: boolean) => {
    if (!next) {
      setPlayOnline(false);
      return;
    }
    if (canHost()) {
      setPlayOnline(true);
      return;
    }
    setPaywallOpen(true);
  };

  const handlePurchase = async () => {
    const result = await purchaseHostUnlock();
    if (result.success) {
      setPaywallOpen(false);
      setPlayOnline(true);
      return;
    }
    if (!result.cancelled) {
      useSessionStore.setState({
        toast: requiresPurchase()
          ? 'Could not complete purchase. Check your connection and try again, or use Restore purchases.'
          : 'Purchase failed. Try again or contact support.',
      });
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      setPaywallOpen(false);
      setPlayOnline(true);
      return;
    }
    useSessionStore.setState({
      toast: 'No previous host unlock found for this Apple ID.',
    });
  };

  const handleSignPress = async (signId: string) => {
    const gameType = signToGameType[signId];
    if (!gameType || !canContinue || loading) {
      return;
    }

    if (playOnline && !canHost()) {
      setPaywallOpen(true);
      return;
    }

    setLoading(true);
    try {
      const sessionId = await hostGame(gameType, hostName.trim(), { solo: !playOnline });
      if (!playOnline) {
        router.replace(GAME_ROUTES[gameType]);
      } else {
        router.push(`/lobby/${sessionId}`);
      }
    } catch {
      // Toast set in hostGame when online unlock is missing.
    } finally {
      setLoading(false);
    }
  };

  return (
    <SceneryBackground variant="host">
      <HeroSignHotspots
        variant="host"
        disabled={!canContinue || loading}
        onPress={(signId) => {
          void handleSignPress(signId);
        }}
      />
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.skyBlueDark} />
        </View>
      ) : null}
      <SafeAreaView style={styles.safe} edges={['left', 'right']} pointerEvents="box-none">
        <View style={styles.formCard}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            value={hostName}
            onChangeText={setHostName}
            placeholder="e.g. Dad"
            placeholderTextColor={colors.roadGrayLight}
            style={styles.input}
            autoCapitalize="words"
          />
          <View style={styles.soloRow}>
            <SettingsToggle
              label="Play online"
              description="Share a join code so others can play. Requires a one-time host unlock."
              value={playOnline}
              onValueChange={handlePlayOnlineChange}
            />
          </View>
          <Text style={styles.hint}>
            {playOnline
              ? 'You will host this session for everyone in the car.'
              : 'Tap a game sign below to start playing right away — free, offline, on this phone.'}
          </Text>
          {!canContinue ? (
            <Text style={styles.nameHint}>Enter your name, then tap a game sign below.</Text>
          ) : null}
        </View>
      </SafeAreaView>
      <HostUnlockSheet
        visible={paywallOpen}
        priceLabel={productPrice}
        busy={busy}
        onPurchase={() => {
          void handlePurchase();
        }}
        onRestore={() => {
          void handleRestore();
        }}
        onDismiss={() => {
          if (!busy) {
            setPaywallOpen(false);
            setPlayOnline(false);
          }
        }}
      />
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 188,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
    marginBottom: spacing.xs,
  },
  soloRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.plateOther,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    marginTop: spacing.sm,
  },
  nameHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.skyBlueDark,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.roadGray,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 238, 0.45)',
  },
});

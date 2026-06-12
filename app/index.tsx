import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandDisclaimer } from '@/components/brand/BrandDisclaimer';
import { HeroSignHotspots } from '@/components/brand/HeroSignHotspots';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { HostUnlockSheet } from '@/components/purchases/HostUnlockSheet';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import { spacing } from '@/theme';

export default function HomeScreen() {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const canHost = usePurchaseStore((state) => state.canHost);
  const requiresPurchase = usePurchaseStore((state) => state.requiresPurchase);
  const productPrice = usePurchaseStore((state) => state.productPrice);
  const busy = usePurchaseStore((state) => state.busy);
  const purchaseHostUnlock = usePurchaseStore((state) => state.purchaseHostUnlock);
  const restorePurchases = usePurchaseStore((state) => state.restorePurchases);

  const handleStartPress = () => {
    if (canHost()) {
      router.push('/host/setup');
      return;
    }
    setPaywallOpen(true);
  };

  const handlePurchase = async () => {
    const result = await purchaseHostUnlock();
    if (result.success) {
      setPaywallOpen(false);
      router.push('/host/setup');
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
      router.push('/host/setup');
      return;
    }
    useSessionStore.setState({
      toast: 'No previous host unlock found for this Apple ID.',
    });
  };

  return (
    <SceneryBackground variant="home">
      <StatusBar style="dark" />
      <HeroSignHotspots
        variant="home"
        onPress={(id) => {
          if (id === 'start') {
            handleStartPress();
          } else if (id === 'join') {
            router.push('/join');
          } else if (id === 'settings') {
            router.push('/settings');
          }
        }}
      />
      <SafeAreaView style={styles.safe} pointerEvents="box-none">
        <View style={styles.footer}>
          <BrandDisclaimer />
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
          }
        }}
      />
    </SceneryBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    paddingBottom: spacing.xs,
  },
});

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GameRecordRow } from '@/components/settings/GameRecordRow';
import { SettingsLinkRow } from '@/components/settings/SettingsLinkRow';
import { SceneryScrollShell } from '@/components/brand/SceneryScrollShell';
import { FirstRunTeaching } from '@/components/onboarding/FirstRunTeaching';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsToggle } from '@/components/settings/SettingsToggle';
import { GAME_RULES_TITLE } from '@/data/gameRulesCopy';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useStatsStore } from '@/store/statsStore';
import { HostUnlockSheet } from '@/components/purchases/HostUnlockSheet';
import { useSessionStore } from '@/store/sessionStore';
import type { GameType } from '@/types/game';
import { colors, fonts, spacing } from '@/theme';

const GAME_TYPES: GameType[] = ['license-plates', 'sign-game', 'bingo'];

export default function SettingsScreen() {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [teachingOpen, setTeachingOpen] = useState(false);
  const preferences = usePreferencesStore((state) => state.preferences);
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  const stats = useStatsStore((state) => state.stats);
  const canHost = usePurchaseStore((state) => state.canHost);
  const requiresPurchase = usePurchaseStore((state) => state.requiresPurchase);
  const productPrice = usePurchaseStore((state) => state.productPrice);
  const busy = usePurchaseStore((state) => state.busy);
  const purchaseHostUnlock = usePurchaseStore((state) => state.purchaseHostUnlock);
  const restorePurchases = usePurchaseStore((state) => state.restorePurchases);

  const handlePurchase = async () => {
    const result = await purchaseHostUnlock();
    if (result.success) {
      setPaywallOpen(false);
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
    if (restored) {
      setPaywallOpen(false);
      return;
    }
    useSessionStore.setState({
      toast: 'No previous host unlock found for this Apple ID.',
    });
  };

  return (
    <SceneryScrollShell>
      {requiresPurchase() ? (
        <SettingsSection title="Hosting online">
          <SettingsLinkRow
            label="Unlock hosting online"
            description={`One-time ${productPrice} — share join codes for the car. Solo stays free.`}
            onPress={() => setPaywallOpen(true)}
          />
          <SettingsLinkRow
            label="Restore purchases"
            description="Already unlocked on this Apple ID?"
            onPress={() => {
              void handleRestore();
            }}
          />
        </SettingsSection>
      ) : (
        <SettingsSection title="Hosting online">
          <Text style={styles.recordHint}>
            {canHost()
              ? 'You can host online sessions on this device. Solo play is always free.'
              : 'Solo play is free. Unlock to host online with a join code.'}
          </Text>
          <SettingsLinkRow
            label="Restore purchases"
            description="Re-sync your host-online unlock from the App Store"
            onPress={() => {
              void handleRestore();
            }}
          />
        </SettingsSection>
      )}
      <SettingsSection title="Sound & Haptics">
        <SettingsToggle
          label="Sound effects"
          description="Taps, horns, bingo, and winner celebrations."
          value={preferences.soundEffectsEnabled}
          onValueChange={(soundEffectsEnabled) => updatePreferences({ soundEffectsEnabled })}
        />
        <SettingsToggle
          label="Opening jingle"
          description="Short tune when the app opens. Separate from game sounds."
          value={preferences.introJingleEnabled}
          onValueChange={(introJingleEnabled) => updatePreferences({ introJingleEnabled })}
        />
        <SettingsToggle
          label="Haptics"
          description="Light vibration on button presses."
          value={preferences.hapticsEnabled}
          onValueChange={(hapticsEnabled) => updatePreferences({ hapticsEnabled })}
        />
      </SettingsSection>

      <SettingsSection title="Your record">
        <Text style={styles.recordHint}>W–L–T per game. Saved on this device only.</Text>
        {GAME_TYPES.map((gameType) => (
          <GameRecordRow
            key={gameType}
            label={GAME_RULES_TITLE[gameType]}
            outcome={stats.byGame[gameType]}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Car rules (defaults)">
        {GAME_TYPES.map((gameType) => (
          <SettingsLinkRow
            key={gameType}
            label={GAME_RULES_TITLE[gameType]}
            description="Default rules for new games you host"
            onPress={() => router.push(`/settings/rules/${gameType}`)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Help">
        <SettingsLinkRow
          label="Quick start tips"
          description="Free solo, free join, and one-time unlock to host online"
          onPress={() => setTeachingOpen(true)}
        />
        <SettingsLinkRow
          label="How to play"
          onPress={() => router.push('/settings/how-to-play')}
        />
        <SettingsLinkRow
          label="Multiplayer tips"
          onPress={() => router.push('/settings/tips')}
        />
        <SettingsLinkRow label="About" onPress={() => router.push('/settings/about')} />
      </SettingsSection>
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
      <FirstRunTeaching visible={teachingOpen} onDone={() => setTeachingOpen(false)} />
    </SceneryScrollShell>
  );
}

const styles = StyleSheet.create({
  recordHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    marginBottom: spacing.xs,
  },
});

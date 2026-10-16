import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandDisclaimer } from '@/components/brand/BrandDisclaimer';
import { HeroSignHotspots } from '@/components/brand/HeroSignHotspots';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { StoreEntryButton } from '@/components/store/StoreEntryButton';
import { FirstRunTeaching } from '@/components/onboarding/FirstRunTeaching';
import { playOpenJingle } from '@/services/feedback';
import {
  hasSeenFirstRunTeaching,
  markFirstRunTeachingSeen,
} from '@/services/firstRunStorage';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  isOnlineMultiplayerAvailable,
  MULTIPLAYER_COMING_SOON_MESSAGE,
} from '@/utils/platformFeatures';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { spacing } from '@/theme';
import { statusBarStyleForSky } from '@/theme/navigation';

export default function HomeScreen() {
  const [teachingOpen, setTeachingOpen] = useState(false);
  const preferencesLoaded = usePreferencesStore((state) => state.loaded);
  const ownsTheme = usePurchaseStore((state) => state.ownsTheme);
  const showStoreBadge =
    !ownsTheme('halloween') || !ownsTheme('thanksgiving') || !ownsTheme('christmas');
  const themePack = useThemePack();

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }
    void playOpenJingle();
  }, [preferencesLoaded]);

  useEffect(() => {
    let cancelled = false;
    void hasSeenFirstRunTeaching().then((seen) => {
      if (!cancelled && !seen) {
        setTeachingOpen(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const finishTeaching = () => {
    setTeachingOpen(false);
    void markFirstRunTeachingSeen();
  };

  return (
    <SceneryBackground variant="home">
      <StatusBar style={statusBarStyleForSky(themePack.heroes.home.sky)} />
      {Platform.OS === 'ios' ? (
        <StoreEntryButton
          badge={showStoreBadge}
          onPress={() => {
            router.push('/store');
          }}
        />
      ) : null}
      <HeroSignHotspots
        variant="home"
        onPress={(id) => {
          if (id === 'start') {
            router.push('/host/setup');
          } else if (id === 'join') {
            if (!isOnlineMultiplayerAvailable()) {
              useSessionStore.setState({ toast: MULTIPLAYER_COMING_SOON_MESSAGE });
              return;
            }
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
      <FirstRunTeaching visible={teachingOpen} onDone={finishTeaching} />
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

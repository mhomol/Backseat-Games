import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandDisclaimer } from '@/components/brand/BrandDisclaimer';
import { HeroSignHotspots } from '@/components/brand/HeroSignHotspots';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { FirstRunTeaching } from '@/components/onboarding/FirstRunTeaching';
import { playOpenJingle } from '@/services/feedback';
import {
  hasSeenFirstRunTeaching,
  markFirstRunTeachingSeen,
} from '@/services/firstRunStorage';
import { usePreferencesStore } from '@/store/preferencesStore';
import { spacing } from '@/theme';

export default function HomeScreen() {
  const [teachingOpen, setTeachingOpen] = useState(false);
  const preferencesLoaded = usePreferencesStore((state) => state.loaded);

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
      <StatusBar style="dark" />
      <HeroSignHotspots
        variant="home"
        onPress={(id) => {
          if (id === 'start') {
            router.push('/host/setup');
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

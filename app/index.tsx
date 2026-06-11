import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandDisclaimer } from '@/components/brand/BrandDisclaimer';
import { HeroSignHotspots } from '@/components/brand/HeroSignHotspots';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { spacing } from '@/theme';

export default function HomeScreen() {
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

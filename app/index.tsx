import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandDisclaimer } from '@/components/brand/BrandDisclaimer';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { SceneryBackground } from '@/components/brand/SceneryBackground';
import { SignPostButton } from '@/components/brand/SignPostButton';
import { spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <SceneryBackground variant="home">
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <BrandLogo variant="hero" />
        <View style={styles.signColumn}>
          <SignPostButton
            color="pink"
            label="Start a Game"
            onPress={() => router.push('/host/setup')}
          />
          <SignPostButton
            color="green"
            label="Join a Game"
            onPress={() => router.push('/join')}
          />
          <SignPostButton color="blue" label="Settings" onPress={() => {}} />
        </View>
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
    justifyContent: 'space-between',
  },
  signColumn: {
    paddingLeft: spacing.lg,
    gap: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
  },
});

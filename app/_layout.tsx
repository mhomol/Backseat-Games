import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts as useFredoka,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts as useNunito,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { ToastBanner } from '@/components/ToastBanner';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fredokaLoaded] = useFredoka({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  const [nunitoLoaded] = useNunito({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const initialize = useSessionStore((state) => state.initialize);
  const toast = useSessionStore((state) => state.toast);
  const clearToast = useSessionStore((state) => state.clearToast);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (fredokaLoaded && nunitoLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fredokaLoaded, nunitoLoaded]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        // Foreground-only multiplayer — documented in FEATURES.md
      }
    });
    return () => subscription.remove();
  }, []);

  if (!fredokaLoaded || !nunitoLoaded) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.skyBlue },
          headerTintColor: colors.roadGray,
          headerTitleStyle: { fontFamily: 'Fredoka_600SemiBold' },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Backseat Games' }} />
        <Stack.Screen name="host/setup" options={{ title: 'Start a Game' }} />
        <Stack.Screen name="join/index" options={{ title: 'Join a Game' }} />
        <Stack.Screen name="lobby/[sessionId]" options={{ title: 'Waiting Room' }} />
        <Stack.Screen
          name="game/license-plates"
          options={{ title: 'License Plates' }}
        />
        <Stack.Screen name="game/bingo" options={{ title: 'Travel Bingo' }} />
        <Stack.Screen name="game/sign-game" options={{ title: 'Sign Game' }} />
      </Stack>
      <ToastBanner message={toast} onDismiss={clearToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
});

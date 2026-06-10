import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev reloads.
});

export default function RootLayout() {
  const [fredokaLoaded, fredokaError] = useFredoka({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  const [nunitoLoaded, nunitoError] = useNunito({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const initialize = useSessionStore((state) => state.initialize);
  const toast = useSessionStore((state) => state.toast);
  const clearToast = useSessionStore((state) => state.clearToast);

  const fontsReady = fredokaLoaded && nunitoLoaded;
  const fontError = fredokaError ?? nunitoError;

  useEffect(() => {
    void initialize().catch((error: unknown) => {
      console.error('Multiplayer initialize failed', error);
    });
  }, [initialize]);

  useEffect(() => {
    if (fontsReady || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady, fontError]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        // Foreground-only multiplayer — documented in FEATURES.md
      }
    });
    return () => subscription.remove();
  }, []);

  if (!fontsReady && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.skyBlue },
              headerTintColor: colors.roadGray,
              headerTitleStyle: { fontFamily: 'Fredoka_600SemiBold' },
              contentStyle: { backgroundColor: colors.cream },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="host/setup" options={{ headerShown: false }} />
            <Stack.Screen name="join/index" options={{ headerShown: false }} />
            <Stack.Screen name="lobby/[sessionId]" options={{ title: 'Waiting Room' }} />
            <Stack.Screen name="game" options={{ headerShown: false }} />
          </Stack>
          <ToastBanner message={toast} onDismiss={clearToast} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
});

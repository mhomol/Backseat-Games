import { Stack } from 'expo-router';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { stackScreenOptionsForPack } from '@/theme/navigation';

export default function GameLayout() {
  const stackOptions = stackScreenOptionsForPack(useThemePack());
  return (
    <Stack
      screenOptions={{
        ...stackOptions,
        headerBackVisible: false,
        headerLeft: () => null,
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
      }}
    >
      <Stack.Screen name="license-plates" options={{ title: 'License Plate Game' }} />
      <Stack.Screen name="bingo" options={{ title: 'Travel Bingo' }} />
      <Stack.Screen name="sign-game" options={{ title: 'Sign Game' }} />
      <Stack.Screen name="hangman" options={{ title: 'Hangman' }} />
      <Stack.Screen name="color-catch" options={{ title: 'Color Catch' }} />
    </Stack>
  );
}

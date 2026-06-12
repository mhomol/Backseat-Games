import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/theme/navigation';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        ...stackScreenOptions,
        headerBackVisible: false,
        headerLeft: () => null,
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
      }}
    >
      <Stack.Screen name="license-plates" options={{ title: 'License Plate Game' }} />
      <Stack.Screen name="bingo" options={{ title: 'Travel Bingo' }} />
      <Stack.Screen name="sign-game" options={{ title: 'Sign Game' }} />
    </Stack>
  );
}

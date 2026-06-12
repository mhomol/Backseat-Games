import { Stack } from 'expo-router';
import { StackBackButton } from '@/components/navigation/StackBackButton';
import { stackScreenOptions } from '@/theme/navigation';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        ...stackScreenOptions,
        headerLargeTitle: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          // Nested stack root — always show back to home even though canGoBack is false here.
          headerLeft: () => <StackBackButton />,
        }}
      />
      <Stack.Screen name="rules/[gameType]" options={{ title: 'House rules' }} />
      <Stack.Screen name="how-to-play" options={{ title: 'How to play' }} />
      <Stack.Screen name="tips" options={{ title: 'Multiplayer tips' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}

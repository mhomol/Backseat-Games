import { Stack } from 'expo-router';
import { StackBackButton } from '@/components/navigation/StackBackButton';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { stackScreenOptionsForPack } from '@/theme/navigation';

export default function SettingsLayout() {
  const stackOptions = stackScreenOptionsForPack(useThemePack());
  return (
    <Stack
      screenOptions={{
        ...stackOptions,
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
      <Stack.Screen name="rules/[gameType]" options={{ title: 'Car rules' }} />
      <Stack.Screen name="how-to-play" options={{ title: 'How to play' }} />
      <Stack.Screen name="tips" options={{ title: 'Multiplayer tips' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}

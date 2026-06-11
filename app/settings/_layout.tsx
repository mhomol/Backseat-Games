import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.heroSky },
        headerTintColor: colors.roadGray,
        headerTitleStyle: { fontFamily: 'Fredoka_600SemiBold' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.heroSky },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="rules/[gameType]" options={{ title: 'House rules' }} />
      <Stack.Screen name="how-to-play" options={{ title: 'How to play' }} />
      <Stack.Screen name="tips" options={{ title: 'Multiplayer tips' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}

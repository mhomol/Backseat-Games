import { Stack } from 'expo-router';
import { gameBrandColors } from '@/theme/brand';
import { colors } from '@/theme';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.roadGray,
        headerTitleStyle: { fontFamily: 'Fredoka_600SemiBold' },
        headerBackVisible: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="license-plates"
        options={{
          title: 'License Plate Game',
          headerStyle: { backgroundColor: gameBrandColors['license-plates'].primary },
        }}
      />
      <Stack.Screen
        name="bingo"
        options={{
          title: 'Travel Bingo',
          headerStyle: { backgroundColor: gameBrandColors.bingo.primary },
        }}
      />
      <Stack.Screen
        name="sign-game"
        options={{
          title: 'Sign Game',
          headerStyle: { backgroundColor: gameBrandColors['sign-game'].primary },
        }}
      />
    </Stack>
  );
}

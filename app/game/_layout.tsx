import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,
        headerBackTitle: 'Back',
      }}
    />
  );
}

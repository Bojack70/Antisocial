import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
      initialRouteName="onboarding/index"
    >
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

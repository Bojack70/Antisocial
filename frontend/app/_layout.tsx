import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_400Regular_Italic } from '@expo-google-fonts/inter/400Regular_Italic';
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather/400Regular';
import { Merriweather_700Bold } from '@expo-google-fonts/merriweather/700Bold';

// Imported one weight at a time on purpose: the package's root index pulls
// in all 18 Inter files, which Metro would then bundle. Merriweather is
// held to two faces for the same reason — it only ever sets titles.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_400Regular_Italic,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Hold the splash rather than flashing system-font text that reflows a
  // moment later. A font error still lets the app through on the fallback.
  if (!fontsLoaded && !fontError) {
    return null;
  }

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

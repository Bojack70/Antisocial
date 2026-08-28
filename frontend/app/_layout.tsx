import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans/400Regular';
import { OpenSans_500Medium } from '@expo-google-fonts/open-sans/500Medium';
import { OpenSans_600SemiBold } from '@expo-google-fonts/open-sans/600SemiBold';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans/700Bold';
import { OpenSans_400Regular_Italic } from '@expo-google-fonts/open-sans/400Regular_Italic';
import { Lora_400Regular } from '@expo-google-fonts/lora/400Regular';
import { Lora_700Bold } from '@expo-google-fonts/lora/700Bold';

// Imported one weight at a time on purpose: a package's root index pulls
// in every weight file, which Metro would then bundle. Lora is held to two
// faces for the same reason — it only ever sets titles.
//
// Lora + Open Sans replaced Merriweather + Inter 2026-08-28 to match the
// swipe reference: its serif is narrower and higher-contrast than
// Merriweather, its sans warmer and more humanist than Inter.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    OpenSans_400Regular_Italic,
    Lora_400Regular,
    Lora_700Bold,
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

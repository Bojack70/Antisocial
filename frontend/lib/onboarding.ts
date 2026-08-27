import AsyncStorage from '@react-native-async-storage/async-storage';

// Whether this visitor has been through the opening screens.
//
// The flag was already being written when onboarding finished, but nothing
// ever read it: the only thing pointing at those screens was
// `initialRouteName` in app/_layout.tsx, which governs the native back stack
// and does not decide the route on web. On the deployed site "/" therefore
// rendered the feed and first-time visitors never saw the premise at all.
//
// Lives in its own file so the key name exists in one place rather than being
// typed out at both the screen that sets it and the screen that checks it.

const KEY = 'onboarding_complete';

/**
 * True only for a visitor who has finished the opening screens.
 *
 * Errors resolve to true, not false: a storage failure should drop someone
 * into the feed, not trap them in onboarding on every launch.
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return true;
  }
}

export async function completeOnboarding(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}

/** Makes the next launch behave like a first visit. Handy for testing. */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

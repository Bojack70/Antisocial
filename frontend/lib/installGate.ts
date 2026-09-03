import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// The door: whether to show the install screen before anything else.
//
// It is asked once and then never again, whichever way it is answered —
// installing and declining both close it. A museum that asks you to install it
// every time you walk in is a museum you stop walking into, and the whole
// premise here is an app that doesn't nag.

const KEY = 'install_gate_answered';

/** Already running from a home screen, so there is nothing to offer. */
export function isStandalone(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)').matches === true ||
      (window.navigator as any).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * Whether the install screen should be the first thing the visitor sees.
 *
 * False on native (there is no browser to install from), false once the app is
 * running standalone, and false once the question has been answered either way.
 */
export async function shouldShowInstallGate(): Promise<boolean> {
  if (Platform.OS !== 'web') return false;
  if (isStandalone()) return false;
  try {
    return (await AsyncStorage.getItem(KEY)) === null;
  } catch {
    // Unreadable storage: don't gate. Being unable to read a flag is a bad
    // reason to put a wall in front of the app.
    return false;
  }
}

/** The question has been answered — installed, or declined. Don't ask again. */
export async function markInstallGateAnswered(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, new Date().toISOString());
  } catch {
    // Worst case it is asked once more next visit.
  }
}

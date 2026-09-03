import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../lib/theme';

// Getting the museum onto a home screen.
//
// The thing worth saying plainly: a web page CANNOT install itself. No
// browser lets a site trigger an install without a tap, and none ever will —
// it would be a drive-by app install. What a site CAN do is ask, and the ask
// is a single tap instead of a hunt through the browser menu.
//
// Two entirely different mechanisms, because the platforms differ:
//
//   Chrome, Edge, Samsung Internet, Opera, Firefox-on-Android
//     fire `beforeinstallprompt` once the app qualifies. Holding that event
//     and calling prompt() later opens the real system install sheet. This
//     needs the service worker in public/sw.js to be registered — without a
//     fetch handler the event never fires at all.
//
//   iOS Safari
//     has no such event and never has. The only path is Share -> Add to Home
//     Screen, done by hand. So there is nothing to trigger; the honest move
//     is to show the two steps and get out of the way.
//
// Anything else (a desktop browser, an already-installed launch) shows
// nothing rather than instructions that lead nowhere.

type Mode = 'none' | 'prompt' | 'ios';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as a Mac; the touch points give it away.
    (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1)
  );
}

function alreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  // Launched from the home screen: standalone display mode, or the
  // non-standard iOS flag that predates it.
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (window.navigator as any).standalone === true
  );
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<Mode>('none');
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (alreadyInstalled()) return;

    if (isIOS()) {
      setMode('ios');
      return;
    }

    const onPrompt = (event: any) => {
      // Without preventDefault Chrome may show its own mini-infobar, and the
      // event can no longer be replayed from our button.
      event.preventDefault();
      setDeferred(event);
      setMode('prompt');
    };
    const onInstalled = () => setMode('none');

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      // Dismissed, or the browser withdrew it. Either way the event is spent.
    }
    // A deferred prompt is single-use; holding a stale one would give a
    // button that silently does nothing on the second tap.
    setDeferred(null);
    setMode('none');
  };

  if (mode === 'none') return null;

  if (mode === 'ios') {
    return (
      <View style={styles.panel}>
        <Text style={styles.lead}>Keep it on your home screen.</Text>
        <View style={styles.steps}>
          <View style={styles.step}>
            <Ionicons name="share-outline" size={16} color={colors.muted} />
            <Text style={styles.stepText}>Tap Share, at the bottom of Safari.</Text>
          </View>
          <View style={styles.step}>
            <Ionicons name="add-circle-outline" size={16} color={colors.muted} />
            <Text style={styles.stepText}>Choose Add to Home Screen.</Text>
          </View>
        </View>
        <Text style={styles.aside}>
          It opens without the browser bar after that. There is no app store version.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.lead}>Keep it on your home screen.</Text>
      <TouchableOpacity style={styles.button} onPress={install} activeOpacity={0.8}>
        <Ionicons name="download-outline" size={16} color={colors.surface} />
        <Text style={styles.buttonText}>Add to home screen</Text>
      </TouchableOpacity>
      <Text style={styles.aside}>
        It opens without the browser bar after that. There is no app store version.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  lead: {
    fontFamily: fonts.serifRegular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
  },
  steps: {
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.body,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.surface,
  },
  aside: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
});

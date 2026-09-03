import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Text from './AppText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../lib/theme';
import { markInstallGateAnswered } from '../lib/installGate';

// The first thing a visitor sees, before the opening screens.
//
// What this can and cannot be, stated plainly because it shapes the design:
// a page cannot install itself. Every browser requires a tap, and Chrome will
// only surrender its one-tap system sheet once it has decided the visitor is
// engaged enough. That decision is usually NOT made on a first page load.
//
// So this screen never assumes the sheet is available. It has three states and
// always offers something real:
//
//   ready   Chrome has handed over the event. One tap opens the system sheet.
//   manual  It hasn't (yet). Show where the browser keeps the same command,
//           and swap to the one-tap button live if the event turns up while
//           this screen is open.
//   ios     Safari has no such event and never has. Show the Share steps.
//
// And it is always skippable. This is a link people are sent; a wall in front
// of it costs visitors, and an app about not demanding attention should not
// open by demanding something.

type Mode = 'ready' | 'manual' | 'ios';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1)
  );
}

export default function InstallGate({ onContinue }: { onContinue: () => void }) {
  const [mode, setMode] = useState<Mode>(() => (isIOS() ? 'ios' : 'manual'));

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (isIOS()) return;

    // The event is parked on the window by the shell in app/+html.tsx, since
    // Chrome fires it once and often before any of this has mounted.
    const take = () => {
      if ((window as any).__installEvent) setMode('ready');
    };
    take();
    window.addEventListener('installavailable', take);
    return () => window.removeEventListener('installavailable', take);
  }, []);

  const dismiss = async () => {
    await markInstallGateAnswered();
    onContinue();
  };

  const install = async () => {
    const event = (window as any).__installEvent;
    if (!event) return;
    event.prompt();
    try {
      await event.userChoice;
    } catch {
      // Dismissed, or the browser withdrew it. The event is spent either way.
    }
    (window as any).__installEvent = null;
    dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.middle}>
        <Text style={styles.wordmark}>antisocial</Text>

        <Text style={styles.lead}>Put it on your home screen.</Text>

        <Text style={styles.body}>
          It opens without a browser bar, the way an app does. There is nothing to
          download, and no app store involved.
        </Text>

        {mode === 'ios' && (
          <View style={styles.steps}>
            <View style={styles.step}>
              <Ionicons name="share-outline" size={17} color={colors.muted} />
              <Text style={styles.stepText}>Tap Share, at the bottom of Safari.</Text>
            </View>
            <View style={styles.step}>
              <Ionicons name="add-circle-outline" size={17} color={colors.muted} />
              <Text style={styles.stepText}>Choose Add to Home Screen.</Text>
            </View>
          </View>
        )}

        {mode === 'manual' && (
          <View style={styles.steps}>
            <View style={styles.step}>
              <Ionicons name="ellipsis-vertical" size={17} color={colors.muted} />
              <Text style={styles.stepText}>Open the browser menu.</Text>
            </View>
            <View style={styles.step}>
              <Ionicons name="phone-portrait-outline" size={17} color={colors.muted} />
              <Text style={styles.stepText}>Choose Install app, or Add to Home screen.</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.foot}>
        {mode === 'ready' && (
          <TouchableOpacity style={styles.button} onPress={install} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={16} color={colors.surface} />
            <Text style={styles.buttonText}>Install</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.skip} onPress={dismiss} activeOpacity={0.7}>
          <Text style={styles.skipText}>
            {mode === 'ready' ? 'Not now' : 'Continue in the browser'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  wordmark: {
    fontFamily: fonts.serifRegular,
    fontSize: 20,
    color: colors.muted,
    marginBottom: 12,
  },
  lead: {
    fontFamily: fonts.serifRegular,
    fontSize: 28,
    lineHeight: 40,
    color: colors.ink,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.body,
    maxWidth: 420,
  },
  steps: {
    gap: 12,
    marginTop: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.body,
    flex: 1,
  },
  foot: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
  skip: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    color: colors.muted,
  },
});

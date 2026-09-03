import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, type } from '../../lib/theme';

// The per-module reset helpers are deliberately not used any more. Each wrote
// its own key back to a zero value, which meant the reset only covered the
// modules someone remembered to call. Removing the keys outright reads the
// same — every one of those ledgers treats a missing value as a fresh day.

// A testing door. Every limit in this app lives in the browser's own storage,
// so there is no server-side switch to flip — the only way to hand the day
// back is to clear it from inside the app. Open /reset and the quota, the
// seen ledger and the usage clock all go back to zero.

// This used to be a hand-kept list of keys to clear, and it silently rotted:
// `last_anchor_game` was added for the first-session Brick Breaker anchor and
// never added here, so a reset left the app believing it had already placed an
// anchor and the first game went back to a one-in-three draw. A list of what to
// DELETE fails quietly every time someone adds a key and forgets it.
//
// So it is inverted. Everything in storage goes, except the few things below
// that a reset has no business destroying. A new key is now cleared by default,
// and the only way to get it wrong is to deliberately add it to this list.
const KEEP = [
  // The visitor's own writing. A testing door should not eat someone's words.
  'notebook',
  // Earned, and unrelated to what the feed decides to show.
  'bricks_best_score', 'board_wins', 'hands_best_combined',
  'hands_round_wins', 'timeline_best_streak',
];

// Cleared only by the fuller reset, which is the one that says it makes the
// next launch behave like a first visit.
const FIRST_VISIT_ONLY = ['onboarding_complete', 'install_gate_answered'];

export default function ResetScreen() {
  const router = useRouter();
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);

  const runReset = useCallback(async () => {
    setBusy(true);

    const all = await AsyncStorage.getAllKeys();
    const doomed = all.filter(
      (k) => !KEEP.includes(k) && !FIRST_VISIT_ONLY.includes(k)
    );
    if (doomed.length > 0) await AsyncStorage.multiRemove(doomed);

    setDone([
      'Daily sessions: back to zero',
      'Seen ledger: every card eligible again',
      'Usage clock: back to zero',
      'Week ledger and recap: cleared',
      'Rotations cleared, so the next session anchors on Brick Breaker again',
      `Kept: your notebook, and your game bests (${doomed.length} keys cleared)`,
    ]);
    setBusy(false);
  }, []);

  useEffect(() => {
    runReset();
  }, [runReset]);

  const fullReset = async () => {
    await runReset();
    await AsyncStorage.multiRemove(FIRST_VISIT_ONLY);
    setDone((d) => [
      ...d,
      'Onboarding and the install screen: next launch behaves like a first visit',
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Testing</Text>
        <Text style={styles.title}>{busy ? 'Clearing…' : 'The day is yours again.'}</Text>

        {done.map((line) => (
          <Text key={line} style={styles.item}>
            · {line}
          </Text>
        ))}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          disabled={busy}
        >
          <Text style={styles.primaryButtonText}>Open a fresh feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={fullReset} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Also reset onboarding</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    padding: 24,
  },
  label: {
    ...type.label,
    marginBottom: 8,
  },
  title: {
    ...type.title,
    marginBottom: 16,
  },
  item: {
    ...type.body,
    color: colors.body,
    marginBottom: 6,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...type.micro,
  },
});

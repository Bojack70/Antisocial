import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, type } from '../../lib/theme';
import { resetSessions } from '../../lib/quota';
import { resetSeen } from '../../lib/seen';
import { resetUsage } from '../../lib/usage';
import { resetOnboarding } from '../../lib/onboarding';

// A testing door. Every limit in this app lives in the browser's own storage,
// so there is no server-side switch to flip — the only way to hand the day
// back is to clear it from inside the app. Open /reset and the quota, the
// seen ledger and the usage clock all go back to zero.

// weekLedger, missions and the Moral Compass tally keep no reset helper of
// their own, so they are cleared by key here. Keep these in step with
// lib/weekLedger.ts, lib/missions.ts and lib/moralCompass.ts if those keys
// ever change. `moral_compass_recent` is the rotation ledger written by
// pickRotating, so clearing it makes the whole pool eligible again.
const EXTRA_KEYS = [
  'week_ledger', 'week_recap_shown', 'missions_done',
  'good_turns_done', 'moral_compass_recent',
];

export default function ResetScreen() {
  const router = useRouter();
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);

  const runReset = useCallback(async () => {
    setBusy(true);
    await resetSessions();
    await resetSeen();
    await resetUsage();
    await AsyncStorage.multiRemove(EXTRA_KEYS);
    setDone([
      'Daily sessions — back to zero',
      'Seen ledger — every card eligible again',
      'Usage clock — back to zero',
      'Week ledger and recap — cleared',
      'Moral Compass tally and rotation — cleared',
    ]);
    setBusy(false);
  }, []);

  useEffect(() => {
    runReset();
  }, [runReset]);

  const fullReset = async () => {
    await runReset();
    await resetOnboarding();
    setDone((d) => [...d, 'Onboarding — next launch behaves like a first visit']);
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

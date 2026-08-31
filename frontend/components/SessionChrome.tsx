import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import { colors, fonts } from '../lib/theme';

interface Props {
  sessionNumber: number;
  totalSessions: number;
  minutesToday: number;
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}

// The header, pared down to the wordmark alone. The session line, progress
// track, Reclaimed Time line, dot strip, and chevrons from the swipe mockup
// were all removed 2026-08-31 at the user's request — swipe is the
// navigation, and position in the deck shows only in the StageFooter.
// The props stay so the call site is untouched while the trial settles.

export default function SessionChrome(_props: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.wordmark}>antisocial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  // Sizes and colors measured off the reference — see design-spec.md at the
  // repo root for the pixel measurements each value traces to.
  wordmark: {
    // Regular, not bold — the reference wordmark is a light-stroked serif;
    // Lora_700Bold read as semibold against it.
    fontFamily: fonts.serifRegular,
    fontSize: 33,
    color: colors.ink,
    letterSpacing: -0.2,
  },
});

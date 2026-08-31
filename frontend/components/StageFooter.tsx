import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { colors } from '../lib/theme';

interface Props {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  label: string;
  tone?: 'sage' | 'clay' | 'ink';
  onPress: () => void;
}

// TRIAL — the bottom of the staged screen, pared to the pill action alone.
// The dot strip, count, and chevrons were removed 2026-08-31 at the user's
// request: swipe is the navigation, and nothing on screen shows deck
// position any more. The pager props stay so call sites are untouched
// while the trial settles.
export default function StageFooter({ label, tone = 'sage', onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.cta, TONES[tone].box]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={[styles.ctaText, TONES[tone].text]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const TONES = {
  sage: { box: { backgroundColor: colors.sage }, text: { color: '#FFFFFF' } },
  clay: { box: { backgroundColor: colors.clay }, text: { color: '#FAF8F4' } },
  ink: { box: { backgroundColor: colors.ink }, text: { color: colors.surface } },
} as const;

const styles = StyleSheet.create({
  // The pill's edges line up with the card's — the reference runs it the
  // full card width (card marginHorizontal is 40 in cards.stage).
  wrap: {
    paddingHorizontal: 40,
    paddingTop: 14,
    paddingBottom: 10,
  },
  // A full-width lozenge — the radius is half the height.
  cta: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 19,
    fontWeight: '600',
  },
});

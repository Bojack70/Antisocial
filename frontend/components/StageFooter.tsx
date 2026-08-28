import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
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

// TRIAL — the bottom half of the mockup's screen: a second pager row that
// carries the position count, then the full-width pill action. Only the
// Gentle Reminder card renders this so far.
export default function StageFooter({
  index, count, onPrev, onNext, label, tone = 'sage', onPress,
}: Props) {
  const first = Math.max(0, Math.min(index - 2, Math.max(0, count - 5)));
  const dots = Array.from({ length: Math.min(5, count) }, (_, i) => first + i);

  return (
    <View style={styles.wrap}>
      <View style={styles.pager}>
        <TouchableOpacity onPress={onPrev} disabled={index === 0} hitSlop={HIT}>
          <Ionicons name="chevron-back" size={26}
            color={index === 0 ? colors.hairline : colors.clayDeep} />
        </TouchableOpacity>

        <View style={styles.dots}>
          {dots.map((d) => (
            <View key={d} style={[styles.dot, d === index && styles.dotOn]} />
          ))}
          <Text style={styles.count}>{index + 1}</Text>
        </View>

        <TouchableOpacity onPress={onNext} disabled={index >= count - 1} hitSlop={HIT}>
          <Ionicons name="chevron-forward" size={26}
            color={index >= count - 1 ? colors.hairline : colors.clayDeep} />
        </TouchableOpacity>
      </View>

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

const HIT = { top: 12, bottom: 12, left: 12, right: 12 };

const TONES = {
  sage: { box: { backgroundColor: colors.sage }, text: { color: '#FFFFFF' } },
  clay: { box: { backgroundColor: colors.clay }, text: { color: '#FAF8F4' } },
  ink: { box: { backgroundColor: colors.ink }, text: { color: colors.surface } },
} as const;

const styles = StyleSheet.create({
  // The reference's pill floats with clear parchment either side — wider
  // margins than the feed's edge-to-edge buttons.
  wrap: {
    paddingHorizontal: 42,
    paddingTop: 14,
    paddingBottom: 10,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.hairline,
  },
  dotOn: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.clayDeep,
  },
  count: {
    fontSize: 13,
    color: colors.muted,
    marginLeft: 8,
  },
  // The reference's action is a full-width lozenge, not a rounded
  // rectangle — the radius is half the height.
  cta: {
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 19,
    fontWeight: '500',
  },
});

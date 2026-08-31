import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
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

// The header from the swipe mockup: wordmark, which of the day's two
// sessions this is, how far through the session you are, and the pager.
//
// The session numbers are real — MAX_SESSIONS_PER_DAY is 2 in lib/quota.ts
// and sessionsUsedToday() is what feeds this. The progress bar tracks
// position in the deck rather than time, so it agrees with the dots.

const DOTS_SHOWN = 5;

export default function SessionChrome({
  sessionNumber, totalSessions, minutesToday, index, count, onPrev, onNext,
}: Props) {
  const progress = count > 1 ? index / (count - 1) : 0;

  // With a dozen cards a dot each would be a smear, so the strip is a
  // five-dot window that slides — the filled dot keeps its place in the
  // middle once you are past the start.
  const half = Math.floor(DOTS_SHOWN / 2);
  const first = Math.max(0, Math.min(index - half, Math.max(0, count - DOTS_SHOWN)));
  const dots = Array.from({ length: Math.min(DOTS_SHOWN, count) }, (_, i) => first + i);

  return (
    <View style={styles.wrap}>
      <Text style={styles.wordmark}>antisocial</Text>

      <Text style={styles.session}>
        Session {sessionNumber} of {totalSessions}
      </Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.time}>
        Reclaimed Time: {minutesToday} min
      </Text>

      <View style={styles.pager}>
        <TouchableOpacity
          onPress={onPrev}
          disabled={index === 0}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Previous card"
        >
          <Ionicons
            name="chevron-back"
            size={36}
            color={index === 0 ? colors.hairline : colors.clayDeep}
          />
        </TouchableOpacity>

        <View style={styles.dots}>
          {dots.map((d) => (
            <View
              key={d}
              style={[styles.dot, d === index && styles.dotOn]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={onNext}
          disabled={index >= count - 1}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Next card"
        >
          <Ionicons
            name="chevron-forward"
            size={36}
            color={index >= count - 1 ? colors.hairline : colors.clayDeep}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 22,
    // The reference tucks the wordmark straight under the status area —
    // the safe-area inset is the whole gap, so no padding of our own.
    paddingTop: 0,
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
  session: {
    fontSize: 20,
    color: colors.ink,
    marginTop: 17,
  },
  track: {
    width: '100%',
    height: 13,
    borderRadius: 7,
    backgroundColor: '#DDD3C6',
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#7B8570',
  },
  time: {
    fontSize: 18,
    color: colors.ink,
    marginTop: 7,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
  },
  // Warm tan dots with a deep-clay active one — the reference's pager is
  // copper on tan, not orange on grey.
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.hairline,
  },
  dotOn: {
    backgroundColor: colors.clayDeep,
    width: 11,
    height: 11,
    borderRadius: 6,
  },
});

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
        Reclaimed time · {minutesToday} min
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
            size={26}
            color={index === 0 ? colors.line : colors.clay}
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
            size={26}
            color={index >= count - 1 ? colors.line : colors.clay}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 12,
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  session: {
    fontSize: 15,
    color: colors.body,
    marginTop: 7,
  },
  track: {
    width: '100%',
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.surfaceTinted,
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.sage,
  },
  time: {
    fontSize: 13,
    color: colors.muted,
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
    gap: 7,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotOn: {
    backgroundColor: colors.clay,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

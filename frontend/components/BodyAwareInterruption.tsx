import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Text from './AppText';
import { colors, fonts, type } from '../lib/theme';

/** How long the deck is held on this page before a swipe will move it. */
export const HOLD_MS = 2200;

interface Props {
  text: string;
  /** True only while this page is the settled page of the deck. */
  active: boolean;
  /** Fired once the beat has been held out; the deck unlocks here. */
  onHoldEnd?: () => void;
}

// The one page in the deck that is not a card. Every other type sits on a
// surface with a header and a border; this one takes the whole page in
// sage and puts a single line in the middle of it — the colour is the
// signal that the deck has stopped being content for a moment.
//
// Before this, the interruption rendered as a grey italic line at the top
// of an otherwise empty parchment page, which read as a card that had
// failed to load rather than as a deliberate pause.
//
// And it is the one place in the app that actually TAKES the time back
// instead of asking nicely: the deck is locked for HOLD_MS while the
// hairline fills. Long enough for the sentence to land, short enough that
// it is a beat rather than a wall.
export default function BodyAwareInterruption({ text, active, onHoldEnd }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  // Kept in a ref so a new inline callback from the parent's next render
  // can't restart the animation mid-beat.
  const onEnd = useRef(onHoldEnd);
  onEnd.current = onHoldEnd;

  useEffect(() => {
    // Every page of the deck is mounted at once, so mounting can't be the
    // cue — the beat starts when this page becomes the settled one, and
    // resets if it is left and come back to.
    progress.setValue(0);
    if (!active) return;

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear, // a clock, not a flourish
      useNativeDriver: false, // width can't run on the native driver
    });
    anim.start(({ finished }) => {
      if (finished) onEnd.current?.();
    });
    return () => anim.stop();
  }, [active, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.page}>
      <Text style={styles.label}>Pause</Text>
      <Text style={styles.line}>{text}</Text>

      {/* The hold, made visible. It sits low, where the thumb starts the
          swipe it is currently refusing. */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  label: {
    ...type.label,
    color: colors.sageInk,
    marginBottom: 18,
  },
  // Titles are the one place the serif appears, and on this page the line
  // IS the title — regular rather than bold, since nothing sits under it
  // for the weight to separate it from.
  line: {
    fontFamily: fonts.serifRegular,
    fontSize: 24,
    lineHeight: 33,
    color: colors.ink,
    textAlign: 'center',
    // Held well inside the page rather than run to the padding: at full
    // width these lines break with a single orphaned word on row two
    // ("…your shoulders / are."). ~26 characters a line breaks all ten of
    // them into balanced rows, and does it the same way on a narrow phone
    // as on a wide one.
    maxWidth: 300,
  },
  track: {
    position: 'absolute',
    bottom: 56,
    left: 60,
    right: 60,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.mintLine,
    overflow: 'hidden',
  },
  fill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.sageInk,
  },
});

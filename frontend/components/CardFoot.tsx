import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import { colors, type } from '../lib/theme';

interface CardFootProps {
  children: React.ReactNode;
  /**
   * The card's quiet meta, right-aligned above the control: Field Trip's
   * "TWO MINUTES", Moral Compass's "THIS WEEK", Try This's needs line.
   * Chips cards carry their tags inside ReactionButtons instead, which
   * already right-aligns them on the same edge. One rule either way: the
   * left of the foot is the act, the right is the meta.
   */
  meta?: string;
  /**
   * Draw the hairline above the foot. TRUE only for the reaction chips.
   *
   * The chips are a quiet outlined row that would otherwise blend into the
   * body, so they need separating. A solid ink action or a bordered control
   * already separates itself, and ruling those too gives every doing card a
   * heavy bar under a line at the bottom of the screen — which reads as a
   * "next" control rather than as the card's own act.
   */
  ruled?: boolean;
  style?: ViewStyle;
}

// The bottom of every card. It exists so the rule above lives in one file
// instead of twenty-one, and so "what goes in the foot" stays a single
// decision per card type.
//
// What it holds is always the card's OWN closing element — reaction chips,
// its action, its reveal control, its option list, or (on the one card that
// asks nothing of you) its closing sentence. Never a Next button: the swipe
// is the navigation, and a control that advances without recording anything
// would sit in the same slot as the honor-system buttons that do record,
// which is how those counters get inflated by people just moving on.
export default function CardFoot({ children, ruled = false, meta, style }: CardFootProps) {
  return (
    <View style={[styles.foot, ruled && styles.ruled, style]}>
      {!!meta && <Text style={styles.meta}>{meta}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  foot: {
    // Never shrink: the card's content gives way first, so the foot cannot
    // be squeezed off the bottom of a long card.
    flexShrink: 0,
    marginTop: 24,
  },
  ruled: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 20,
  },
  meta: {
    ...type.micro,
    textAlign: 'right',
    marginBottom: 10,
  },
});

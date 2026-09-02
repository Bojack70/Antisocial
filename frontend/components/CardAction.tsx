import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { colors } from '../lib/theme';

interface Props {
  label: string;
  onPress: () => void;
  done?: boolean;
  /** Shown in place of the button once done. Omit to keep the button. */
  doneLine?: string;
  /**
   * Drop the button's own top margin. Set when the action IS the card's
   * foot (inside CardFoot), which already owns the spacing.
   */
  flush?: boolean;
}

// The one completion button, for the DOING cards only (Gentle Reminder,
// Try This, Notebook, Field Trip). Reading cards close with reaction
// chips instead — an "I read it" button would measure nothing.
//
// The label is dynamic per card type and, where the data carries one, per
// activity ("Flight tested", "Bed made"). Voice rule as everywhere:
// deadpan past tense, no exclamation marks, no cheerleading.
export default function CardAction({ label, onPress, done = false, doneLine, flush = false }: Props) {
  if (done && doneLine) {
    return <Text style={[styles.doneLine, flush && styles.flush]}>{doneLine}</Text>;
  }
  return (
    <TouchableOpacity
      style={[styles.button, flush && styles.flush]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // The primary-action shape from the theme spec: solid ink, rounded-xl,
  // py-3, medium weight — same as the session screen's Leave button.
  button: {
    marginTop: 16,
    backgroundColor: colors.ink,
    // 15, not 13: at the bottom of a full-height card the action is the
    // card's one target, and 13 + a 19px line landed at 45px — under the
    // 44px floor only by luck. 15 puts it at 49.
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  flush: {
    marginTop: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.surface,
  },
  doneLine: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: 16,
  },
});

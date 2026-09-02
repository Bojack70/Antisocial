import { TextStyle } from 'react-native';
import { fonts, colors } from './theme';

// The wall-label step.
//
// A museum sets a short label large and a long one small, and the feed has
// the same problem: measured across all 21 card types, the mean card filled
// 48% of its page and the shortest (Field Trip, Game, Try This) filled 27%.
// Setting every card at one size is what made the short ones read as
// fragments.
//
// So the size comes from how much text the card actually carries. Bucketed
// on the card's TOTAL text, not its title alone — a five-word headline over
// three long facts is a full card, and setting that headline at 31px would
// overflow the page. Buckets, not a continuous ramp, so the deck has three
// sizes rather than twenty and cards of similar weight look alike.
//
// Deliberately automatic: nothing is authored per card, so new content can
// never forget to pick a size.

export type CardScale = {
  title: TextStyle;
  body: TextStyle;
  /** Options, steps and other boxed rows: one step below body, floored. */
  row: TextStyle;
  /** Which bucket was chosen — for tests and debugging, not for styling. */
  bucket: 'large' | 'medium' | 'base';
};

const STEPS = {
  large: { t: 31, tl: 41, b: 18, bl: 29 },
  medium: { t: 27, tl: 36, b: 17, bl: 27 },
  // The base step is the size every card used before this existed, so a
  // long card looks exactly as it did.
  base: { t: 19, tl: 27, b: 14, bl: 23 },
} as const;

/** Total visible characters across everything passed in. */
function count(parts: unknown[]): number {
  let n = 0;
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) n += count(p);
    else if (typeof p === 'string') n += p.length;
  }
  return n;
}

/**
 * The type sizes for a card, given its own text. Pass every string the card
 * renders — title, body, facts, options — and spread the result onto the
 * existing styles:
 *
 *   const scale = cardScale(content.headline, content.facts);
 *   <Text style={[styles.headline, scale.title]}>…</Text>
 */
export function cardScale(...parts: unknown[]): CardScale {
  const chars = count(parts);
  const bucket = chars < 180 ? 'large' : chars < 420 ? 'medium' : 'base';
  const s = STEPS[bucket];
  return {
    bucket,
    title: { fontFamily: fonts.serif, fontSize: s.t, lineHeight: s.tl, color: colors.ink },
    body: { fontSize: s.b, lineHeight: s.bl, color: colors.body },
    row: { fontSize: Math.max(14, s.b - 1), lineHeight: Math.max(21, s.bl - 4), color: colors.body },
  };
}

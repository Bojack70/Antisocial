import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// One type scale and one palette for the whole feed, so a card can't
// quietly invent its own 17.5px or its own grey. Ported from the Drift
// reference build: a neutral zinc palette, nothing heavier than weight
// 500, and card type signalled by surface rather than by colour.

export const colors = {
  page: '#FFFFFF',
  ink: '#18181B', // titles
  body: '#52525B', // body copy on light surfaces
  muted: '#A1A1AA', // labels, microtext, timestamps
  line: '#F4F4F5', // card borders, dividers
  hairline: '#E4E4E7', // pill borders

  surface: '#FFFFFF',
  surfaceTinted: '#FAFAFA',
  surfaceDark: '#18181B',
  // The wellbeing card keeps its own mint surface — it is the one card
  // that interrupts rather than informs, and the colour is the signal.
  surfaceMint: '#E9F6EE',
  mintLine: '#D8EEDF',

  // On the dark surface the roles shift: body copy lightens to what is
  // "muted" on white, and panels sit just above the card.
  darkBody: '#A1A1AA',
  darkPanel: 'rgba(39, 39, 42, 0.5)',
  darkPill: '#27272A',
  darkLine: '#3F3F46',
} as const;

export const type = StyleSheet.create({
  // 10px uppercase with wide tracking — deliberately quiet. The icon
  // beside it is tinted the same grey, never the card's accent.
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
  } as TextStyle,
  title: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    color: colors.ink,
  } as TextStyle,
  titleOnDark: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    color: '#FFFFFF',
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 23,
    color: colors.body,
  } as TextStyle,
  bodyOnDark: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 23,
    color: colors.darkBody,
  } as TextStyle,
  micro: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
  } as TextStyle,
});

const cardBase: ViewStyle = {
  borderRadius: 16,
  padding: 24,
  marginBottom: 16,
};

// Three surfaces. White is the default, tinted is for the quieter card
// types, dark is for the narrative ones — the alternation down the feed
// is what stops twelve cards reading as one wall.
export const cards = StyleSheet.create({
  white: {
    ...cardBase,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tinted: {
    ...cardBase,
    backgroundColor: colors.surfaceTinted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dark: {
    ...cardBase,
    backgroundColor: colors.surfaceDark,
  },
  mint: {
    ...cardBase,
    backgroundColor: colors.surfaceMint,
    borderWidth: 1,
    borderColor: colors.mintLine,
  },
});

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// One type scale and one palette for the whole feed, so a card can't
// quietly invent its own 17.5px or its own grey.
//
// Repainted for the paper build: warm parchment instead of white, clay and
// sage instead of zinc, and a serif for titles. The token NAMES below are
// unchanged from the Drift build on purpose — twenty-four files import
// them, and remapping values rather than names means every card picks up
// the new look without being touched.

export const colors = {
  // The canvas. Never pure white — the whole point of the repaint is that
  // the app reads as paper rather than as a screen.
  page: '#EFECE5',
  ink: '#2D2C2A', // titles
  body: '#6B6A68', // body copy on light surfaces
  muted: '#9A9894', // labels, microtext, timestamps
  line: '#DDD8CC', // card borders, dividers
  hairline: '#CFC9BA', // pill borders

  surface: '#F7F5F0', // the card sits a shade lighter than the page
  surfaceTinted: '#E9E5DB',
  surfaceDark: '#1C1B1A', // charcoal, not black — it still has to feel warm
  // The wellbeing card keeps its own tinted surface — it is the one card
  // that interrupts rather than informs, and the colour is the signal.
  // Sage now, to sit inside the palette instead of beside it.
  surfaceMint: '#E3EADF',
  mintLine: '#CBD8C4',

  // On the dark surface the roles shift: body copy lightens to what is
  // "muted" on paper, and panels sit just above the card.
  darkBody: '#A5A29B',
  darkPanel: 'rgba(45, 44, 42, 0.5)',
  darkPill: '#2A2826',
  darkLine: '#454039',

  // Accents. Clay carries actions and card-type markers, sage carries
  // completion and calm, ochre is for highlights only — it is the loudest
  // of the three and the easiest to overuse.
  clay: '#C27B5E',
  clayDeep: '#A8664C',
  sage: '#8BA087',
  sageDeep: '#6E8269',
  ochre: '#D9AD6A',
} as const;

// Card-type accents. The old build gave each of the sixteen card types its
// own hue, which a three-colour palette cannot do — and does not need to,
// because the surface already tells the types apart (see `cards` below).
// So the accent now carries what KIND of thing the card asks of you, and
// the icon beside it carries which one.
export const accents = {
  curiosity: colors.clay, // facts, explainers, video — things to read
  calm: colors.sage, // the body cards, and anything asking you to move
  play: colors.ochre, // games
  personal: colors.sageDeep, // notebook, guestbook, the weekly recap
  onDark: colors.ochre, // the one accent with enough lift on charcoal
} as const;

// Merriweather for titles, Inter for everything else. Body copy stays in
// Inter deliberately: Merriweather is wide, and at 14px on a phone it costs
// roughly a fifth of the words per line for no gain in a card this short.
export const fonts = {
  serif: 'Merriweather_700Bold',
  serifRegular: 'Merriweather_400Regular',
} as const;

export const type = StyleSheet.create({
  // 10px uppercase with wide tracking — deliberately quiet. CardHeader
  // overrides the colour with the card type's accent so the label and its
  // icon read as one marker; this grey is the fallback for any other use.
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
  } as TextStyle,
  // Titles are the one place the serif appears. AppText reads fontFamily
  // straight through, so setting it here is enough.
  title: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 27,
    color: colors.ink,
  } as TextStyle,
  titleOnDark: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 27,
    color: '#F2EFE8',
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
  borderRadius: 18,
  padding: 24,
  marginBottom: 16,
};

// Three surfaces. Paper is the default, tinted is for the quieter card
// types, dark is for the narrative ones — the alternation down the feed
// is what stops twelve cards reading as one wall.
export const cards = StyleSheet.create({
  white: {
    ...cardBase,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    // Grounding rather than floating: a wide, very soft shadow, so the card
    // reads as resting on the page instead of hovering above it.
    shadowColor: '#2D2C2A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
  // TRIAL — the swipe-mockup treatment, on one card type only.
  // flex:1 is the difference between a card that hugs its text (leaving
  // two-thirds of the page empty) and one that fills its page the way the
  // reference does. Kept as its own variant until we like it.
  stage: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 26,
    paddingTop: 30,
    paddingBottom: 26,
    marginBottom: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#2D2C2A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

// TRIAL — the mockup's centred serif titles: a small label line, then the
// line that matters, both centred. type.title stays left-aligned for every
// card still on the old treatment.
export const stageType = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
    textAlign: 'center',
  } as TextStyle,
  headline: {
    fontFamily: fonts.serifRegular,
    fontSize: 23,
    lineHeight: 32,
    color: colors.ink,
    textAlign: 'center',
  } as TextStyle,
  // Bigger and darker than the feed's body copy. On the staged card this is
  // the only prose on the screen, so it carries the card rather than
  // supporting a headline above it.
  body: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.ink,
    textAlign: 'center',
  } as TextStyle,
});

// The neighbouring cards, showing at the screen edges. They are what makes
// the deck read as a deck rather than as one card at a time — the reference
// shows a sliver of the next card on each side.
export const rails = StyleSheet.create({
  rail: {
    position: 'absolute',
    top: 34,
    bottom: 34,
    width: 13,
    backgroundColor: colors.sage,
  },
  left: { left: 0, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  right: { right: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse, G } from 'react-native-svg';
import { colors } from '../lib/theme';

// Placeholder art for the paper build. These are hand-authored vectors, not
// generated images — which means they weigh a couple of kilobytes, stay
// crisp at any density, and take their colours from lib/theme.ts, so they
// repaint with the palette instead of being baked at export time.
//
// They are stand-ins. When the generated illustration set lands these get
// swapped for <Image> without any card having to change: every card asks
// for art by CARD TYPE, never by filename.

const PAPER = '#E7E1D4';
const PAPER_2 = '#E9E3D6';
const OFFWHITE = '#FAF8F4';
const OFFWHITE_2 = '#F4F0E6';
const EDGE = '#C9BFAC';
const BARK = '#6E5A46';

/** A window onto somewhere further away. Used by the pause cards. */
function Window() {
  return (
    <Svg viewBox="0 0 400 300" width="100%" height="100%">
      <Rect width="400" height="300" fill="#E5E0D5" />
      <Rect x="58" y="24" width="284" height="220" rx="10" fill="#F2EDE2" />
      <Rect x="70" y="36" width="260" height="196" rx="5" fill="#CFDCE4" />
      <Path d="M70 36h260v76c-42-8-82 4-124 12s-90 6-136-10Z" fill="#DCE6EA" />
      <Circle cx="268" cy="80" r="21" fill={colors.ochre} opacity={0.55} />
      <Path d="M70 158c46-24 88-16 128 2 38 17 84 6 132-10v82H70Z" fill="#A9B9A2" />
      <Path d="M70 190c52-18 96-8 140 8 36 13 78 4 120-8v42H70Z" fill={colors.sage} />
      <G fill={colors.sageDeep}>
        <Rect x="112" y="150" width="5" height="42" rx="2.5" />
        <Ellipse cx="114" cy="144" rx="19" ry="16" />
        <Rect x="286" y="158" width="5" height="36" rx="2.5" />
        <Ellipse cx="288" cy="152" rx="15" ry="13" />
      </G>
      <G fill="#F2EDE2">
        <Rect x="195" y="36" width="10" height="196" />
        <Rect x="70" y="128" width="260" height="10" />
      </G>
      <Rect x="58" y="24" width="284" height="220" rx="10" fill="none" stroke={EDGE} strokeWidth="7" />
      <Rect x="40" y="244" width="320" height="15" rx="5" fill={EDGE} />
      <Path d="M242 244h40l-6 34a8 8 0 0 1-8 7h-12a8 8 0 0 1-8-7Z" fill={colors.clay} />
      <G fill={colors.sageDeep}>
        <Path d="M262 244c-4-22-18-32-34-32 4 20 18 30 34 32Z" />
        <Path d="M264 244c2-24 14-38 32-40-2 22-14 36-32 40Z" />
      </G>
      <Path d="M263 244c-1-16 4-30 12-38 2 16-3 29-12 38Z" fill={colors.sage} />
    </Svg>
  );
}

/** A fanned deck. Used by the skill cards. */
function Deck() {
  const fan = [-30, -18, -6, 6, 18];
  return (
    <Svg viewBox="0 0 400 300" width="100%" height="100%">
      <Rect width="400" height="300" fill={PAPER_2} />
      <Ellipse cx="200" cy="238" rx="150" ry="26" fill={colors.ink} opacity={0.07} />
      {fan.map((deg, i) => (
        <G key={deg} transform={`rotate(${deg} 200 236)`}>
          <Rect
            x="164"
            y={i === 0 || i === 4 ? 108 : i === 1 || i === 3 ? 104 : 102}
            width="72"
            height="104"
            rx="9"
            fill={OFFWHITE}
            stroke={EDGE}
            strokeWidth="2"
          />
          <Rect
            x="172"
            y={i === 0 || i === 4 ? 116 : i === 1 || i === 3 ? 112 : 110}
            width="56"
            height="88"
            rx="5"
            fill={colors.clay}
            opacity={0.85}
          />
        </G>
      ))}
      <G transform="rotate(9 214 96)">
        <Rect x="176" y="34" width="78" height="112" rx="10" fill={OFFWHITE} stroke={EDGE} strokeWidth="2" />
        <Path d="M215 66c7-11 24-7 24 6 0 12-16 22-24 30-8-8-24-18-24-30 0-13 17-17 24-6Z" fill={colors.clay} />
      </G>
      <G fill={colors.ochre}>
        <Path d="M296 74c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18Z" />
        <Path d="M120 60c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11Z" opacity={0.75} />
      </G>
    </Svg>
  );
}

/** An open notebook. Used by the writing cards. */
function Notebook() {
  return (
    <Svg viewBox="0 0 400 300" width="100%" height="100%">
      <Rect width="400" height="300" fill="#E5E0D5" />
      <Ellipse cx="200" cy="244" rx="146" ry="22" fill={colors.ink} opacity={0.07} />
      <Path d="M52 92c46-14 92-14 144 8v134c-52-22-98-22-144-8Z" fill={colors.sage} />
      <Path d="M348 92c-46-14-92-14-144 8v134c52-22 98-22 144-8Z" fill="#7C9179" />
      <Path d="M64 100c42-12 82-11 128 8v118c-46-19-86-20-128-8Z" fill={OFFWHITE} />
      <Path d="M336 100c-42-12-82-11-128 8v118c46-19 86-20 128-8Z" fill={OFFWHITE_2} />
      <G stroke={EDGE} strokeWidth="3" strokeLinecap="round" fill="none">
        <Path d="M80 128c34-8 66-6 100 8" />
        <Path d="M80 150c34-8 66-6 100 8" />
        <Path d="M80 172c26-6 50-5 76 5" />
        <Path d="M320 128c-34-8-66-6-100 8" />
        <Path d="M320 150c-34-8-66-6-100 8" />
        <Path d="M320 172c-26-6-50-5-76 5" />
      </G>
      <G stroke={colors.clay} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.9}>
        <Path d="M80 194c22-5 42-4 62 4" />
        <Path d="M320 194c-18-4-34-3-50 3" />
      </G>
      <Rect x="196" y="96" width="8" height="140" rx="4" fill={colors.sageDeep} />
      <G transform="rotate(-24 262 228)">
        <Rect x="196" y="220" width="132" height="15" rx="3" fill={colors.ochre} />
        <Rect x="196" y="220" width="132" height="6" rx="3" fill="#E3BE83" />
        <Path d="M328 220l24 7.5-24 7.5Z" fill="#E8DCC4" />
        <Path d="M345 225.5l7 2-7 2Z" fill="#3E3630" />
        <Rect x="182" y="220" width="16" height="15" fill={colors.clay} />
      </G>
    </Svg>
  );
}

/** A street with a wall worth looking at. Used by the go-outside cards. */
function Street() {
  return (
    <Svg viewBox="0 0 400 300" width="100%" height="100%">
      <Rect width="400" height="300" fill={PAPER} />
      <Rect width="400" height="150" fill="#DCE4E6" />
      <Circle cx="80" cy="52" r="26" fill={colors.ochre} opacity={0.45} />
      <G>
        <Rect x="12" y="82" width="76" height="112" fill="#C4B9A6" />
        <Rect x="96" y="52" width="62" height="142" fill="#B3A791" />
        <Rect x="166" y="96" width="54" height="98" fill="#CDC2AF" />
        <Rect x="286" y="66" width="70" height="128" fill="#B3A791" />
        <Rect x="360" y="104" width="34" height="90" fill="#C4B9A6" />
      </G>
      <G fill="#8FA4AE" opacity={0.85}>
        <Rect x="26" y="98" width="14" height="18" rx="2" />
        <Rect x="50" y="98" width="14" height="18" rx="2" />
        <Rect x="26" y="130" width="14" height="18" rx="2" />
        <Rect x="50" y="130" width="14" height="18" rx="2" />
        <Rect x="110" y="70" width="14" height="18" rx="2" />
        <Rect x="132" y="70" width="14" height="18" rx="2" />
        <Rect x="110" y="102" width="14" height="18" rx="2" />
        <Rect x="132" y="102" width="14" height="18" rx="2" />
        <Rect x="300" y="84" width="16" height="20" rx="2" />
        <Rect x="326" y="84" width="16" height="20" rx="2" />
      </G>
      {/* the mural — the surface a session-end unlock would paint onto */}
      <Path d="M176 176c6-30 20-46 36-48-4 28-16 44-36 48Z" fill={colors.sage} />
      <Circle cx="206" cy="118" r="12" fill={colors.clay} />
      <Rect y="194" width="400" height="106" fill="#CFC5B2" />
      <Rect y="210" width="400" height="90" fill="#BFB4A0" />
      <G stroke={PAPER} strokeWidth="5" strokeLinecap="round" opacity={0.7}>
        <Path d="M40 262h44" />
        <Path d="M132 262h44" />
        <Path d="M224 262h44" />
        <Path d="M316 262h44" />
      </G>
      <G>
        <Rect x="242" y="140" width="8" height="58" rx="4" fill={BARK} />
        <Ellipse cx="246" cy="130" rx="34" ry="30" fill="#7C9179" />
        <Ellipse cx="228" cy="142" rx="20" ry="17" fill={colors.sage} />
      </G>
      <G>
        <Ellipse cx="120" cy="290" rx="34" ry="9" fill={colors.ink} opacity={0.12} />
        <Path d="M120 186c-19 3-30 15-33 44-2 20-2 40 0 56h66c2-16 2-36 0-56-3-29-14-41-33-44Z" fill={colors.clay} />
        <Path d="M92 216c-6 16-8 34-7 50l10 2c-2-18-2-35-3-52Z" fill={colors.clayDeep} />
        <Path d="M148 216c6 16 8 34 7 50l-10 2c2-18 2-35 3-52Z" fill={colors.clayDeep} />
        <Path d="M110 286h9v14h-9Zm12 0h9v14h-9Z" fill="#3E3630" />
        <Rect x="110" y="176" width="20" height="14" fill="#B78F6C" />
        <Ellipse cx="120" cy="158" rx="24" ry="26" fill="#C9A288" />
        <Path d="M120 130c17 0 26 12 26 28 0 12-3 22-8 28 2-14-1-26-6-30-8-6-20-6-26 0-5 4-8 16-6 30-5-6-8-16-8-28 0-16 9-28 28-28Z" fill="#3E3630" />
      </G>
    </Svg>
  );
}

/** Books and a cup. Used by the reading cards. */
function Books() {
  return (
    <Svg viewBox="0 0 400 300" width="100%" height="100%">
      <Rect width="400" height="300" fill={PAPER_2} />
      <Ellipse cx="200" cy="252" rx="152" ry="24" fill={colors.ink} opacity={0.07} />
      <G>
        <Rect x="76" y="222" width="196" height="26" rx="5" fill={colors.sage} />
        <Rect x="84" y="230" width="180" height="10" fill={OFFWHITE_2} />
        <Rect x="88" y="196" width="176" height="26" rx="5" fill={colors.clay} />
        <Rect x="96" y="204" width="160" height="10" fill="#F7F5F0" />
        <Rect x="70" y="170" width="188" height="26" rx="5" fill={colors.ochre} />
        <Rect x="78" y="178" width="172" height="10" fill={OFFWHITE} />
      </G>
      <G>
        <Path d="M118 168c26-10 52-9 76 7v-72c-24-16-50-17-76-7Z" fill={OFFWHITE} stroke={EDGE} strokeWidth="2" />
        <Path d="M270 168c-26-10-52-9-76 7v-72c24-16 50-17 76-7Z" fill={OFFWHITE_2} stroke={EDGE} strokeWidth="2" />
        <G stroke={EDGE} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <Path d="M130 114c20-6 38-5 54 6" />
          <Path d="M130 130c20-6 38-5 54 6" />
          <Path d="M258 114c-20-6-38-5-54 6" />
          <Path d="M258 130c-20-6-38-5-54 6" />
        </G>
        <Rect x="191" y="96" width="6" height="80" rx="3" fill={EDGE} />
      </G>
      <G>
        <Path d="M292 176h58l-6 56a12 12 0 0 1-12 11h-22a12 12 0 0 1-12-11Z" fill="#F7F5F0" stroke={EDGE} strokeWidth="2" />
        <Path d="M296 190h50l-1 12h-48Z" fill="#8B6F5A" />
        <Path d="M350 190c16-2 24 6 22 18-2 11-13 15-25 13" fill="none" stroke={EDGE} strokeWidth="6" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

const ART = { window: Window, deck: Deck, notebook: Notebook, street: Street, books: Books } as const;
export type ArtName = keyof typeof ART;

// Cards ask for art by TYPE, so swapping in the generated set later is a
// change to this one map rather than to every card component.
const BY_CARD_TYPE: Record<string, ArtName> = {
  almost_nothing: 'window',
  try_this: 'deck',
  mission: 'street',
  ponder: 'books',
  quiet_contradiction: 'books',
};

export function artForCardType(cardType: string): ArtName | null {
  return BY_CARD_TYPE[cardType] ?? null;
}

export default function CardArt({ name }: { name: ArtName }) {
  const Art = ART[name];
  return (
    <View style={styles.frame}>
      <Art />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.surfaceTinted,
  },
});

import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import ReactionButtons from './ReactionButtons';
import { cards, colors, type, accents } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

export type IllusionKind =
  | 'muller_lyer'
  | 'ebbinghaus'
  | 'ponzo'
  | 'vertical_horizontal'
  | 'hering'
  | 'cafe_wall';

interface Props {
  content: {
    kind: IllusionKind;
    /** Asked BEFORE anything is claimed — the figure has to be met cold. */
    question: string;
    options: string[];
    answer: string;
    /** One line on the mechanism, after the guess. */
    explain: string;
    /**
     * How much the two shapes REALLY differ, as a fraction. 0 means identical
     * — the classic figure. Non-zero means the card is telling the truth and
     * one of them genuinely is bigger.
     *
     * This exists because a card whose answer is always "they're the same"
     * teaches you to pick that by the third encounter, and then it is not a
     * guess any more. Roughly a quarter of the batch should carry a delta.
     */
    delta?: number;
    tags?: string[];
  };
}

// A guess card that renders its own proof.
//
// Why its own type and not a look_closer variant: a photograph can only
// ASSERT that two shapes match; geometry demonstrates it. The fins leave and
// the lines are plainly equal. The reveal is the interaction.
//
// Why it matters beyond the card: this is the one type whose pool costs
// nothing to fill. look_closer sits at 10 items because every photograph
// needs a licence and a click-verify. These are shapes drawn in code, so
// authoring effort is the only bottleneck.
//
// Note the app already had illusions — four of them, in try_this tagged
// 'illusion' (split thumb, rubber pencil, floating sausage, floating arm).
// Those are all BODY illusions done with your hands. These are screen
// illusions, which is a different mechanic precisely because the screen can
// prove itself.

const FIG = 300; // figure width, comfortably inside the card's 24pt padding

export default function IllusionCard({ content }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [proofShown, setProofShown] = useState(true);
  const answered = selected !== null;
  const correct = selected === content.answer;
  const delta = content.delta ?? 0;

  // 0 = the illusion as first met, 1 = the proof.
  const t = useRef(new Animated.Value(0)).current;

  const animateTo = (to: number) => {
    Animated.timing(t, {
      toValue: to,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // layout offsets animate here, not only opacity
    }).start();
  };

  const guess = (option: string) => {
    if (answered) return;
    setSelected(option);
    recordGuess(); // depth action; fire-and-forget
    animateTo(1); // the proof plays on commitment, not on a second tap
  };

  const toggle = () => {
    const next = !proofShown;
    setProofShown(next);
    animateTo(next ? 1 : 0);
  };

  const figure = { t, delta };

  return (
    <View style={cards.white}>
      <CardHeader icon="contrast-outline" color={accents.curiosity} label="Illusion" />

      {/* The figure leads. No claim above it — being told "these are the same
          length" before you look is the priming that makes the guess hollow. */}
      <View style={styles.stage}>
        {content.kind === 'muller_lyer' && <MullerLyer {...figure} />}
        {content.kind === 'ebbinghaus' && <Ebbinghaus {...figure} />}
        {content.kind === 'ponzo' && <Ponzo {...figure} />}
        {content.kind === 'vertical_horizontal' && <VerticalHorizontal {...figure} />}
        {content.kind === 'hering' && <Hering {...figure} />}
        {content.kind === 'cafe_wall' && <CafeWall {...figure} />}
      </View>

      <Text style={styles.question}>{content.question}</Text>

      <View style={styles.options}>
        {content.options.map((option) => {
          const isSelected = selected === option;
          const isAnswer = answered && option === content.answer;
          const isWrong = answered && isSelected && !correct;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isAnswer && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              onPress={() => guess(option)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, (isSelected || isAnswer) && styles.optionBold]}>
                {option}
              </Text>
              {isAnswer && <Ionicons name="checkmark" size={14} color={colors.ink} />}
              {isWrong && <Ionicons name="close" size={14} color={colors.muted} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <>
          <Text style={styles.explain}>{content.explain}</Text>

          {/* The A/B is the pleasure. One tap to flip it back and forth. */}
          <TouchableOpacity style={styles.toggle} onPress={toggle} activeOpacity={0.7}>
            <Ionicons name="swap-horizontal-outline" size={14} color={colors.body} />
            <Text style={styles.toggleText}>
              {proofShown ? 'Put it back' : 'Show me again'}
            </Text>
          </TouchableOpacity>

          <ReactionButtons
            reactions={['Unexpected', 'Unsettling', 'Makes Sense']}
            tags={content.tags}
          />
        </>
      )}
    </View>
  );
}

interface FigProps {
  t: Animated.Value;
  delta: number;
}

/* ── Müller-Lyer ────────────────────────────────────────────────────────────
   The fins do all the work. The proof fades them and leaves the lines to be
   compared honestly.                                                        */

const ML_LINE = 200;
const FIN = 34;
const FIN_DEG = 38;

function Fin({ x, y, deg }: { x: number; y: number; deg: number }) {
  const rad = (deg * Math.PI) / 180;
  // A fin is a bar rotated about its own centre, so the centre has to be
  // pushed half a fin along the fin's own direction for its END to meet the
  // line's end.
  return (
    <View
      style={{
        position: 'absolute',
        width: FIN,
        height: 2,
        backgroundColor: colors.ink,
        left: x + (FIN / 2) * Math.cos(rad) - FIN / 2,
        top: y + (FIN / 2) * Math.sin(rad) - 1,
        transform: [{ rotate: `${deg}deg` }],
      }}
    />
  );
}

function MullerLyer({ t, delta }: FigProps) {
  const finOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const lens = [ML_LINE, ML_LINE * (1 + delta)];

  const row = (y: number, outward: boolean, len: number) => {
    const x0 = (FIG - len) / 2;
    const x1 = x0 + len;
    return (
      <React.Fragment key={y}>
        <View style={{ position: 'absolute', left: x0, top: y, width: len, height: 2, backgroundColor: colors.ink }} />
        <Animated.View style={{ opacity: finOpacity }}>
          {/* outward = <——> (reads long); inward = >——< (reads short) */}
          <Fin x={x0} y={y + 1} deg={outward ? 180 - FIN_DEG : FIN_DEG} />
          <Fin x={x0} y={y + 1} deg={outward ? 180 + FIN_DEG : -FIN_DEG} />
          <Fin x={x1} y={y + 1} deg={outward ? FIN_DEG : 180 - FIN_DEG} />
          <Fin x={x1} y={y + 1} deg={outward ? -FIN_DEG : 180 + FIN_DEG} />
        </Animated.View>
      </React.Fragment>
    );
  };

  return (
    <View style={{ width: FIG, height: 130 }}>
      {row(38, false, lens[0])}
      {row(96, true, lens[1])}
    </View>
  );
}

/* ── Ebbinghaus ─────────────────────────────────────────────────────────────
   The neighbours set the scale. The proof removes them and slides the two
   centres together to be compared directly.                                 */

const CENTRE = 42;

function Ring({ n, radius, size }: { n: number; radius: number; size: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.hairline,
              left: 75 + radius * Math.cos(a) - size / 2,
              top: 75 + radius * Math.sin(a) - size / 2,
            }}
          />
        );
      })}
    </>
  );
}

function Ebbinghaus({ t, delta }: FigProps) {
  const ringOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  // Pull the groups together as the rings go, so the last beat is the two
  // centres side by side with nothing between them.
  const shift = t.interpolate({ inputRange: [0, 1], outputRange: [0, 26] });
  const negShift = t.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });
  const sizes = [CENTRE, CENTRE * (1 + delta)];

  const group = (n: number, radius: number, size: number, centre: number) => (
    <View style={{ width: 150, height: 150 }}>
      <Animated.View style={{ opacity: ringOpacity }}>
        <Ring n={n} radius={radius} size={size} />
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          width: centre,
          height: centre,
          borderRadius: centre / 2,
          backgroundColor: colors.clay,
          left: 75 - centre / 2,
          top: 75 - centre / 2,
        }}
      />
    </View>
  );

  return (
    <View style={{ width: FIG, height: 150, flexDirection: 'row', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ translateX: shift }] }}>{group(6, 60, 40, sizes[0])}</Animated.View>
      <Animated.View style={{ transform: [{ translateX: negShift }] }}>{group(8, 40, 15, sizes[1])}</Animated.View>
    </View>
  );
}

/* ── Ponzo ──────────────────────────────────────────────────────────────────
   Two bars on converging rails; the upper one reads as further away, so the
   eye inflates it. The proof takes the rails away.                          */

function Ponzo({ t, delta }: FigProps) {
  const railOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const H = 150;
  const BAR = 120;
  const bars = [BAR, BAR * (1 + delta)];
  const rail = (dir: number) => {
    // A long bar rotated to lean in from the bottom corners.
    const deg = dir * 12;
    return (
      <View
        style={{
          position: 'absolute',
          width: 2,
          height: 210,
          backgroundColor: colors.hairline,
          left: FIG / 2 + dir * 78 - 1,
          top: -30,
          transform: [{ rotate: `${deg}deg` }],
        }}
      />
    );
  };
  return (
    <View style={{ width: FIG, height: H, overflow: 'hidden' }}>
      <Animated.View style={{ opacity: railOpacity }}>
        {rail(-1)}
        {rail(1)}
      </Animated.View>
      <View style={{ position: 'absolute', left: (FIG - bars[0]) / 2, top: 40, width: bars[0], height: 6, backgroundColor: colors.clay, borderRadius: 3 }} />
      <View style={{ position: 'absolute', left: (FIG - bars[1]) / 2, top: 104, width: bars[1], height: 6, backgroundColor: colors.clay, borderRadius: 3 }} />
    </View>
  );
}

/* ── Vertical–horizontal ────────────────────────────────────────────────────
   A bisected T. The upright reads longer than the base at equal length; the
   proof rotates the upright down beside it.                                 */

function VerticalHorizontal({ t, delta }: FigProps) {
  const LEN = 120;
  const vLen = LEN * (1 + delta);
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const drop = t.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  return (
    <View style={{ width: FIG, height: 150 }}>
      <View style={{ position: 'absolute', left: (FIG - LEN) / 2, top: 130, width: LEN, height: 3, backgroundColor: colors.ink }} />
      <Animated.View
        style={{
          position: 'absolute',
          left: FIG / 2 - 1.5,
          top: 130 - vLen,
          width: 3,
          height: vLen,
          backgroundColor: colors.clay,
          transform: [{ translateY: drop }, { rotate }],
        }}
      />
    </View>
  );
}

/* ── Hering ─────────────────────────────────────────────────────────────────
   Two straight verticals over a radiating fan appear to bow apart. The proof
   fades the fan; nothing about the verticals changes.                       */

function Hering({ t }: FigProps) {
  const fanOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const H = 170;
  return (
    <View style={{ width: FIG, height: H, overflow: 'hidden' }}>
      <Animated.View style={{ opacity: fanOpacity }}>
        {Array.from({ length: 13 }).map((_, i) => {
          const deg = -78 + i * 13;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 1.5,
                height: 380,
                backgroundColor: colors.hairline,
                left: FIG / 2,
                top: H / 2 - 190,
                transform: [{ rotate: `${deg}deg` }],
              }}
            />
          );
        })}
      </Animated.View>
      <View style={{ position: 'absolute', left: FIG / 2 - 46, top: 8, width: 3, height: H - 16, backgroundColor: colors.clay }} />
      <View style={{ position: 'absolute', left: FIG / 2 + 43, top: 8, width: 3, height: H - 16, backgroundColor: colors.clay }} />
    </View>
  );
}

/* ── Café wall ──────────────────────────────────────────────────────────────
   Every row is level; the half-tile offset tilts the mortar. The proof slides
   the rows back into column.                                                */

const TILE = 26;
const ROWS = 7;
const MORTAR = 3;
const OFFSETS = [0, 13, 0, -13, 0, 13, 0];
// The light tile needs a real colour. A first cut used colors.surface, which
// IS the card background — the light tiles vanished, the rows stopped being
// continuous, and the figure became floating squares with no illusion in it.
const TILE_LIGHT = '#FBF9F4';

function CafeWall({ t }: FigProps) {
  return (
    <View
      style={{
        width: FIG,
        height: ROWS * TILE + (ROWS - 1) * MORTAR,
        overflow: 'hidden',
        borderRadius: 6,
        // The mortar IS the mechanism — grey, mid-way between the tile tones.
        // With black or white mortar the rows stop tilting. The container
        // colour shows through the row gaps to draw it.
        backgroundColor: colors.muted,
      }}
    >
      {Array.from({ length: ROWS }).map((_, r) => {
        const shift = t.interpolate({ inputRange: [0, 1], outputRange: [OFFSETS[r], 0] });
        return (
          <View key={r} style={{ flexDirection: 'row', height: TILE, marginBottom: r === ROWS - 1 ? 0 : MORTAR }}>
            <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: shift }], marginLeft: -TILE }}>
              {Array.from({ length: Math.ceil(FIG / TILE) + 3 }).map((__, c) => (
                <View key={c} style={{ width: TILE, height: TILE, backgroundColor: c % 2 === 0 ? colors.ink : TILE_LIGHT }} />
              ))}
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginBottom: 16,
  },
  question: {
    ...type.title,
    marginBottom: 12,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  optionSelected: { borderColor: colors.ink },
  optionCorrect: { borderColor: colors.ink, backgroundColor: colors.surfaceTinted },
  optionWrong: { borderColor: colors.line, opacity: 0.6 },
  optionText: { ...type.body, color: colors.ink, flex: 1, paddingRight: 8 },
  optionBold: { fontWeight: '600' },
  explain: {
    ...type.body,
    marginTop: 16,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  toggleText: {
    ...type.body,
    color: colors.body,
  },
});

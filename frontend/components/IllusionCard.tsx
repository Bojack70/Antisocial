import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import { cards, colors, type, accents } from '../lib/theme';

export type IllusionKind = 'muller_lyer' | 'ebbinghaus' | 'cafe_wall';

interface Props {
  content: {
    kind: IllusionKind;
    /** The claim you won't believe until the card proves it. */
    claim: string;
    /** One line on the mechanism, shown after the proof. */
    explain: string;
  };
}

// PROTOTYPE — gallery only, not in the feed.
//
// The reason this is its own card type and not a look_closer variant: a
// photograph can only ASSERT that two shapes match. Geometry can prove it.
// Tap and the arrowheads leave, the surrounding circles go, the offset rows
// snap square — and the claim you refused becomes obvious. The reveal is the
// interaction, not a caption under it.
//
// And it is the one card whose pool costs nothing to fill. look_closer is
// stuck at 10 items because every photograph needs a licence and a
// click-verify; these are shapes drawn in code. Authoring effort is the only
// bottleneck, which is the one we control.

const FIG = 300; // figure width, comfortably inside the card's 24pt padding

export default function IllusionCard({ content }: Props) {
  const [revealed, setRevealed] = useState(false);
  // 0 = the illusion, 1 = the proof. Drives every figure below.
  const t = useRef(new Animated.Value(0)).current;

  const prove = () => {
    if (revealed) return;
    setRevealed(true);
    Animated.timing(t, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // layout offsets animate here, not just opacity
    }).start();
  };

  return (
    <View style={cards.white}>
      <CardHeader icon="contrast-outline" color={accents.curiosity} label="Illusion" />

      <Text style={styles.claim}>{content.claim}</Text>

      <View style={styles.stage}>
        {content.kind === 'muller_lyer' && <MullerLyer t={t} />}
        {content.kind === 'ebbinghaus' && <Ebbinghaus t={t} />}
        {content.kind === 'cafe_wall' && <CafeWall t={t} />}
      </View>

      {!revealed ? (
        <TouchableOpacity style={styles.button} onPress={prove} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Prove it</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.explain}>{content.explain}</Text>
      )}
    </View>
  );
}

/* ── Müller-Lyer ────────────────────────────────────────────────────────────
   Two lines of identical length; the fins do all the work. Proving it just
   fades the fins out and leaves the lines to be compared honestly.          */

const ML_LINE = 210;
const FIN = 34;
const FIN_DEG = 38;

function Fin({ x, y, deg }: { x: number; y: number; deg: number }) {
  const rad = (deg * Math.PI) / 180;
  // A fin is a bar rotated about its own centre, so the centre has to be
  // pushed half a fin-length along the fin's own direction to make its END
  // meet the line's end.
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

function MullerLyer({ t }: { t: Animated.Value }) {
  const finOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const x0 = (FIG - ML_LINE) / 2;
  const x1 = x0 + ML_LINE;

  const row = (y: number, outward: boolean) => (
    <>
      <View style={{ position: 'absolute', left: x0, top: y, width: ML_LINE, height: 2, backgroundColor: colors.ink }} />
      <Animated.View style={{ opacity: finOpacity }}>
        {/* outward = <——> (reads long); inward = >——< (reads short) */}
        <Fin x={x0} y={y + 1} deg={outward ? 180 - FIN_DEG : FIN_DEG} />
        <Fin x={x0} y={y + 1} deg={outward ? 180 + FIN_DEG : -FIN_DEG} />
        <Fin x={x1} y={y + 1} deg={outward ? FIN_DEG : 180 - FIN_DEG} />
        <Fin x={x1} y={y + 1} deg={outward ? -FIN_DEG : 180 + FIN_DEG} />
      </Animated.View>
    </>
  );

  return (
    <View style={{ width: FIG, height: 130 }}>
      {row(38, false)}
      {row(96, true)}
    </View>
  );
}

/* ── Ebbinghaus ─────────────────────────────────────────────────────────────
   Identical centres; the neighbours set the scale. The proof removes the
   neighbours and slides the two centres together to be compared directly.  */

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

function Ebbinghaus({ t }: { t: Animated.Value }) {
  const ringOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  // Pull the two groups toward each other as the rings go, so the last beat
  // is the two centres side by side with nothing between them.
  const shift = t.interpolate({ inputRange: [0, 1], outputRange: [0, 26] });
  const negShift = t.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });

  const group = (n: number, radius: number, size: number) => (
    <View style={{ width: 150, height: 150 }}>
      <Animated.View style={{ opacity: ringOpacity }}>
        <Ring n={n} radius={radius} size={size} />
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          width: CENTRE,
          height: CENTRE,
          borderRadius: CENTRE / 2,
          backgroundColor: colors.clay,
          left: 75 - CENTRE / 2,
          top: 75 - CENTRE / 2,
        }}
      />
    </View>
  );

  return (
    <View style={{ width: FIG, height: 150, flexDirection: 'row', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ translateX: shift }] }}>{group(6, 60, 40)}</Animated.View>
      <Animated.View style={{ transform: [{ translateX: negShift }] }}>{group(8, 40, 15)}</Animated.View>
    </View>
  );
}

/* ── Café wall ──────────────────────────────────────────────────────────────
   Every row is level and every mortar line is straight; the half-tile offset
   between rows is what tilts them. The proof slides the rows back into
   column, and the slope simply stops.                                       */

const TILE = 26;
const ROWS = 7;
const MORTAR = 3;
const OFFSETS = [0, 13, 0, -13, 0, 13, 0];
// The light tile has to be a real colour, not the card surface. First cut used
// colors.surface, which IS the card background — so the light tiles vanished,
// the rows stopped being continuous, and the figure became floating squares
// with no illusion in it at all.
const TILE_LIGHT = '#FBF9F4';

function CafeWall({ t }: { t: Animated.Value }) {
  return (
    <View
      style={{
        width: FIG,
        height: ROWS * TILE + (ROWS - 1) * MORTAR,
        overflow: 'hidden',
        borderRadius: 6,
        // The mortar IS the mechanism. Grey, and mid-way between the two tile
        // tones — with black or white mortar the rows stop tilting. The
        // container colour shows through the row gaps to draw it.
        backgroundColor: colors.muted,
      }}
    >
      {Array.from({ length: ROWS }).map((_, r) => {
        const shift = t.interpolate({ inputRange: [0, 1], outputRange: [OFFSETS[r], 0] });
        return (
          <View
            key={r}
            style={{ flexDirection: 'row', height: TILE, marginBottom: r === ROWS - 1 ? 0 : MORTAR }}
          >
            <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: shift }], marginLeft: -TILE }}>
              {Array.from({ length: Math.ceil(FIG / TILE) + 3 }).map((__, c) => (
                <View
                  key={c}
                  style={{
                    width: TILE,
                    height: TILE,
                    backgroundColor: c % 2 === 0 ? colors.ink : TILE_LIGHT,
                  }}
                />
              ))}
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  claim: {
    ...type.title,
    marginBottom: 18,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 6,
  },
  button: {
    marginTop: 10,
    backgroundColor: colors.ink,
    paddingVertical: 13,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.surface,
  },
  explain: {
    ...type.body,
    marginTop: 16,
  },
});

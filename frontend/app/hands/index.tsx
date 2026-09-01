import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, type } from '../../lib/theme';
import { recordGameRound } from '../../lib/weekLedger';
import {
  advanceLane,
  launchVelocity,
  startSpeed,
  maxSpeed,
  SPEED_RAMP,
  LaneBall,
  BALL_R,
  PADDLE_H,
  PADDLE_BOTTOM,
} from '../../lib/leftright';

const DIVIDER_W = 1;

type Phase = 'ready' | 'playing' | 'over';
type Side = 'left' | 'right';
const SIDES: Side[] = ['left', 'right'];

interface SideState {
  ball: LaneBall;
  paddleX: number;
  speed: number;
  alive: boolean;
  score: number;
}

const freshSide = (): SideState => ({
  ball: { x: 0, y: 0, vx: 0, vy: 0 },
  paddleX: 0,
  speed: 0,
  alive: true,
  score: 0,
});

export default function LeftVsRight() {
  const router = useRouter();
  // A round is already a bounded arc — it ends when both hands have dropped
  // their ball — so anchor mode only changes which exit is the primary one.
  const anchorMode = useLocalSearchParams<{ anchor?: string }>().anchor === '1';

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState<Phase>('ready');
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [outs, setOuts] = useState({ left: false, right: false });
  const [best, setBest] = useState(0);

  // Everything the loop and the input handlers touch lives in refs: the
  // loop runs at 60fps, and the PanResponder keeps its first render's
  // closure forever, so neither can read state.
  const sides = useRef<Record<Side, SideState>>({ left: freshSide(), right: freshSide() });
  const sizeRef = useRef({ w: 0, h: 0 });
  const laneWRef = useRef(0);
  const paddleWRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');
  const bestRef = useRef(0);
  const boardPageX = useRef(0);
  const frame = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  // The whole point of this game's input layer: each touch is bound to a
  // paddle by IDENTIFIER on first contact — by which half it lands in —
  // and keeps that binding until release. Never by array index; two thumbs
  // must never fight over one paddle, and lifting one finger must not
  // disturb the other. Keys are prefixed per event system ('p' pointer,
  // 't' web touch, 'n' native touch) so ids can't collide across systems.
  const bindings = useRef(new Map<string, Side>());

  const boardRef = useRef<any>(null);
  const ballAnims = useRef({
    left: new Animated.ValueXY({ x: 0, y: 0 }),
    right: new Animated.ValueXY({ x: 0, y: 0 }),
  }).current;
  const paddleAnims = useRef({ left: new Animated.Value(0), right: new Animated.Value(0) }).current;

  const laneW = laneWRef.current;
  const paddleW = paddleWRef.current;
  const paddleY = size.h - PADDLE_BOTTOM;
  const laneLeft = (side: Side) => (side === 'left' ? 0 : laneWRef.current + DIVIDER_W);

  useEffect(() => {
    AsyncStorage.getItem('hands_best_combined').then((v) => {
      if (v) {
        const parsed = parseInt(v, 10) || 0;
        bestRef.current = parsed;
        setBest(parsed);
      }
    });
  }, []);

  // Park both balls on their paddles and wait for a tap.
  const resetBalls = useCallback(() => {
    const { h } = sizeRef.current;
    for (const side of SIDES) {
      const s = sides.current[side];
      s.ball = { x: s.paddleX, y: h - PADDLE_BOTTOM - BALL_R - 2, vx: 0, vy: 0 };
      ballAnims[side].setValue({
        x: laneLeft(side) + s.ball.x - BALL_R,
        y: s.ball.y - BALL_R,
      });
    }
    phaseRef.current = 'ready';
    setPhase('ready');
  }, [ballAnims]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width < 40 || height < 40) return;
    if (Math.abs(width - size.w) < 1 && Math.abs(height - size.h) < 1) return;

    sizeRef.current = { w: width, h: height };
    const lw = (width - DIVIDER_W) / 2;
    laneWRef.current = lw;
    paddleWRef.current = Math.max(52, Math.min(96, lw * 0.42));
    setSize({ w: width, h: height });
    for (const side of SIDES) {
      const s = sides.current[side];
      s.paddleX = lw / 2;
      s.speed = startSpeed(height);
      paddleAnims[side].setValue(laneLeft(side) + lw / 2 - paddleWRef.current / 2);
    }
    boardRef.current?.measureInWindow?.((x: number) => {
      boardPageX.current = x;
    });
    resetBalls();
  };

  const launch = () => {
    if (phaseRef.current !== 'ready' || sizeRef.current.w === 0) return;
    // Both balls drop together. Turn-based was explicitly rejected — the
    // game is both thumbs working at once or it is nothing.
    for (const side of SIDES) {
      const s = sides.current[side];
      const v = launchVelocity(s.speed);
      s.ball.vx = v.vx;
      s.ball.vy = v.vy;
    }
    phaseRef.current = 'playing';
    setPhase('playing');
  };

  const movePaddle = (side: Side, x: number) => {
    const lw = laneWRef.current;
    if (lw === 0) return;
    const half = paddleWRef.current / 2;
    const clamped = Math.max(half, Math.min(lw - half, x));
    const s = sides.current[side];
    s.paddleX = clamped;
    paddleAnims[side].setValue(laneLeft(side) + clamped - half);
    // Before launch each ball rides along with its paddle.
    if (phaseRef.current === 'ready') {
      s.ball.x = clamped;
      ballAnims[side].setValue({ x: laneLeft(side) + clamped - BALL_R, y: s.ball.y - BALL_R });
    }
  };

  // Bind by which half the touch FIRST landed in; hold until release. A
  // thumb that drifts across the centreline keeps its own paddle.
  const bindAndMove = (key: string, boardX: number) => {
    let side = bindings.current.get(key);
    if (!side) {
      side = boardX < sizeRef.current.w / 2 ? 'left' : 'right';
      bindings.current.set(key, side);
    }
    movePaddle(side, boardX - laneLeft(side));
  };

  const handleNativeTouches = (e: any) => {
    for (const t of e.nativeEvent.touches) {
      bindAndMove(`n${t.identifier}`, t.pageX - boardPageX.current);
    }
  };
  const releaseNativeTouches = (e: any) => {
    for (const t of e.nativeEvent.changedTouches) {
      bindings.current.delete(`n${t.identifier}`);
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        handleNativeTouches(e);
        launch();
      },
      onPanResponderMove: handleNativeTouches,
      onPanResponderRelease: releaseNativeTouches,
      onPanResponderTerminate: releaseNativeTouches,
    })
  ).current;

  // On web the responder system doesn't grant for the board, so pointer
  // input is wired to the DOM node directly (same finding as Brick
  // Breaker). PanResponder still drives native.
  useEffect(() => {
    if (Platform.OS !== 'web' || size.w === 0) return;
    const node = boardRef.current as HTMLElement | null;
    if (!node || !node.addEventListener) return;

    // Without this the browser reads a finger drag as a scroll gesture,
    // fires pointercancel, and the move stream dies after first contact.
    const prevTouchAction = node.style.touchAction;
    node.style.touchAction = 'none';

    const localX = (clientX: number) => clientX - node.getBoundingClientRect().left;
    const onDown = (e: any) => {
      try {
        node.setPointerCapture?.(e.pointerId);
      } catch {}
      bindAndMove(`p${e.pointerId}`, localX(e.clientX));
      launch();
    };
    const onMove = (e: any) => {
      const key = `p${e.pointerId}`;
      if (bindings.current.has(key)) {
        // Bound finger (or held mouse): its own paddle, wherever it drifts.
        const side = bindings.current.get(key)!;
        movePaddle(side, localX(e.clientX) - laneLeft(side));
      } else if (e.pointerType === 'mouse') {
        // Passive mouse steering for desktop: whichever half it hovers.
        const x = localX(e.clientX);
        const side: Side = x < sizeRef.current.w / 2 ? 'left' : 'right';
        movePaddle(side, x - laneLeft(side));
      }
    };
    const onUp = (e: any) => {
      bindings.current.delete(`p${e.pointerId}`);
      try {
        node.releasePointerCapture?.(e.pointerId);
      } catch {}
    };
    // Safari fallback where pointer capture is flaky: same identifier
    // binding, walked over EVERY active touch — never touches[0] alone.
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        bindAndMove(`t${t.identifier}`, localX(t.clientX));
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        bindings.current.delete(`t${e.changedTouches[i].identifier}`);
      }
    };

    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerup', onUp);
    node.addEventListener('pointercancel', onUp);
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd);
    node.addEventListener('touchcancel', onTouchEnd);
    return () => {
      node.style.touchAction = prevTouchAction;
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerup', onUp);
      node.removeEventListener('pointercancel', onUp);
      node.removeEventListener('touchmove', onTouchMove as any);
      node.removeEventListener('touchend', onTouchEnd as any);
      node.removeEventListener('touchcancel', onTouchEnd as any);
    };
  }, [size]);

  // One requestAnimationFrame loop for the life of the screen, reading refs
  // each frame — never torn down by layout, both lanes advanced in the same
  // frame so neither hand's paddle lags the other.
  useEffect(() => {
    const step = (ts: number) => {
      frame.current = requestAnimationFrame(step);
      const prev = lastTs.current;
      lastTs.current = ts;
      if (prev === null) return;
      if (phaseRef.current !== 'playing') return;

      const { h } = sizeRef.current;
      const lw = laneWRef.current;
      if (lw === 0 || h === 0) return;

      // Clamped so a backgrounded tab doesn't teleport a ball on return.
      const dt = Math.min(32, ts - prev);
      let scored = false;
      let dropped: Side | null = null;

      for (const side of SIDES) {
        const s = sides.current[side];
        if (!s.alive) continue;

        const { bounced, lost } = advanceLane(
          s.ball,
          { w: lw, h, paddleX: s.paddleX, paddleW: paddleWRef.current, speed: s.speed },
          dt
        );

        if (bounced) {
          s.score += 1;
          s.speed = Math.min(s.speed * SPEED_RAMP, maxSpeed(h));
          scored = true;
        }

        if (lost) {
          s.alive = false;
          dropped = side;
        } else {
          ballAnims[side].setValue({
            x: laneLeft(side) + s.ball.x - BALL_R,
            y: s.ball.y - BALL_R,
          });
        }
      }

      if (scored) {
        setScores({ left: sides.current.left.score, right: sides.current.right.score });
      }

      if (dropped) {
        setOuts({ left: !sides.current.left.alive, right: !sides.current.right.alive });
        if (!sides.current.left.alive && !sides.current.right.alive) {
          phaseRef.current = 'over';
          setPhase('over');
          recordGameRound(); // depth action: a round played to its natural end
          const combined = sides.current.left.score + sides.current.right.score;
          if (combined > bestRef.current) {
            bestRef.current = combined;
            setBest(combined);
            AsyncStorage.setItem('hands_best_combined', String(combined));
          }
        }
      }
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      lastTs.current = null;
    };
  }, [ballAnims]);

  const restart = () => {
    const { h } = sizeRef.current;
    for (const side of SIDES) {
      const s = sides.current[side];
      s.alive = true;
      s.score = 0;
      s.speed = startSpeed(h);
    }
    bindings.current.clear();
    setScores({ left: 0, right: 0 });
    setOuts({ left: false, right: false });
    resetBalls();
  };

  const verdict = () => {
    const { left, right } = scores;
    if (left > right) return 'The left hand takes it.';
    if (right > left) return 'The right hand takes it.';
    return 'A draw.';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.body} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Left vs Right</Text>
          <Text style={styles.headerSubtitle}>One ball each</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>Best {best}</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        <View
          ref={boardRef}
          style={styles.board}
          onLayout={onLayout}
          {...(Platform.OS === 'web' ? {} : pan.panHandlers)}
        >
          <View style={[styles.divider, { left: laneW }]} />

          {SIDES.map((side) => (
            <View
              key={side}
              style={[styles.laneScoreBlock, { left: laneLeft(side), width: laneW }]}
              pointerEvents="none"
            >
              <Text style={styles.laneLabel}>{side}</Text>
              <Text style={styles.laneScore}>{scores[side]}</Text>
            </View>
          ))}

          {SIDES.map((side) =>
            outs[side] ? null : (
              <Animated.View
                key={`ball-${side}`}
                style={[
                  styles.ball,
                  {
                    transform: [
                      { translateX: ballAnims[side].x },
                      { translateY: ballAnims[side].y },
                    ],
                  },
                ]}
              />
            )
          )}

          {SIDES.map((side) => (
            <Animated.View
              key={`paddle-${side}`}
              style={[
                styles.paddle,
                { top: paddleY, width: paddleW, transform: [{ translateX: paddleAnims[side] }] },
              ]}
            />
          ))}

          {SIDES.map((side) =>
            outs[side] && phase !== 'over' ? (
              <View
                key={`out-${side}`}
                style={[styles.outOverlay, { left: laneLeft(side), width: laneW }]}
                pointerEvents="none"
              >
                <Text style={styles.outText}>Out.</Text>
              </View>
            ) : null
          )}

          {phase === 'ready' && (
            <View style={styles.hintOverlay} pointerEvents="none">
              <Text style={styles.hintText}>A thumb on each side · tap to drop both balls</Text>
            </View>
          )}
        </View>

        {phase === 'over' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{verdict()}</Text>
            <Text style={styles.panelStats}>
              Left {scores.left} · Right {scores.right}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={anchorMode ? () => router.back() : restart}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {anchorMode ? 'Back to the museum' : 'Run it back'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={anchorMode ? restart : () => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.ghostButtonText}>
                {anchorMode ? 'Run it back' : 'Back to the game room'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surfaceTinted,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.45,
  },
  headerSubtitle: {
    ...type.micro,
    marginTop: 5,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    minWidth: 46,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
  },
  playArea: {
    flex: 1,
    padding: 16,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  board: {
    flex: 1,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DIVIDER_W,
    backgroundColor: colors.line,
  },
  laneScoreBlock: {
    position: 'absolute',
    top: 14,
    alignItems: 'center',
  },
  laneLabel: {
    ...type.micro,
  },
  laneScore: {
    fontSize: 44,
    fontWeight: '300',
    color: colors.line,
    marginTop: 2,
  },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: colors.ink,
  },
  paddle: {
    position: 'absolute',
    height: PADDLE_H,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
  outOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.page + '99',
  },
  outText: {
    ...type.micro,
  },
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    ...type.micro,
  },
  panel: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
  },
  panelTitle: {
    ...type.title,
    textAlign: 'center',
  },
  panelStats: {
    ...type.micro,
    textAlign: 'center',
    marginTop: 8,
  },
  primaryButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  ghostButton: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  ghostButtonText: {
    color: colors.body,
    fontSize: 11,
    fontWeight: '400',
  },
});

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
import { TIMELINE_EVENTS, formatYear } from '../../data/timelineEvents';
import { colors, type } from '../../lib/theme';
import { recordGameRound } from '../../lib/weekLedger';
import {
  advance,
  launchVelocity,
  Brick,
  BALL_R,
  BRICK_H,
  PADDLE_H,
  PADDLE_BOTTOM,
} from '../../lib/breakout';

const COLS = 6;
const ROWS = 5;
const GAP = 6;
const TOP_OFFSET = 10;
const START_LIVES = 3;

// Top rows are darker and worth more — the shading is the score hint.
const ROW_COLORS = ['#18181B', '#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8'];

type Phase = 'ready' | 'playing' | 'cleared' | 'over';

export default function BrickBreaker() {
  const router = useRouter();
  // Anchor mode (spec item 2): arrived from the session's anchor card.
  // The arc is ONE life — a bounded run with a natural end — and the end
  // panel treats leaving as the primary action. The Game Room's own door
  // keeps the full three lives.
  const anchorMode = useLocalSearchParams<{ anchor?: string }>().anchor === '1';
  const startLives = anchorMode ? 1 : START_LIVES;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(startLives);
  const [level, setLevel] = useState(1);
  const [fact, setFact] = useState<string | null>(null);

  // Everything the loop touches lives in refs: at 60fps, React state would
  // re-render the whole board every frame. Only events (a brick dying, a
  // life lost) go through setState.
  const ball = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const paddleX = useRef(0);
  // PanResponder is created once and keeps that render's closure forever,
  // so anything its handlers touch has to be a ref, not state.
  const sizeRef = useRef({ w: 0, h: 0 });
  const paddleWRef = useRef(0);
  const livesRef = useRef(startLives);
  const bricksRef = useRef<Brick[]>([]);
  const phaseRef = useRef<Phase>('ready');
  const speedRef = useRef(0);
  const frame = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  const boardRef = useRef<any>(null);
  const ballAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const paddleAnim = useRef(new Animated.Value(0)).current;

  const paddleW = Math.max(56, Math.min(110, size.w * 0.26));
  const paddleY = size.h - PADDLE_BOTTOM;

  useEffect(() => {
    AsyncStorage.getItem('bricks_best_score').then((v) => {
      if (v) setBest(parseInt(v, 10) || 0);
    });
  }, []);

  const buildBricks = useCallback((w: number) => {
    const brickW = (w - (COLS + 1) * GAP) / COLS;
    const next: Brick[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        next.push({
          x: GAP + col * (brickW + GAP),
          y: TOP_OFFSET + row * (BRICK_H + GAP),
          w: brickW,
          row,
          alive: true,
        });
      }
    }
    return next;
  }, []);

  // Park the ball on the paddle and wait for a tap.
  const resetBall = useCallback(
    (w: number, h: number) => {
      ball.current = { x: paddleX.current, y: h - PADDLE_BOTTOM - BALL_R - 2, vx: 0, vy: 0 };
      ballAnim.setValue({ x: ball.current.x - BALL_R, y: ball.current.y - BALL_R });
      phaseRef.current = 'ready';
      setPhase('ready');
    },
    [ballAnim]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width < 40 || height < 40) return;
    if (Math.abs(width - size.w) < 1 && Math.abs(height - size.h) < 1) return;

    sizeRef.current = { w: width, h: height };
    paddleWRef.current = Math.max(56, Math.min(110, width * 0.26));
    setSize({ w: width, h: height });
    const built = buildBricks(width);
    bricksRef.current = built;
    setBricks(built);
    paddleX.current = width / 2;
    paddleAnim.setValue(width / 2 - paddleWRef.current / 2);
    speedRef.current = Math.max(0.26, height * 0.001);
    resetBall(width, height);
  };

  const launch = () => {
    if (phaseRef.current !== 'ready' || sizeRef.current.w === 0) return;
    const v = launchVelocity(speedRef.current);
    ball.current.vx = v.vx;
    ball.current.vy = v.vy;
    phaseRef.current = 'playing';
    setPhase('playing');
  };

  const movePaddle = (x: number) => {
    const { w } = sizeRef.current;
    if (w === 0) return;
    const half = paddleWRef.current / 2;
    const clamped = Math.max(half, Math.min(w - half, x));
    paddleX.current = clamped;
    paddleAnim.setValue(clamped - half);
    // Before launch the ball rides along with the paddle.
    if (phaseRef.current === 'ready') {
      ball.current.x = clamped;
      ballAnim.setValue({ x: clamped - BALL_R, y: ball.current.y - BALL_R });
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        movePaddle(e.nativeEvent.locationX);
        launch();
      },
      onPanResponderMove: (e) => movePaddle(e.nativeEvent.locationX),
    })
  ).current;

  // On web the responder system doesn't grant for the board (the events
  // land on a brick, and the negotiation never reaches us), so pointer
  // input is wired to the DOM node directly. PanResponder still drives
  // native. Moving on pointermove also gives desktop mouse steering.
  useEffect(() => {
    if (Platform.OS !== 'web' || size.w === 0) return;
    const node = boardRef.current as HTMLElement | null;
    if (!node || !node.addEventListener) return;

    // Without this the browser reads a finger drag as a scroll gesture,
    // fires pointercancel, and the move stream dies after the first touch —
    // which is why the paddle only jumped on tap and never followed a slide.
    const prevTouchAction = node.style.touchAction;
    node.style.touchAction = 'none';

    const localX = (clientX: number) => clientX - node.getBoundingClientRect().left;
    const onDown = (e: any) => {
      // Capture keeps the moves coming even if the finger slides off the
      // board (or over a brick, which is its own element).
      try {
        node.setPointerCapture?.(e.pointerId);
      } catch {}
      movePaddle(localX(e.clientX));
      launch();
    };
    const onMove = (e: any) => {
      // Mouse steering is passive; a finger only steers while it's down.
      if (e.pointerType !== 'mouse' && e.buttons === 0 && !node.hasPointerCapture?.(e.pointerId)) {
        return;
      }
      movePaddle(localX(e.clientX));
    };
    const onUp = (e: any) => {
      try {
        node.releasePointerCapture?.(e.pointerId);
      } catch {}
    };
    // Safari on iOS still emits touch events for the same gesture; keeping
    // this as a fallback covers browsers where pointer capture is flaky.
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      e.preventDefault();
      movePaddle(localX(e.touches[0].clientX));
    };

    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerup', onUp);
    node.addEventListener('pointercancel', onUp);
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      node.style.touchAction = prevTouchAction;
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerup', onUp);
      node.removeEventListener('pointercancel', onUp);
      node.removeEventListener('touchmove', onTouchMove as any);
    };
  }, [size]);

  // The game loop runs once for the life of the screen and reads the board
  // out of refs each frame. Tying it to layout state meant every re-layout
  // tore it down and reset the frame clock, so the physics never advanced.
  useEffect(() => {
    const step = (ts: number) => {
      frame.current = requestAnimationFrame(step);
      const prev = lastTs.current;
      lastTs.current = ts;
      if (prev === null) return;
      if (phaseRef.current !== 'playing') return;

      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;

      // Clamped so a backgrounded tab doesn't teleport the ball through
      // the paddle on the next frame.
      const dt = Math.min(32, ts - prev);
      const b = ball.current;
      const { hit, lost } = advance(
        b,
        bricksRef.current,
        {
          w,
          h,
          paddleX: paddleX.current,
          paddleW: paddleWRef.current,
          speed: speedRef.current,
        },
        dt
      );

      if (hit) {
        setBricks([...bricksRef.current]);
        setScore((sc) => sc + (ROWS - hit.row) * 10);
        if (bricksRef.current.every((x) => !x.alive)) {
          phaseRef.current = 'cleared';
          const event = TIMELINE_EVENTS[Math.floor(Math.random() * TIMELINE_EVENTS.length)];
          setFact(`${event.name} — ${formatYear(event.year)}. ${event.detail}`);
          setPhase('cleared');
        }
      }

      if (lost) {
        const left = Math.max(0, livesRef.current - 1);
        livesRef.current = left;
        setLives(left);
        if (left === 0) {
          phaseRef.current = 'over';
          setPhase('over');
          recordGameRound(); // depth action: a run played to its natural end
        } else {
          resetBall(w, h);
        }
        return;
      }

      ballAnim.setValue({ x: b.x - BALL_R, y: b.y - BALL_R });
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      lastTs.current = null;
    };
  }, [ballAnim, resetBall]);

  // Persist the best score whenever a run ends.
  useEffect(() => {
    if (phase !== 'over') return;
    if (score > best) {
      setBest(score);
      AsyncStorage.setItem('bricks_best_score', String(score));
    }
  }, [phase, score, best]);

  const nextLevel = () => {
    const built = buildBricks(size.w);
    bricksRef.current = built;
    setBricks(built);
    setLevel((l) => l + 1);
    setFact(null);
    speedRef.current = Math.min(speedRef.current * 1.08, size.h * 0.0019);
    resetBall(size.w, size.h);
  };

  const restart = () => {
    const built = buildBricks(size.w);
    bricksRef.current = built;
    setBricks(built);
    setScore(0);
    livesRef.current = startLives;
    setLives(startLives);
    setLevel(1);
    setFact(null);
    speedRef.current = Math.max(0.26, size.h * 0.001);
    resetBall(size.w, size.h);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.body} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Brick Breaker</Text>
          <Text style={styles.headerSubtitle}>Level {level}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {'●'.repeat(lives)}
            <Text style={styles.livesSpent}>{'●'.repeat(startLives - lives)}</Text>
          </Text>
          <Text style={styles.statusText}>Best {best}</Text>
        </View>

        <View
          ref={boardRef}
          style={styles.board}
          onLayout={onLayout}
          {...(Platform.OS === 'web' ? {} : pan.panHandlers)}
        >
          {bricks.map((brick, i) =>
            brick.alive ? (
              <View
                key={i}
                style={[
                  styles.brick,
                  {
                    left: brick.x,
                    top: brick.y,
                    width: brick.w,
                    backgroundColor: ROW_COLORS[brick.row],
                  },
                ]}
              />
            ) : null
          )}

          <Animated.View
            style={[
              styles.ball,
              { transform: [{ translateX: ballAnim.x }, { translateY: ballAnim.y }] },
            ]}
          />

          <Animated.View
            style={[
              styles.paddle,
              { top: paddleY, width: paddleW, transform: [{ translateX: paddleAnim }] },
            ]}
          />

          {phase === 'ready' && (
            <View style={styles.hintOverlay} pointerEvents="none">
              <Text style={styles.hintText}>Tap to launch · drag to steer</Text>
            </View>
          )}
        </View>

        {phase === 'cleared' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Level {level} cleared.</Text>
            {fact && <Text style={styles.panelFact}>{fact}</Text>}
            <TouchableOpacity style={styles.primaryButton} onPress={nextLevel} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Next level</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'over' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>
              {score >= best && score > 0 ? 'A new best.' : 'Out of balls.'}
            </Text>
            <Text style={styles.panelStats}>
              Score {score} · Best {Math.max(best, score)}
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    ...type.micro,
  },
  livesSpent: {
    color: colors.line,
  },
  board: {
    flex: 1,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  brick: {
    position: 'absolute',
    height: BRICK_H,
    borderRadius: 4,
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
  panelFact: {
    ...type.body,
    textAlign: 'center',
    marginTop: 10,
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

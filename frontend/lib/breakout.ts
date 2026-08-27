// The Brick Breaker physics, kept free of React so it can be stepped and
// asserted on without a browser. The screen owns state and rendering; this
// owns where the ball goes.

export const BALL_R = 6;
export const BRICK_H = 16;
export const PADDLE_H = 10;
export const PADDLE_BOTTOM = 26;
const MAX_BOUNCE = (60 * Math.PI) / 180; // steepest angle off the paddle
const MIN_BOUNCE = 0.12; // never leave the paddle travelling straight up

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Brick {
  x: number;
  y: number;
  w: number;
  row: number;
  alive: boolean;
}

export interface Board {
  w: number;
  h: number;
  paddleX: number;
  paddleW: number;
  speed: number;
}

export interface StepResult {
  /** The brick destroyed this frame, if any. */
  hit: Brick | null;
  /** The ball fell past the paddle. */
  lost: boolean;
}

/** Ball and brick.alive are mutated in place — this runs every frame. */
export function advance(ball: Ball, bricks: Brick[], board: Board, dt: number): StepResult {
  const { w, h, paddleX, paddleW, speed } = board;
  const half = paddleW / 2;
  const py = h - PADDLE_BOTTOM;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x < BALL_R) {
    ball.x = BALL_R;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x > w - BALL_R) {
    ball.x = w - BALL_R;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y < BALL_R) {
    ball.y = BALL_R;
    ball.vy = Math.abs(ball.vy);
  }

  // Where you hit the paddle sets the angle, so the player steers.
  if (
    ball.vy > 0 &&
    ball.y + BALL_R >= py &&
    ball.y - BALL_R <= py + PADDLE_H &&
    Math.abs(ball.x - paddleX) <= half + BALL_R
  ) {
    const offset = Math.max(-1, Math.min(1, (ball.x - paddleX) / half));
    // A dead-centre hit would send the ball perfectly vertical, where it
    // can bounce forever in one cleared column. Keep a minimum angle.
    const steered = Math.abs(offset) < MIN_BOUNCE ? (offset < 0 ? -MIN_BOUNCE : MIN_BOUNCE) : offset;
    const angle = steered * MAX_BOUNCE;
    ball.vx = speed * Math.sin(angle);
    ball.vy = -speed * Math.cos(angle);
    ball.y = py - BALL_R;
  }

  let hit: Brick | null = null;
  for (const brick of bricks) {
    if (!brick.alive) continue;
    if (
      ball.x + BALL_R < brick.x ||
      ball.x - BALL_R > brick.x + brick.w ||
      ball.y + BALL_R < brick.y ||
      ball.y - BALL_R > brick.y + BRICK_H
    ) {
      continue;
    }
    brick.alive = false;
    hit = brick;
    // Resolve on whichever axis is least overlapped.
    const overlapX = Math.min(ball.x + BALL_R - brick.x, brick.x + brick.w - (ball.x - BALL_R));
    const overlapY = Math.min(ball.y + BALL_R - brick.y, brick.y + BRICK_H - (ball.y - BALL_R));
    if (overlapX < overlapY) ball.vx = -ball.vx;
    else ball.vy = -ball.vy;
    break;
  }

  return { hit, lost: ball.y - BALL_R > h };
}

/** Straight up, give or take 25°. */
export function launchVelocity(speed: number, rand = Math.random()): { vx: number; vy: number } {
  const angle = (rand * 50 - 25) * (Math.PI / 180);
  return { vx: speed * Math.sin(angle), vy: -speed * Math.cos(angle) };
}

// Left vs Right physics — one lane per hand, two lanes live at once. Kept
// free of React, like breakout.ts, so a round can be stepped and tuned in
// Node without a browser. The screen owns state and rendering; this owns
// where each ball goes inside its own lane.

import { BALL_R, PADDLE_H, PADDLE_BOTTOM } from './breakout';

export { BALL_R, PADDLE_H, PADDLE_BOTTOM };

const MAX_BOUNCE = (60 * Math.PI) / 180; // steepest angle off the paddle
const MIN_BOUNCE = 0.12; // never leave the paddle travelling straight up

// Every paddle bounce scores a point and quickens the lane, so the round
// ramps itself: leisurely for the first few catches, hectic near the cap.
export const SPEED_RAMP = 1.045;
export const startSpeed = (h: number) => Math.max(0.24, h * 0.0009);
export const maxSpeed = (h: number) => h * 0.0019;

export interface LaneBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface LaneBoard {
  /** Width of this lane alone, not the whole screen. */
  w: number;
  h: number;
  paddleX: number;
  paddleW: number;
  speed: number;
}

export interface LaneResult {
  /** The paddle caught the ball this frame — worth a point. */
  bounced: boolean;
  /** The ball fell past the paddle; this hand is out. */
  lost: boolean;
}

/** Ball is mutated in place — this runs every frame, once per living lane. */
export function advanceLane(ball: LaneBall, lane: LaneBoard, dt: number): LaneResult {
  const { w, h, paddleX, paddleW, speed } = lane;
  const half = paddleW / 2;
  const py = h - PADDLE_BOTTOM;
  let bounced = false;

  // At the ramped cap a 32ms frame moves the ball further than the paddle's
  // collision band is tall, so long frames are cut into substeps rather
  // than letting the ball tunnel straight through a waiting paddle.
  let remaining = dt;
  while (remaining > 0) {
    const step = Math.min(16, remaining);
    remaining -= step;

    ball.x += ball.vx * step;
    ball.y += ball.vy * step;

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

    // Where you catch it sets the angle, so each thumb steers its own ball.
    if (
      ball.vy > 0 &&
      ball.y + BALL_R >= py &&
      ball.y - BALL_R <= py + PADDLE_H &&
      Math.abs(ball.x - paddleX) <= half + BALL_R
    ) {
      const offset = Math.max(-1, Math.min(1, (ball.x - paddleX) / half));
      // A dead-centre catch would send the ball perfectly vertical forever.
      const steered =
        Math.abs(offset) < MIN_BOUNCE ? (offset < 0 ? -MIN_BOUNCE : MIN_BOUNCE) : offset;
      const angle = steered * MAX_BOUNCE;
      ball.vx = speed * Math.sin(angle);
      ball.vy = -speed * Math.cos(angle);
      ball.y = py - BALL_R;
      bounced = true;
    }

    if (ball.y - BALL_R > h) break;
  }

  return { bounced, lost: ball.y - BALL_R > h };
}

/** Straight up, give or take 25°. */
export function launchVelocity(speed: number, rand = Math.random()): { vx: number; vy: number } {
  const angle = (rand * 50 - 25) * (Math.PI / 180);
  return { vx: speed * Math.sin(angle), vy: -speed * Math.cos(angle) };
}

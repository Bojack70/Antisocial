# Game spec: Left vs Right

**Status:** specced 2026-09-01, not built. Build this.

A new game for the Antisocial Game Room: **left hand against right hand**, real-time, both
thumbs working at the same time.

---

## The design

The screen splits down the middle. A paddle sits at the bottom of each half — the left thumb
owns the left half, the right thumb the right. **One ball falls in each half, both live at
once.** Each half scores independently.

When a side drops its ball, that hand is out; the other plays on alone until it drops too.
The game ends with a verdict:

```
┌────────────┬────────────┐
│            │            │
│     ●      │            │
│            │      ●     │
│            │            │
│            │            │
│   ▄▄▄▄▄    │   ▄▄▄▄▄    │
└────────────┴────────────┘
     ▲              ▲
  left thumb   right thumb

     LEFT 14     RIGHT 23
```

Your non-dominant hand really is worse, and the scoreline just says so. That is the whole
joke and it does not need help.

**Non-negotiable: it must be genuinely parallel.** Turn-based play — one hand waiting while
the other goes — was explicitly rejected by the user as not fun. Both thumbs work
continuously, like Brick Breaker, not like the board game.

Layout was chosen for ergonomics over two alternatives. Pong with a paddle at the top of the
screen makes one thumb stretch the whole game; pong with paddles on the left and right edges
gives both thumbs a cramped vertical travel. Paddles at the bottom put both thumbs where they
already rest.

---

## The thing that will break first — read before writing any input code

**The existing game's input layer is structurally single-touch.** In
`frontend/app/bricks/index.tsx` (~line 206):

```js
const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 0) return;
  e.preventDefault();
  movePaddle(localX(e.touches[0].clientX));   // ← reads touches[0], ignores every other finger
};
```

and the pointer path calls a `movePaddle(x)` that has no idea which pointer invoked it — so
two thumbs would fight over one paddle. This is not a tweak to Brick Breaker. Input has to be
re-bound:

- Track each touch by `Touch.identifier`, and each pointer by `pointerId`. **Never by array
  index.**
- Bind a touch to a paddle on **first contact**, by which half of the width it lands in, and
  hold that binding until release.
- Both paddles must update within the same frame.
- Lifting one finger must not disturb the other.

## Three landmines already documented in that same file — don't rediscover them

1. **Set `touch-action: none` on the board node.** Without it the browser reads a finger drag
   as a scroll, fires `pointercancel`, and the move stream dies after first contact. This is
   why the Brick Breaker paddle originally jumped on tap but never followed a slide.
2. **PanResponder is created once and keeps that render's closure forever.** Anything it reads
   must come from refs, not state.
3. **Don't tie the game loop to layout state.** Every re-layout tore the loop down and reset
   the frame clock, so the physics never advanced. One `requestAnimationFrame` loop for the
   life of the screen, reading refs each frame.

---

## Where it plugs in

- Screen at `frontend/app/<route>/index.tsx`. `bricks/index.tsx` is the closest reference for
  physics, the loop and the paddle feel — read it first.
- Register in `frontend/data/games.ts` as a `GameDefinition`: `id`, `route`, `label`, `icon`,
  `color`, `title`, `description`, `cta`, plus `arcDescription` / `arcCta` (the feed-card
  framing — must name a **bounded arc with a natural end**, per the session-depth spec) and
  `statKey` / `statLabel` for a personal best in AsyncStorage.
- Registering there adds it to the Game Room hub **and** the feed anchor rotation at once.
- The feed carries one game per session as its playable anchor, rotating; the anchor is
  persisted so the rotation survives restarts.

## Voice

Deadpan museum-keeper. Irony by understatement only — if a line sounds like it knows it's
funny, cut it. No exclamation marks, no emoji, no cheerleading. Departure is treated as
success everywhere else in the app; the game should end cleanly and not ask for another go.

## Verification caveat

**Multitouch and animation cannot be verified in this project's headless browser harness.**
The person building this has to test on a real device. If the paddles stutter, or one thumb
steals the other's paddle, the cause is the identifier-binding above.

---

## Context if you want it

- `BACKLOG.md` → Parked, and `docs/app-inventory.md` for what the app currently is.
- Existing games: Timeline, Shortcuts & Rabbit Holes (turn-based — the thing this is not),
  Brick Breaker.

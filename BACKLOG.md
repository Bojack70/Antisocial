# Antisocial — Backlog

## Session Depth Spec (2026-08-28) — get sessions from ~2 min to 5–10 min

**Status: SPEC ONLY — nothing below is built yet.** Merged from two independent brainstorms
(Opus 5 + Fable 5) on the same question; user-confirmed target: **5–10 min per session,
2 sessions/day** (quota model unchanged).

### Diagnosis (agreed by both models)
A session serves 9–12 cards; most inventory is read-and-swipe text worth 10–20s each →
10 × ~12s ≈ 2 min. Nothing is broken. The only honest lever is **dwell per card**, never
card count — more cards is the doomscroll dial. Target math: ~40–60s average dwell.
A realistic mixed session already gets there with assets we own: one completed game round
(~3 min) + one audio actually played (~90s) + three guess→reveal cards (~30s each) +
five fast reads (~15s each) ≈ 7 min. The high-dwell assets exist; they're treated as
garnish, not anchors.

### Verdict on "show all card types per session" (the original idea)
Half right — keep the kernel, drop the literal form:
- Full type coverage makes every session structurally identical (boring by day 3).
- It **burns the scarce pools**: almost_nothing (16) and quiet_contradiction (16) forced
  into every session cuts the ~8 repeat-free days toward 5–6. The seen-ledger doesn't
  manufacture content.
- Type presence ≠ dwell; an audio card can be swiped past in 2s.

Reshaped rule: **every session guarantees 2–3 high-dwell ANCHORS** — one playable
(game), one listenable/watchable (audio or video), one interactive-guess (quiz-style) —
not full type coverage.

### Prioritized build order

1. **Guess-before-reveal across the text inventory** — biggest dwell gain per unit of
   effort; pure presentation change, no new content. Generalize the existing Fact-or-Myth
   guess→reveal pattern: fast_weird → "guess the number" (slider, then reveal); incident →
   "what happened next?" (two options, then the real story, can chain 2–3 taps of
   progressive reveal); explainer → opens with the question, not the answer. Prediction
   triples dwell AND is the retell test made mechanical — committing to a guess is what
   makes the fact stick.
2. **Games as bounded session anchors** — promote the playable game card from garnish to
   anchor with a defined arc and a natural END (museum-consistent): "3 rounds of
   Timeline", "one life of Brick Breaker", a par score. Rotate which of the three games
   anchors each session. A completed round is 2–4 min on its own.
3. **Guestbook closing card** — before the Field Trip card: "Which of today's cards would
   you actually retell? Tap it." Optional one-line note. Extends the session honestly,
   deepens recall, feeds Week in Review, and produces **per-card retell-test telemetry**
   (the content quality bar turned into data). Variant to test later: a 3-question exit
   quiz about this session's cards (changes how people read the whole session).
4. **Slate composition: 2–3 guaranteed anchors** (backend + `app/index.tsx` wiring) —
   composer rule per the reshaped verdict above, plus an intentional session arc: open
   weird (hook) → interactive → long read → game mid-slate → audio near the end → Field
   Trip stays the LAST card. Vary rhythm session-to-session; don't make it a fixed
   template.
5. **Audio: measure first, then the listening room** — check whether anyone presses play
   on audio_drift at all. If plays are ~zero, bump this up the list: full-screen
   "listening room" presentation (ambient visual, visible duration "90 seconds", one-tap
   play) — the museum bench, not an attachment.
6. **Multi-card topic "exhibits"** — serialize the best explainers into 3–4 card chains
   (setup → complication → payoff), one exhibit per session. Highest content cost; do
   once 1–4 prove out. Cliffhangers stay INSIDE a session — cross-session cliffhangers
   are a dark pattern for this brand.
7. **Staged reveal on ponder / almost_nothing** — tap/hold to unfold the second line;
   5–10s per card, compounds across the session. Small, do opportunistically.

### Parked (raised, deliberately not scheduled)
- **Paged feed** (one card at a time, tap/swipe to advance, no scroll) — the deepest
  structural fix for skimming, but touches the core feed UI; revisit if 1–4 underdeliver.
- **Ponder cards accept a typed one-line answer**, shown back in Week in Review ("you
  wrote this on Tuesday") — good idea, needs the guestbook input pattern to exist first.

### Hard NO list (both models, brand-load-bearing)
- No more cards per session, no third session — volume is the enemy's axis.
- No autoplay-next on video (296 videos = a doomscroll trap in waiting; one video, hard stop).
- No streaks, variable rewards, or re-engagement notifications — "DAU-down can be
  success" dies the day one ships.
- No artificial friction (fake loading, forced dwell timers) — dwell must come from
  content earning attention, not UI withholding it.

### Measurement (part of the feature, not an afterthought)
- Don't worship the minutes number. Instrument **depth actions**: anchor completed
  (game round finished / audio played / guess made), guestbook taps, and came-back-tomorrow.
  A 4-min session with two guesses and a played round beats 9 min of numb swiping.
- Session minutes already exist (`daily_usage` + `week_ledger` cards/sessions) — record a
  before/after baseline when shipping items 1–4.

### Implementation cautions (from memory, verify against code before editing)
- `frontend/app/index.tsx` session lifecycle is the delicate file: quota consumes only
  when cards actually load (`didInit`/`fetchInFlight` guards), seen-ledger marks ONLY the
  9–12 shown cards (never the slate), Field Trip must stay the last card, onboarding gate
  stays ahead of `fetchFeed()`.
- Slate composition changes live in `backend/server.py` (`sample_unseen` /
  `sample_videos`); pools top up with seen items when dry — keep that behavior.
- All copy in the deadpan museum-keeper voice: irony by understatement only, no
  exclamation marks, departure treated as success.

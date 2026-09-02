# Antisocial — Backlog

## Session Depth Spec (2026-08-28) — get sessions from ~2 min to 5–10 min

**Status: item 1 SHIPPED 2026-08-28** (commits 9105c3a, f5a4734, 5d585d8, 53f59b8 —
incident progressive reveal, fast_weird guess-before-reveal + 19 authored guesses,
guesses counter in the week ledger; verified headless 15/15). **Items 1, 2, 3, 4 and 7
shipped 2026-08-28; only 5b and 6 remain — see the working order below.** (This line
previously read "Items 2–7 not built", contradicting the working-order paragraph in the
same file; corrected 2026-09-01 after a code audit.)
Prod backfill DONE 2026-08-28 (user-reviewed; applied via a temporary admin route since
prod MONGO_URL is a Vercel sensitive env var — verified 19/48 via the public API, route
removed in 6a7fc46). Note: card ids are NOT stable across local/Atlas — the backfill is
keyed by headline for exactly this reason.
Deviation from spec: number guesses use tap ranges, not a slider (no slider dep; RN-web
slider input is a known trap). Merged from two independent brainstorms (Opus 5 + Fable 5)
on the same question; user-confirmed target: **5–10 min per session, 2 sessions/day**
(quota model unchanged). Raw unedited answers from both models:
`docs/session-depth-raw-brainstorms-2026-08-28.md`.

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
  manufacture content. (**Measured 2026-09-01:** first repeat was day 9 median; after the
  adaptive-ratio and anchor-depth fixes it is **day 14**. The argument stands — forcing
  full type coverage would spend that gain immediately.)
- Type presence ≠ dwell; an audio card can be swiped past in 2s.

Reshaped rule: **every session guarantees 2–3 high-dwell ANCHORS** — one playable
(game), one listenable/watchable (audio or video), one interactive-guess (quiz-style) —
not full type coverage.

### Prioritized build order

**Working order (user-approved 2026-08-28):** item 5's *measurement half* was pulled
forward and shipped with item 1 (audioPlays + gameRounds + retells counters in the week
ledger) so data accumulates before the item-5b decision. Items 1, 2, 3, 4 and 7 all
shipped 2026-08-28. **Remaining: 5b listening room (gated on audioPlays staying ~zero
over the coming weeks) → 6 exhibits (gated on 1-4 proving out against the ~2-min
session baseline).** Nothing left to build until the data speaks.

1. ✅ **Guess-before-reveal across the text inventory** — biggest dwell gain per unit of
   effort; pure presentation change, no new content. Generalize the existing Fact-or-Myth
   guess→reveal pattern: fast_weird → "guess the number" (slider, then reveal); incident →
   "what happened next?" (two options, then the real story, can chain 2–3 taps of
   progressive reveal); explainer → opens with the question, not the answer. Prediction
   triples dwell AND is the retell test made mechanical — committing to a guess is what
   makes the fact stick.
2. ✅ **Games as bounded session anchors** (2026-08-28) — promote the playable game card from garnish to
   anchor with a defined arc and a natural END (museum-consistent): "3 rounds of
   Timeline", "one life of Brick Breaker", a par score. Rotate which of the three games
   anchors each session. A completed round is 2–4 min on its own.
3. ✅ **Guestbook closing card** (2026-08-28) — before the Field Trip card: "Which of today's cards would
   you actually retell? Tap it." Optional one-line note. Extends the session honestly,
   deepens recall, feeds Week in Review, and produces **per-card retell-test telemetry**
   (the content quality bar turned into data). Variant to test later: a 3-question exit
   quiz about this session's cards (changes how people read the whole session).
4. ✅ **Slate composition: 2–3 guaranteed anchors** (2026-08-28, backend `compose_session`) —
   composer rule per the reshaped verdict above, plus an intentional session arc: open
   weird (hook) → interactive → long read → game mid-slate → audio near the end → Field
   Trip stays the LAST card. Vary rhythm session-to-session; don't make it a fixed
   template.
5. **Audio: measure first, then the listening room** — check whether anyone presses play
   on audio_drift at all. If plays are ~zero, bump this up the list: full-screen
   "listening room" presentation (ambient visual, visible duration "90 seconds", one-tap
   play) — the museum bench, not an attachment.
6. **Multi-card topic "exhibits"** — serialize the best explainers into 3–4 card chains
   (build as horizontal tap-to-advance flashcards, not vertical scroll — vertical walls
   of text fire doomscroll muscle memory; includes the curated "one page from the
   archive" public-domain reading variant)
   (setup → complication → payoff), one exhibit per session. Highest content cost; do
   once 1–4 prove out. Cliffhangers stay INSIDE a session — cross-session cliffhangers
   are a dark pattern for this brand.
7. ✅ **Staged reveal on ponder / almost_nothing** (2026-08-28, shipped with item 3) — tap to unfold the second line;
   5–10s per card, compounds across the session. Small, do opportunistically.

### Wave 2 — new card types (scoped AND SHIPPED 2026-08-28, all three live in prod)

Origin: user ideas for the 2-3 minute session problem, synthesized with an external
agent's input. Note: building 2 and 3 before the measurement window closes makes the
before/after baseline comparison fuzzier — accepted knowingly; per-card depth actions
still measure cleanly.

1. **The writing card (Notebook)** — one specific, slightly provocative prompt per
   session, mid-slate; 2-3 typed lines; silently skippable, untimed, local-only.
   Prompts: ~24 hand-authored in `data/writingPrompts.ts` (missions pattern), rotation
   via AsyncStorage recency exclusion. Store: `lib/notebook.ts` mirroring guestbook
   (28-day entries, sessionKey replace-not-duplicate). Ledger: `writes` counter.
   Week in Review quotes the latest entry back ("you wrote this on Tuesday").
   This is the spec's parked "typed ponder answers" item, un-parked: its stated
   blocker (an input pattern) shipped with the guestbook. Brain-dump = one prompt
   variant, no timer.
2. **"Try This" micro-skill card** — a real 2-3 minute skill (coin vanish, number
   trick, Möbius cut) taught step-per-tap via staged reveal; "I did it" ->
   `skillsDone` counter; ends with a deadpan close, never a comeback hook. Content:
   15-20 hand-authored, verifiably-doable skills needing only common objects, in a
   new backend `try_this_content` collection (slate ratio ~2, on the no-AI list).
3. **"Look closer" photo-guess card** — one striking public-domain photograph,
   "What is this?" with three options before any caption, then the reveal + 1-2 fact
   lines + credit. Content: 12-15 curated PD/CC0 images (NASA / LoC / Wikimedia PD),
   every URL and license click-verified; hotlinked with attribution and a graceful
   image-failure fallback rather than bundled. Backend `look_closer_content`
   (ratio 1-2). **Shipped as 10 images, all NASA — not the 12-15 across three sources
   scoped here. That gap is now the app's binding content constraint; see "Widen the
   look_closer image wells" under Parked.**
   Reuses the guess interaction and the existing `guesses` counter, and
   joins `compose_session`'s interactive-guess anchor class.

Prod DB sync for 2-3: DONE 2026-08-28 via the temp admin-route pattern (added
ab983db, removed 204d70b) — prod verified serving 16 try_this + 10 look_closer.
Commits: notebook b8e71d9, try_this 9decec8, look_closer ff6bc26.

**Rejected from the external agent's input, on the record:** unskippable/slow-forced
media and mandatory timers (hard-NO: forced dwell), the growing "visual mural"
(collection streak in disguise), community vote reveals (antisocial by design; also a
variable reward), and leave-and-come-back physical quests (Field Trips already exist
and treat departure as success — no return loop). Their good ideas kept: specific
provocative writing prompts; horizontal tap-pagination noted below for item 6's
exhibits; authored post-choice counterpoints as a possible ponder variant.

### Wave 3 — Moral Compass (user request, SHIPPED 2026-09-02, frontend-only)

One outward act per session: something done for somebody else, where nothing comes
back and nobody in the app finds out. Bundled-data card in the games/missions/guess
pattern — no Mongo collection, no backend change, no AI key.

- **Pool**: 21 entries in `frontend/data/moralCompass.ts`, scaled `now` 5 / `today` 8
  / `week` 8, recency-rotated 12 deep via `pickRotating` (`moral_compass_recent`).
- **Placement**: mid-slate, index 3–5, NOT the exit ramp. The Field Trip owns the
  end of the session; two "go and do something" cards back to back read as one and
  get swiped past together. One-line change in `app/index.tsx` if that proves wrong.
- **Surface**: `cards.tinted` + `navigate-outline` + `accents.calm`, so it is
  distinct from Field Trip (mint/compass) and Try This (white/hand) while all three
  keep the "this card asks something of you" accent.
- **Ledger**: `goodTurns` in `lib/weekLedger.ts` (kept SEPARATE from `missions` — a
  field trip is for you and a good turn isn't), lifetime tally `good_turns_done` in
  `lib/moralCompass.ts`. No streak, deliberately and permanently: a good-turn streak
  turns decency into a score to protect.
- **Recap**: a conditional prose line, not a fifth stat tile. A big number beside
  "good turns" is a scoreboard for being a decent person.

**The tension this card had to clear, on the record.** `backend/server.py:245` bans
moralising in every generation prompt, and `docs/user-evidence.md` §6.2 has users
naming unsolicited moral content as the reason they left a competitor. So the rule in
`data/moralCompass.ts` is: **the card names the act and stops.** No stated reason you
should do it, nothing political or religious, nothing cause-specific, no act that can
be performed for the app. The user's own seed example "be kind to one person today"
was deliberately NOT shipped as written — a slogan can be satisfied by feeling a way
about it; the specific version ("let the one in more of a hurry go first") can't.
The header label "Moral Compass" is the user's word and is the one part still worth a
second look — every other label in the app is a plain noun (Field Trip, Try This,
Look Closer), and this one announces virtue before the card has earned it.

### Wave 4 — the card stretch (SHIPPED 2026-09-02, all 21 card types)

The problem, measured before anything was built: the deck slot is 826px and the mean
card filled **48%** of it. The spread was the story — Audio Drift 90%, How Does This
Work 87%, but Field Trip 27%, Game 27%, Try This 29%. A short-card problem, not a
layout problem.

Three changes, no new content and no backend work:

1. **`cards.fill`** (`lib/theme.ts`) — the card fills its page and pins its closing
   element to the bottom, so every card now ends at the same place. Top edge
   untouched: centring was tried in the paper redesign and rejected because the
   header jumps between swipes. `ShareableCard` needs `fill` or it silently blocks
   the stretch (it is content-sized by default) — `renderContentCard(item, true)`.
2. **`lib/typeScale.ts`** — the wall-label step. Under 180 characters of card text
   sets at 31/41 serif, under 420 at 27/36, longer keeps the old 19/27. Bucketed on
   the card's TOTAL text, not its title, so a short headline over three long facts
   isn't mistaken for a short card. Automatic; nothing is authored per card.
3. **`components/CardFoot.tsx`** — one place for the foot. What it holds is always
   the card's OWN closing element: chips + tags (6 reading cards, the only foot with
   a hairline), its action or reveal control (7 doing cards), its option list (6
   guess cards + Guestbook), or its closing sentence (Week in Review).

**Rejected on the record: a Next button in the empty feet.** It would reverse the
2026-08-31 decision that swipe is the only navigation, it is the most doomscroll-
shaped control there is on an app whose posture is DAU-down, and — the concrete
one — Gentle Reminder's Done already advances the deck via `useDeckAdvance`, so a
Next button in the same slot on other cards teaches "bottom button = move on" and
inflates the honor-system counters (`reminders`, `missions`, `goodTurns`,
`skillsDone`) that the Week in Review reports. The guess cards already owned a foot:
their options. Pinning those put the only tappable thing in the thumb's reach and
turned the gap above it into thinking room.

**Images absorb the slack** (`cards.artFill`, a 240–400px band) rather than leaving
it as a gap — the mechanism the retired stage treatment had already settled on.
`aspectRatio` had to come off those frames: a ratio and a flex height both try to
size the box and the ratio wins, so the frame stops growing.

Also: Quiet Contradiction's two statements are now the REGULAR serif, not bold (user
call) — it is the only card whose "title" is two halves of a held contradiction
rather than a headline, and bold made each half assert itself.

Verified headless at 414×896 before commit: all 21 types in `/cards` and a real feed
session render top 96 / bottom 856, nothing clips, no page errors. Audio Drift is the
one card that outgrows its page and scrolls, which is the intended fallback.

### Parked (raised, deliberately not scheduled)

- **"Before You Watch" — a guess card built from the video pool** (parked 2026-09-01 at
  user request; **prototype already built and viewable**).
  - *Where to see it:* `/cards` gallery, pages 17–19. `frontend/components/BeforeYouWatchCard.tsx`,
    sample data in `frontend/app/cards/index.tsx` (`BEFORE_YOU_WATCH_SAMPLES`). Gallery
    only — nothing touches the feed, no backend, no new collection. Commit `4e5b603`.
  - *The premise:* `look_closer` is the thinnest pool (10 items, every one NASA space
    imagery) and `video` is the deepest (296, ~54% of the corpus at ~13% of the slate).
    One frame from inside a clip + three real video titles + reveal + "Watch it · 4:40"
    turns the surplus into the scarce thing with zero new content sourcing or licensing.
  - *The rule that makes or breaks it:* the picture MUST be a storyboard frame
    (`i.ytimg.com/vi/<id>/hq2.jpg`), never `thumbnail_url`. YouTube thumbnails are
    clickbait with the title painted across the artwork — "Do Photons Cast Shadows?" is
    literally written on its own thumbnail. That is the same trap
    `populate_look_closer.py` rule 2 already refuses. Frames are raw and undesigned.
  - *Known ceiling:* frame quality splits by format. Long-form 16:9 (TED-Ed,
    minutephysics, sciBRIGHT) gives clean intriguing stills; vertical shorts letterboxed
    into 16:9 (Physics Girl — **94 of 296** — and Kurzgesagt shorts) give blurred
    pillarbox bars, talking heads and burned-in subtitles. Duration is a usable proxy
    (~shorts ≤90s vs long-form 160–300s) but every frame still needs eyeballing, as the
    NASA batch did. Realistic yield **~60–150 cards, not 296** — still 6–15× the current
    `look_closer` pool.
  - *Open design questions, deliberately not decided:* (a) new card type, or just
    `look_closer` items carrying a `video_url` — the latter needs no new type, ratio or
    anchor class; (b) does the watch button belong on this card, or is it a doorway to
    the existing `video` card; (c) decoy difficulty — same-channel decoys are harder and
    more interesting than random ones.

- **Widen the `look_closer` image wells** (raised 2026-09-01). The type is thin *and*
  monotone — all 10 items are NASA. Licence pass done that day, verified by opening the
  actual terms pages: **Smithsonian Open Access** = CC0 with explicit commercial use,
  5.1M items, but only items *marked* CC0 (the rest are non-commercial only) and the CC0
  mark covers copyright only, not third-party trademark/publicity rights; **The Met** =
  CC0 on the *dataset/metadata*, images need a per-item CC0 check; **Wellcome
  Collection** = CC BY 4.0 site default, attribution required (the card already has a
  `credit` field), per-item licences vary. **Not checked, do not assume:** Rijksmuseum,
  CDC PHIL, NOAA Photo Library, USGS, Library of Congress. Smithsonian is the obvious
  first well — 21 museums and a zoo means specimens, instruments, machinery, the range
  space photography can't give — and its CC0 flag is queryable via API, so the populate
  script can filter programmatically rather than by eye.

- **Paged feed** (one card at a time, tap/swipe to advance, no scroll) — the deepest
  structural fix for skimming, but touches the core feed UI; revisit if 1–4 underdeliver.
- ~~Ponder cards accept a typed one-line answer~~ — un-parked into Wave 2 item 1
  (the guestbook input pattern it was waiting on shipped 2026-08-28).

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
  **Updated 2026-09-01:** top-ups now go through `sample_stalest`, which prefers the
  cards seen longest ago *ranked within the collection* — ranking across the whole
  ledger reads as equivalent and is not (measured: mean position 117/249, a coin flip,
  vs 76 when ranked per-collection). Repeats are flagged centrally in `build_feed`
  against the seen set, and the client marks them "Seen before". Draw rates are no
  longer the fixed `FEED_RATIOS`: `adaptive_ratios` bends them by remaining depth
  (clamped 0.5–1.75×, stochastic rounding — plain `round()` quantises the correction
  away exactly at the thin types it exists to protect). Both anchors pick by depth
  weight, not first-match. Don't revert any of this to "simplify"; it is what moved
  first-repeat from day 9 to day 14 (measured A/B against the live DB).
- All copy in the deadpan museum-keeper voice: irony by understatement only, no
  exclamation marks, departure treated as success.

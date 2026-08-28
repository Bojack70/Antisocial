# Session-depth brainstorms — raw answers (2026-08-28)

Appendix to `BACKLOG.md` → "Session Depth Spec (2026-08-28)". Both models answered the
same question independently (Fable ran as a subagent with the same app context). The
merged, deduplicated spec in BACKLOG.md is the operative document; these are the
unedited originals kept for comparison.

**The question (verbatim):** "So whern i tested the app, i finsihed all the cards under
2 mins i think which is too less of time spending on the app, now i know teh goal of hte
app is to stop doomscrolling and use it less but if its jsut for 2 mins barely any user
will use the app , so we have to make it bit engaging maybe , have users spend atleast
spent 5 min- 10 min on avg in one session, i think in a day if we allow two sessions of
5 -10 mins each thne it should be good. So we need to brainstorm on this . onde idea i
had was that in one session we should show all card types , that will incraes the time
spent on the app on atleast session but what apart from it ?"

---

## Answer 1 — Opus 5 (main session)

Good instinct to catch this now. First, a quick diagnosis of *why* it's 2 minutes, because it shapes which ideas actually work:

**The math:** a session serves 9–12 cards. 2 minutes ÷ ~10 cards = ~12 seconds per card. So the problem isn't card count — it's that most cards are **read-and-scroll-past**. Adding more cards would just make a 3-minute skim. The lever is **seconds-per-card**, and the good news is that's also the on-brand lever: depth per exhibit, not a longer hallway. A museum doesn't fix "people walk through too fast" by adding rooms — it makes exhibits you stop at.

Your all-card-types idea is right, and here's why it works mechanically: the types have wildly different intrinsic dwell times. A `fast_weird` card is 10 seconds no matter what; an `audio_drift` is minutes long *by construction*, a video is 1–3 min, a playable game is 1–3 min, Fact-or-Myth forces a guess→reveal loop. So "show all types" is really "guarantee time-anchored cards in every slate."

Here's the brainstorm, grouped by mechanism:

**A. Slate composition (your idea, made concrete)**
1. **Guaranteed anchors per session**: composer rule — every session gets ≥1 playable game, ≥1 audio, ≥1 video, ≥2 interactive quiz cards. Those five alone are ~5–7 minutes if engaged with. The text cards become the connective tissue between anchors, not the meal.
2. **Session as a "tour"**: give the slate an arc — open weird (hook), then interactive, then one long read, game in the middle, audio near the end, Field Trip as the exit. Right now insertion is positional (game at 2–4); an intentional rhythm makes the session feel like a designed visit rather than a shuffle.

**B. Turn passive cards into two-step cards** (this is the biggest per-card multiplier)
3. **Guess-before-reveal on explainers**: before the answer, a one-tap prediction ("How long do you think a nuclear submarine can stay under?"). Fact-or-Myth already proves this pattern works in your app. A 10-second read becomes a 30-second engagement, and it directly serves the retell test — committing to a guess is what makes the answer stick.
4. **Progressive reveal on incidents**: the long story types unfold in 2–3 taps within the card ("what happened next →"). Cliffhanger *inside* a session is fine; cliffhanger *across* sessions would be a dark pattern for this brand.
5. **Ponder cards accept a one-line answer**: type a sentence, saved locally, shown back in the Week in Review ("you wrote this on Tuesday"). Writing is slow in the best way, and it feeds the Wrapped card with something no metric can.

**C. End-of-session payoff**
6. **The exit quiz**: 3 quick questions about cards *from this session* before the closing screen. On-brand ("the museum checks what you're taking home"), adds 1–2 min, and — the subtle part — it changes how people read the *whole* session, because they know recall is coming. This is my favorite of the bunch.

**D. Structural (bigger swing, flag for later)**
7. **Paged cards instead of scroll**: one card at a time, tap/swipe to advance. Scrolling is the doomscroll motor pattern — it invites skimming. A pager physically enforces one-exhibit-at-a-time. This is the deepest fix but touches the core feed UI, so I'd park it behind the cheaper wins.

One honest flag: an idea I'd *reject* is any minimum-dwell timer or artificial slowdown — that's engagement-farming dressed up, and it breaks the brand posture. Everything above adds time only when the user is actually doing something.

**My shortlist if you want maximum minutes per unit of work:** #1 (anchor guarantee — mostly backend slate logic), #3 (guess-before-reveal — you already have the interaction pattern built), #6 (exit quiz). Those three together plausibly get a real session to 6–9 minutes.

Also worth doing regardless: you already store `daily_usage` minutes and per-day card counts in the week ledger — we can start actually measuring average session length before/after any change, so this isn't vibes.

---

## Answer 2 — Fable 5 (subagent, same context)

### First, the diagnosis: why 2 minutes

The math makes it obvious. A session is 9–12 cards, and most of your inventory is **read-and-swipe text**: fast_weird, ponder, quiet_contradiction, almost_nothing are all 10–20 second reads even when they're excellent. 10 cards × ~12 seconds = 2 minutes. Nothing is broken — the session is doing exactly what it's designed to do.

So the lever is not *more cards*. Session time = cards × dwell-per-card, and you only have two dials. Turning up the card count is the doomscroll dial — that's literally what Instagram does. Turning up **dwell per card** is the museum dial: you stand in front of fewer paintings, longer. Everything below is about the second dial.

To hit 7 minutes you need ~40–60s average dwell. Text alone will never get there. But look at a realistic mixed session: one game played to completion (~3 min) + one audio_drift actually listened to (~90s) + three guess-before-reveal cards (~30s each) + five fast reads (~15s each) ≈ **7 minutes**. You already own every asset in that equation. The problem is that the high-dwell assets are treated as garnish, not anchors.

### Your idea: "show all card types per session"

Half right. The good instinct: variety, and guaranteeing the high-dwell types (game, audio, video, quiz) appear. The problems:

1. **It's the wrong unit.** Forcing all 9 types into a 9–12 card slate makes every session structurally identical — same rhythm, no surprise, and a museum where every room is in the same order gets boring by day 3.
2. **It burns your scarcest shelves.** almost_nothing (16) and quiet_contradiction (16) forced into *every* session shrinks your ~8 repeat-free days toward 5–6. Your repeat-free runway is a real constraint; the seen-ledger doesn't manufacture content.
3. **Type coverage doesn't create dwell.** A user can swipe past an audio card in 2 seconds just like a text card. Presence ≠ engagement.

Keep the kernel, restate it as: **every session guarantees 2–3 high-dwell *anchors* (one playable, one listenable/watchable, one interactive-guess), not full type coverage.**

### What I'd actually do

**1. Make cards demand a guess before they pay out.** This is your single cheapest, biggest win. You already have the Fact-or-Myth pattern — generalize it across the whole text inventory. fast_weird becomes "guess the number" (slider, then reveal). incident becomes "what happened next?" (two options, then the real story). explainer opens with a question, not the answer. Prediction does double duty: it triples dwell (30s vs 10s) *and* it's the retell test made mechanical — committing to a guess before the reveal is exactly what makes a fact retellable. This is a presentation-layer change on content you already have, not new content.

**2. Promote games from garnish to anchor.** One game card at index 2–4 is your highest-dwell asset buried mid-slate. Give the game a defined arc within the session — "3 rounds of Timeline," "one life of Brick Breaker," a par score — so it has a natural end (crucial: bounded, museum-consistent). A completed game round is 2–4 minutes on its own. Rotate which of the three games anchors each session so the rhythm varies.

**3. One "exhibit" per session: a multi-card sequence on a single topic.** Take your best explainers and serialize them into 3–4 card chains — setup → complication → payoff. One topic, told properly, is 2–3 minutes of genuine attention and dramatically stronger on the retell test than four disconnected facts. This is also how a museum actually works: rooms, not random paintings. It's the one idea here that needs real content work, but it converts existing explainer material rather than requiring net-new research.

**4. Design the listening posture for audio_drift.** 23 audio pieces are worth ~35 minutes of dwell *if anyone presses play*. Check whether they do. If not, the fix is presentation: a full-screen "listening room" card with ambient visuals, a visible duration ("90 seconds"), and a one-tap play — make it feel like sitting on the museum bench, not like an optional attachment.

**5. Close with recall, not just the Field Trip.** Before the Field Trip card, insert one "guestbook" card: "Which of today's cards would you actually retell? Tap it." Ten seconds minimum, often 30–60 if you let them add a one-line note. It deepens memory, extends the session honestly, feeds Week in Review, and — bonus — gives you a per-card retell-test signal straight from users, which is your content quality bar turned into telemetry.

**6. Slow the reveal, not the user.** Museum-voice typography: ponder and almost_nothing cards can unfold in stages (tap or hold to reveal the second line). A beat of intentional pacing per card adds 5–10s each without any dark-pattern spinner nonsense. Small, but it compounds across 10 cards.

### What I would NOT do

- **More cards per session, or a third session.** That's the volume axis — the exact thing you built this app to reject. If you catch yourself adding cards to hit a minutes number, stop.
- **Autoplay-next on video.** You have 296 videos — that inventory is a doomscroll trap in waiting. One video per session, hard stop, no "up next."
- **Streaks, variable rewards, re-engagement notifications.** Every one of these is borrowed from the enemy's playbook and your brand posture ("DAU-down can be success") dies the day you ship one.
- **Artificial friction** — fake loading, forced timers before you can swipe. Dwell must come from the content earning attention, not the UI withholding it.
- **Worship the minutes number itself.** 5–10 min is a fine target, but the honest metrics are: did they *complete* an anchor (finished a game round, played an audio piece, made a guess), and did they come back tomorrow. A 4-minute session where someone played, guessed twice, and tapped a guestbook card is a better session than 9 minutes of numb swiping. Instrument depth actions, not just duration.

### Prioritized shortlist

1. **Guess-before-reveal across the text inventory** (#1) — biggest dwell gain per unit of effort; pure presentation change.
2. **Game rounds as bounded session anchors** (#2) — repackaging an asset you already shipped.
3. **Guestbook/recall closing card** (#5) — small build, extends sessions honestly, and generates retell-test data.
4. **Session composition rule: 2–3 guaranteed anchors** (your idea, reshaped) — slate logic change on the backend.
5. **Multi-card topic exhibits** (#3) — highest content cost, do once 1–4 prove out.
6. **Audio listening room** (#4) — do it after you've checked play-rates; if plays are near zero, bump it up the list.

Ship 1 + 2 + 4 and I'd expect sessions to land in the 5–8 minute range without adding a single new piece of content — which is the whole trick: make the museum visit longer by making people *look*, not by hanging more paintings.

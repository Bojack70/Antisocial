# Antisocial — grounded inventory

Fact-finding pass, 2026-09-01. Every claim below traces to a file that was opened,
or to a live query against the backend that was actually run. No proposals, no
design opinions. Where something could not be established it says so.

**Method for content volumes:** the FastAPI server was running on `localhost:8000`
(PID 8727, started Fri 01 PM, `./venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000`).
Counts come from `GET /api/content/<type>?limit=100000`, which reads Mongo Atlas
directly (`backend/server.py:719-733`). This is source (a), the preferred method,
and it was available for every backend type. `frontend/data/*.ts` pools were counted
in the files.

**Caveat on the running server:** its OpenAPI document exposes
`POST /api/admin/sync-wave2-content`, which is **not** in `backend/server.py` on disk.
That route was added in `ab983db` and removed in `204d70b` (`git log -- backend/server.py`).
So the listening process is one commit behind HEAD. The `FEED_RATIOS` it serves are
identical to the ones on disk (verified: a live `GET /api/feed?limit=35` returned exactly
the `backend/server.py:566-578` distribution), so the volume and composition numbers
below are unaffected.

---

## 1. Card-type census

### 1a. Backend types (Mongo collections, `<type>_content`)

| Backend key | UI label | Renderer | Completion action | Shareable | Reaction chips | Source |
|---|---|---|---|---|---|---|
| `fast_weird` | **Wait... What?** | `FastWeirdCard.tsx:50-53` | none (optional guess → `recordGuess()` at `FastWeirdCard.tsx:85`) | yes (`app/index.tsx:461-464`) | yes (`FastWeirdCard.tsx:126,136`) | `fast_weird_content` |
| `explainer` | **How Does This Work?** | `ExplainerCard.tsx:36` | none | yes (`app/index.tsx:465-468`) | yes (`ExplainerCard.tsx:83`) | `explainer_content` |
| `ponder` | **Ponder & Play** | `PonderCard.tsx:31` | none | yes (`app/index.tsx:469-470`) | yes (`PonderCard.tsx:80`) | `ponder_content` |
| `incident` | **Quietly Fascinating** | `IncidentCard.tsx:32` | none (progressive reveal, `IncidentCard.tsx:26`) | yes (`app/index.tsx:471-472`) | yes (`IncidentCard.tsx:60`) | `incident_content` |
| `mini_game` | **Fact or Myth** / Predict Outcome / Arrange Steps / Guess Scale (per `game_type`, `MiniGameCard.tsx:37-42`) | `MiniGameCard.tsx:46` | answer → `recordGuess()` (`MiniGameCard.tsx:32`) | yes (`app/index.tsx:473-476`) | no | `mini_game_content` |
| `audio_drift` | **Audio Drift** | `AudioDriftCard.tsx:188` | play → `recordAudioPlay()` (`AudioDriftCard.tsx:54`) | yes (`app/index.tsx:477-478`) | yes (`AudioDriftCard.tsx`) | `audio_drift_content` |
| `video` | **Short Explainer** | `VideoCard.tsx:105-108` | none | **no** — excluded deliberately (`app/index.tsx:456-458`, `app/index.tsx:518-519`) | yes (`VideoCard.tsx:171`) | `video_content` |
| `almost_nothing` | **Gentle Reminder** | `AlmostNothingCard.tsx:28` | "Done. That's it." → `recordReminderDone()` (`AlmostNothingCard.tsx:46-55`) | yes (`app/index.tsx:479-480`) | no (deliberate, `AlmostNothingCard.tsx:16-19`) | `almost_nothing_content` |
| `quiet_contradiction` | **Quiet Contradiction** | `QuietContradictionCard.tsx:21` | none | yes (`app/index.tsx:481-482`) | yes (`QuietContradictionCard.tsx:30`) | `quiet_contradiction_content` |
| `try_this` | **Try This** | `TryThisCard.tsx:42` | "I did it" → `recordSkillDone()` (`TryThisCard.tsx:79-83`) | **no** (`app/index.tsx:501`, outside `shareableCardFor`) | no | `try_this_content` |
| `look_closer` | **Look Closer** | `LookCloserCard.tsx:42` | answer → `recordGuess()` (`LookCloserCard.tsx:75`) | **no** (`app/index.tsx:503`) | yes (`LookCloserCard.tsx:118`) | `look_closer_content` |

Every backend type has a Pydantic model in `backend/server.py:41-184`.

### 1b. Client-invented types (never come from the backend)

| Type key | UI label | Renderer | Completion action | Shareable | Source |
|---|---|---|---|---|---|
| `game` | per-game label, always `'Game'` (`data/games.ts:31,46,62`) | `GameCard.tsx:38` | none on the card; the game route records `recordGameRound()` (`app/timeline/index.tsx:106`, `app/board/index.tsx:66`, `app/bricks/index.tsx:276`) | no | `frontend/data/games.ts` |
| `notebook` | **Reflection** | `NotebookCard.tsx:32` | "Leave it in the book" → `writeInNotebook` → `recordWrite()` (`NotebookCard.tsx:49`, `lib/notebook.ts:65`) | no | `frontend/data/writingPrompts.ts` |
| `guestbook` | **The Guestbook** | `GuestbookCard.tsx:50` | tap a card → `signGuestbook` → `recordRetell()` (`GuestbookCard.tsx:33-42`, `lib/guestbook.ts:66`) | no | built from the session's own cards (`app/index.tsx:374-377`) |
| `mission` | **Field Trip** | `MissionCard.tsx:28` | `mission.cta` or "Done" → `recordMissionDone()` (`MissionCard.tsx:23,43`) | no | `frontend/data/missions.ts` |
| `moral_compass` | **Moral Compass** | `MoralCompassCard.tsx` | `entry.cta` or "Done" → `recordGoodTurnDone()` (`lib/moralCompass.ts`) | no | `frontend/data/moralCompass.ts` |
| `week_recap` | **The Week in Review** | `WeekRecapCard.tsx:64-68` | none | **yes** (`app/index.tsx:512-517`) | `lib/weekLedger.ts` |
| `body_aware_interruption` | *(no header — full-bleed page, not a card)* | `BodyAwareInterruption.tsx`, rendered by the pager itself (`app/index.tsx:662-667`, note at `app/index.tsx:520-522`) | none; it holds the deck until its hairline fills (`app/index.tsx:178-181`) | no | inline array `app/index.tsx:64-75` |

### 1c. Naming drift found

- **`cta_label` does not exist.** `TryThisCard.tsx:80` reads `content.cta_label ?? 'I did it'`.
  `TryThisContent` (`backend/server.py:151-166`) has no such field, and a live query
  confirms 0 of 16 `try_this` items carry it. The fallback is always used.
- The share caption and brand line still say **"Modern Weirdness"** (`lib/shareCard.ts:5`,
  `components/ShareableCard.tsx:48`), as does `app.json:3` (`"name": "Modern Weirdness"`)
  and the API root (`backend/server.py:459`). The in-app wordmark is **"antisocial"**
  (`SessionChrome.tsx:25`).

---

## 2. Content volume per type

**Method (a) — live backend query — for all eleven backend types.** Duplicate check:
`unique_ids == total` for every type, so these are distinct items, not double-inserted rows.

| Type | Items | Notes (all measured in the same query) |
|---|---:|---|
| `video` | **296** | 226 are ≤180s, the pool `sample_videos` prefers (`backend/server.py:490,511-515`) |
| `fast_weird` | **48** | 19 carry a `guess` object; 29 do not. Only a *no-guess* item can be the session hook (`backend/server.py:619`) |
| `ponder` | **37** | |
| `explainer` | **34** | |
| `mini_game` | **28** | `fact_vs_fiction` 22, `guess_scale` 3, `predict_outcome` 2, `arrange_steps` 1 |
| `audio_drift` | **23** | 19 are RSS-sourced with a real `audio_url`; **4 have no audio at all** (script only) |
| `incident` | **21** | |
| `almost_nothing` | **16** | ⚠️ thin |
| `quiet_contradiction` | **16** | ⚠️ thin |
| `try_this` | **16** | ⚠️ thin |
| `look_closer` | **10** | ⚠️ **thinnest, and thematically monotonous** — all 10 are NASA space images (Mars dunes, Jupiter, Pluto, the Sun, Carina Nebula, a typhoon eye, three Earth-from-orbit shots, Saturn's hexagon) |

**Total backend corpus: 545 items.**

Method (b) cross-check (literal entries in `backend/populate_*.py`) is consistent but
lower than Atlas, because several scripts were run more than once against different
batches and some items predate the current scripts. The live count is authoritative.
`populate_look_closer.py` holds 10 entries (`IMAGES` at `populate_look_closer.py:35`),
`populate_try_this.py` 16 (`SKILLS` at `populate_try_this.py:28`) — both match Atlas exactly.

### Local pools (method (c), counted in `frontend/data/*.ts` and `app/index.tsx`)

| Pool | Count | File |
|---|---:|---|
| `MISSIONS` (Field Trips) | **60** | `data/missions.ts:23-95` — outside 13, connect 10, make 10, observe 10, move 9, tidy 9 |
| `MORAL_COMPASS` | **21** | `data/moralCompass.ts` — now 5, today 8, this week 8 |
| `TIMELINE_EVENTS` | **54** | `data/timelineEvents.ts:11-66`; used by both the Timeline game and Brick Breaker's level facts (`app/bricks/index.tsx:17,263-264`) |
| `WRITING_PROMPTS` | **24** | `data/writingPrompts.ts:11-35` |
| `BODY_AWARE_INTERRUPTIONS` | **10** | `app/index.tsx:64-75` |
| `GAMES` | **3** | `data/games.ts:26-75` — Timeline, Shortcuts & Rabbit Holes, Brick Breaker |
| Board `JUMPS` facts | **9** | `app/board/index.tsx:17-26` |
| `CAUGHT_UP_SCREENS` | 8 | `app/index.tsx:91-100` |
| `TIME_UP_SCREENS` | 4 | `app/index.tsx:104-109` |
| `LEFT_SCREENS` | 6 | `app/index.tsx:113-120` |
| `FINAL_SESSION_MESSAGES` | 8 | `app/index.tsx:122-131` |
| `END_SESSION_CARDS` | 8 | `app/index.tsx:133-142` |

### Thin-pool flags

1. **`look_closer` — 10 items.** Runs dry first (see §4). Also 100% space imagery,
   so it reads as one exhibit repeated rather than a card type.
2. **`almost_nothing` / `quiet_contradiction` / `try_this` — 16 each.** BACKLOG.md:30-31
   already flags the first two as the reason repeat-free days fall.
3. **`audio_drift` — 4 of 23 have no `audio_url`.** Those items render a script with
   nothing to play, and can never fire `recordAudioPlay()` — which is the exact metric
   BACKLOG.md:69-72 says the listening-room decision is gated on.
4. **`fast_weird` no-guess subpool — 29 items.** Consumed at ~1 per session as the
   guaranteed session hook, on top of ordinary random draws.
5. **AI top-up is off locally.** `backend/server.py:653-661` refills any short type
   (except `video`/`try_this`/`look_closer`, `backend/server.py:495`) by calling GPT.
   `EMERGENT_LLM_KEY` in `backend/.env` is literally `dummy_key`, which
   `backend/server.py:209-212` short-circuits to an empty list. So locally there is
   no auto-refill at all. **Could not determine** whether prod has a real key —
   prod env lives in Vercel as a sensitive variable (BACKLOG.md:8-11) and was not read.

---

## 3. Session composition

### Backend side (`backend/server.py`)

`FEED_RATIOS` (`backend/server.py:566-578`) totals **39 items per slate**:
fast_weird 8, explainer 6, ponder 5, incident 3, mini_game 3, audio_drift 3, video 3,
almost_nothing 2, quiet_contradiction 2, try_this 2, look_closer 2.

`build_feed` (`backend/server.py:640-680`) draws each type via `sample_unseen`
(`backend/server.py:535-561`) — `$match` on `id not in seen`, then `$sample` — shuffles
the 39, and calls `compose_session(feed, limit)`.

`compose_session` (`backend/server.py:586-637`) pulls three anchors out of the shuffled
pool and re-inserts them into the visible prefix:

1. **hook** — first `fast_weird` **without** a `guess` → position 0 (`:619`, `:628`)
2. **guess anchor** — first `mini_game`, `look_closer`, **or** `fast_weird` *with* a guess →
   random position in the first half (`:615-617`, `:629-632`)
3. **listen anchor** — first `audio_drift` **or** `video` → random position in the back third (`:611-612`, `:633-635`)

Missing pools are skipped, not faked (`:598-600`). Everything past `limit` keeps its
shuffled order and is still returned — a live `GET /api/feed?limit=35` returns 39 items.

### Client side (`frontend/app/index.tsx`)

`sessionSize = Math.floor(Math.random() * 4) + 9` → **9, 10, 11 or 12** backend cards
(`app/index.tsx:343`). That same number is sent as `limit`, so `compose_session` composes
exactly the prefix the client will show; the client then slices `data.feed.slice(0, sessionSize)`
(`:356`). Only those cards are marked seen (`:368`).

Insertion order after the fetch, in code order:

| Step | What | Where | Count |
|---|---|---|---|
| 1 | `game` card spliced at index **2, 3 or 4** | `:249-258` | exactly 1, always |
| 2 | `notebook` card spliced at index **5, 6 or 7** | `:384-394` | exactly 1, always |
| 3 | `body_aware_interruption` at every 6–10 items, inserted back-to-front | `:220-228`, `:396-405` | 0–2 in practice (first index is 6–10, list is ~11–14 long) |
| 4 | `guestbook` pushed to the end | `:409-415` | 1, unless no card had a quotable title (`:202-217`) |
| 5 | `mission` appended last | `:266-279`, `:418` | exactly 1, always |
| 6 | `week_recap` spliced at index **1** | `:422-430` | at most once per week (`lib/weekLedger.ts:221-231`) |
| 7 | end-of-session page appended by the pager | `:531`, `:681-714` | 1 |

**Typical session length: 9–12 backend cards + 1 game + 1 notebook + ~1 interruption
+ 1 guestbook + 1 mission + 1 end page = ~14–17 pages.** One card per full swipe page
(`:650-678`).

**Guaranteed every session:** the game card, the notebook card, the mission card, the
end page, and — whenever the pool isn't empty — the fast_weird hook, one guess anchor,
one listen anchor. **Probabilistic:** everything else, and the guestbook (needs ≥1
titled card) and the recap (once per week).

**Can appear more than once in one session:** every backend type, since the shuffled
remainder can draw several of the same type — a live sample showed `look_closer` twice
and `almost_nothing` twice in the first 12. `body_aware_interruption` can appear twice.
`game`, `notebook`, `mission`, `guestbook`, `week_recap` are exactly-once by construction.

### Quota

- `MAX_SESSIONS_PER_DAY = 2` (`lib/quota.ts:9`), day-stamped, checked on every fetch path
  (`app/index.tsx:334-339`). Second session is the "Drift a little longer" button (`:706-710`).
- `DAILY_LIMIT_MINUTES = 180` backstop (`lib/usage.ts:8`), ticked once a minute
  (`app/index.tsx:309-323`), with a midnight-rollover escape (`lib/usage.ts:69-72`).

Note: the app's own tagline elsewhere says 2–3 sessions; the code enforces **2**.

---

## 4. Repeat behaviour, and how many days the content lasts

### The mechanics

- `lib/seen.ts` keeps a flat list of item ids, **not day-stamped** (`seen.ts:10-11`), capped
  at `MAX_SEEN = 600` (`seen.ts:18`), trimmed oldest-first (`seen.ts:53-57`).
  **The cap never binds:** the whole backend corpus is 545 items, so nothing ages out of
  the ledger before the corpus itself is exhausted.
- Dedupe is **by id only**. Two differently-worded cards about the same fact both survive.
- When a type's unseen pool is short, the backend **backfills with already-seen items**
  rather than serving a short session (`backend/server.py:554-559`, and the same for video
  at `backend/server.py:524-529`). So running dry is silent: the session stays 9–12 cards,
  the cards are just reruns. The only signal is the `fresh` count in the response
  (`backend/server.py:676-679`) — **which the client never reads.**

### The arithmetic

Consumption per session ≈ 3 guaranteed anchors + (sessionSize − 3) draws from the
remaining 36 slate items, i.e. p ≈ 7.5/36 ≈ 0.21 per remaining item at the mean
sessionSize of 10.5. At 2 sessions/day that is ~21 backend cards/day. Expected daily
draw per type:

| Type | anchor share | random share | **per day (×2 sessions)** | pool | **days to exhaust** |
|---|---:|---:|---:|---:|---:|
| `fast_weird` | 1.39 | 1.38 | **5.5** | 48 | **~8.7** |
| `look_closer` | 0.24 | 0.37 | **1.2** | 10 | **~8.2** |
| `explainer` | — | 1.25 | 2.5 | 34 | ~13.6 |
| `audio_drift` | 0.50 | 0.52 | 2.0 | 23 | ~11.3 |
| `ponder` | — | 1.04 | 2.1 | 37 | ~17.8 |
| `incident` | — | 0.63 | 1.3 | 21 | ~16.8 |
| `mini_game` | 0.37 | 0.55 | 1.8 | 28 | ~15.3 |
| `almost_nothing` | — | 0.42 | 0.8 | 16 | ~19.2 |
| `quiet_contradiction` | — | 0.42 | 0.8 | 16 | ~19.2 |
| `try_this` | — | 0.42 | 0.8 | 16 | ~19.2 |
| `video` | 0.50 | 0.52 | 2.0 | 296 | ~145 |

That closed-form estimate is pessimistic, because each slate draws more items per type
than the session shows and the unshown ones stay eligible. A Monte-Carlo simulation of
the real algorithm — `sample_unseen` + `compose_session` + the client's `slice(0, sessionSize)`
+ `markSeen`, 400 runs, seeded on the measured pool sizes and the measured 19/48
guess-carrying fraction — gives the **day of the first repeated card, per type**:

| Type | pool | median first repeat | 10th-percentile (unlucky user) |
|---|---:|---:|---:|
| **`fast_weird`** | 48 | **day 10** | day 9 |
| **`look_closer`** | 10 | **day 10** | **day 7** |
| `explainer` | 34 | day 11 | day 9 |
| `ponder` | 37 | day 14 | day 12 |
| `incident` | 21 | day 14 | day 11 |
| `audio_drift` | 23 | day 14 | day 11 |
| `almost_nothing` | 16 | day 16 | day 13 |
| `quiet_contradiction` | 16 | day 16 | day 13 |
| `try_this` | 16 | day 16 | day 13 |
| `mini_game` | 28 | day 18 | day 14 |
| `video` | 296 | never within 60 days | — |

**Answer to the day-12 question: no. The museum starts repeating itself around day 9–10,
not day 12.** For a user taking both sessions every day, the first rerun lands on
**day ~10** (as early as day 7 for the unlucky). By **day ~14** four types are cycling;
by **day ~18** ten of the eleven types are cycling and only `video` is still fresh —
and `video` is 296 of the 545 items, i.e. 54% of the corpus receiving 10% of the slate.

At one session/day rather than two, roughly double every number above.

`look_closer` is the type to watch even before the arithmetic bites: with 10 items all
drawn from the same NASA image set, and ~1.2 shown per day, a user sees the entire type
inside a week and it reads as repetition well before the ledger technically repeats.

Corroboration: BACKLOG.md:30-31 states "~8 repeat-free days," measured independently.
The simulation here says 9–10 median. Same order; treat 8–10 as the honest range.

---

## 5. Shipped vs stubbed vs dead

### Dead code — defined, never imported anywhere

| File | Evidence |
|---|---|
| `frontend/components/CardArt.tsx` | 256 lines; grep for `CardArt` across `app/`, `components/`, `lib/` matches only its own definition at `CardArt.tsx:238` |
| `frontend/components/StageFooter.tsx` | matches only its own definition at `StageFooter.tsx:21` and a prose mention in `SessionChrome.tsx:19` |

### Neutered — imported and called, but does nothing

- **`SessionChrome` ignores every prop.** `SessionChrome.tsx:22` is
  `export default function SessionChrome(_props: Props)` and the body renders only the
  wordmark (`:23-27`). The comment at `:16-20` says the session line, progress track,
  Reclaimed Time line, dot strip and chevrons were removed 2026-08-31 and "the props
  stay so the call site is untouched while the trial settles."
  Consequences, all live in `app/index.tsx`:
  - `sessionNumber` / `minutesToday` state and the effect that computes them
    (`app/index.tsx:169-170, 185-193`) is **computed and discarded**.
  - `onPrev` / `onNext` (`app/index.tsx:629-630`) are **unreachable** — there is no
    chevron. Navigation is swipe-only, plus `DeckAdvanceContext` from a card's own
    completion button (`app/index.tsx:657`).
  - Position-in-deck (`index`/`count`) is displayed **nowhere**; the comment points at
    `StageFooter`, which is itself dead.
- **`ReactionButtons` reactions go nowhere.** The `onReact` callback
  (`ReactionButtons.tsx:8,47-49`) is **never passed by any caller** — grep across
  `app/`, `components/`, `lib/` finds it only inside `ReactionButtons.tsx`. Tapping a
  reaction chip fades the button, shows "Noted." for 1.5s, and stores nothing.
  Nine card components render it.
- **`POST /api/preferences/track`** (`backend/server.py:708-717`) is **never called by
  the frontend** — grep for `preferences/track` in `frontend/` returns nothing.
  The `user_preferences` collection is write-only-in-theory and never written.
- **`content.cta_label`** (`TryThisCard.tsx:80`) — field does not exist on the model or
  on any of the 16 stored items. Always falls back to "I did it".

### Feature flags / trial leftovers

- **`STAGE_PREVIEW_TYPES`** (`app/index.tsx:29`) is an **empty `Set`**. The comment at
  `:24-28` says the centred "stage" experiments are retired and the set stays "only so a
  stage component can be re-auditioned by naming its type here." Consequence: the three
  stage components — `FastWeirdStageCard.tsx`, `ExplainerStageCard.tsx`,
  `MiniGameStageCard.tsx` — are imported (`app/index.tsx:20-22`) and **can never render**.
  They are dead-but-wired, deliberately.
- **`ShareableCard`'s `fill` prop** (`ShareableCard.tsx:18`) exists for staged cards;
  `renderContentCard` is called with `fill = false` everywhere (`app/index.tsx:488, 673`).
- The `redesign/paper-swipe` branch is **fully merged and stale**:
  `git rev-list --left-right --count main...redesign/paper-swipe` → `4  0`.
  The trial pin mentioned in the branch history was stripped in `0ec3893`
  ("chore: strip the trial-only feed pin before going live"). Working tree is clean on `main`.
- **`initialRouteName="onboarding/index"`** (`app/_layout.tsx:51`) governs the native
  back stack only; the actual web gate is the `isOnboardingComplete()` check at
  `app/index.tsx:294-297` (see the explanation at `lib/onboarding.ts:5-10`).

### Testing doors (shipped, intentional)

- `/reset` (`app/reset/index.tsx`) — clears quota, seen ledger, usage clock, plus
  `week_ledger`, `week_recap_shown`, `missions_done`, `good_turns_done` and
  `moral_compass_recent` by key.
  Second button also resets onboarding (`:48-52`).
- `/cards` (`app/cards/index.tsx`) — one page per card type in the real deck; reads the
  backend but consumes no session, no seen ledger, no clock (`:34-38`).
- `/play` (`app/play/index.tsx`) — the Game Room hub, lists all three `GAMES`.

### No TODOs

A grep for `TODO|FIXME|HACK|XXX|not implemented|coming soon` across `frontend/app`,
`frontend/components`, `frontend/lib`, `frontend/data`, `backend/*.py` returns **no
genuine markers** — only `disabled={...}` props and `placeholder` style names.

### Where docs and code disagree

| Doc claim | Code says |
|---|---|
| `BACKLOG.md:7` — "**Items 2–7 not built.**" | Contradicted by `BACKLOG.md:44-46` in the same file and by shipped code: item 2 (game anchors) `app/index.tsx:235-261`; item 3 (guestbook) `components/GuestbookCard.tsx`; item 4 (`compose_session`) `backend/server.py:586`; item 7 (staged reveal) `IncidentCard.tsx:26`. The header status line is **stale**; the ✅ marks at `:55,:59,:64,:80` are current. |
| `test_result.md:130` — "all **6** content types" | Eleven backend types exist (`backend/server.py:41-184`). |
| `test_result.md:142` — feed ratio "**10:7:6:3:2:2**" | Actual `FEED_RATIOS` is 11 types, 8:6:5:3:3:3:3:2:2:2:2 (`backend/server.py:566-578`). |
| `test_result.md:120-130` — generation "using **GPT-5.2**" | `backend/server.py:435` calls `model="gpt-4"`, and the local key is `dummy_key` so it never runs. |
| `test_result.md:208` — "Backend is **production-ready**" | The whole file predates the current content model; **treat it as an archived artifact, not a status report.** |
| `design-spec.md:11,14,15,18` — session line, Reclaimed Time line, pager dots, chevrons all given "now" values | All four were **removed** from `SessionChrome` on 2026-08-31 (`SessionChrome.tsx:16-20`). The spec's measurements are for a chrome that no longer renders. |
| `BACKLOG.md:99` — "**15-20** hand-authored skills" | 16 in Atlas. Consistent. |
| `BACKLOG.md:104-110` — "**12-15** curated PD/CC0 images" for look_closer | **10** in Atlas. Under target. |
| `README.md:1` — "# Here are your Instructions"; `frontend/README.md` | Both are untouched scaffolding. No project content. |
| `docs/research-engagement-ideas.md` (2026-09-01) | Research + 10 proposals. **Nothing in it is implemented.** Its `[search-only]` caveat at `:6` is worth honouring. |
| `docs/session-depth-raw-brainstorms-2026-08-28.md` | Explicitly superseded by BACKLOG (`:3-6`). Proposal-only. |

Genuinely remaining per BACKLOG (and not contradicted by code):
**item 5b listening room** (`BACKLOG.md:69-72`, gated on `audioPlays`) and
**item 6 multi-card exhibits** (`BACKLOG.md:73-79`). Parked: paged feed
(`BACKLOG.md:124-126`) — though note the feed *is* now one card per page
(`app/index.tsx:637-678`), so that parked item appears to have been overtaken by events.

---

## 6. Depth signals captured vs surfaced

`DayEntry` (`lib/weekLedger.ts`) records **thirteen** fields per local day, pruned to
14 days:

| Field | Written by | Surfaced to the user? |
|---|---|---|
| `sessions` | `recordSession` ← `app/index.tsx:369` | **no** — not in the recap's stat grid |
| `cards` | same call | **yes** — "Cards seen" (`WeekRecapCard.tsx:54`) |
| `missions` | `recordMissionDone` ← `MissionCard.tsx:23` → `lib/missions.ts:24` | **yes** — "Field trips" (`WeekRecapCard.tsx:52`) |
| `leftEarly` | `recordLeftEarly` ← `app/index.tsx:698` | **yes** — "Left before closing" (`:53`) **and** the voice line (`:57-60`) |
| `guesses` | `recordGuess` ← `MiniGameCard.tsx:32`, `FastWeirdCard.tsx:85`, `LookCloserCard.tsx:75` (+ the two dead stage cards) | **no** |
| `audioPlays` | `recordAudioPlay` ← `AudioDriftCard.tsx:54` | **no** |
| `gameRounds` | `recordGameRound` ← `app/timeline/index.tsx:106`, `app/board/index.tsx:66`, `app/bricks/index.tsx:276` | **no** |
| `retells` | `recordRetell` ← `lib/guestbook.ts:66` | **yes** — conditional sentence, not a stat tile (`WeekRecapCard.tsx:86-92`) |
| `writes` | `recordWrite` ← `lib/notebook.ts:65` | **indirectly** — the *text* of the freshest entry is quoted back (`WeekRecapCard.tsx:95-102`), but the count is never shown |
| `skillsDone` | `recordSkillDone` ← `TryThisCard.tsx:83` | **no** |
| `reminders` | `recordReminderDone` ← `AlmostNothingCard.tsx:53` | **no** |
| `goodTurns` | `recordGoodTurnDone` ← `MoralCompassCard.tsx` → `lib/moralCompass.ts` | **yes** — conditional sentence, not a stat tile (deliberately: a big number beside "good turns" reads as a scoreboard for decency) |
| `daysVisited` (derived) | `lastWeekRecap` (`lib/weekLedger.ts:188-191`) | **yes** — "Days visited" (`WeekRecapCard.tsx:51`) |

So: **13 signals captured, 4 shown as numbers, 3 shown as prose, 6 captured and never
surfaced anywhere** — `guesses`, `audioPlays`, `gameRounds`, `skillsDone`, `reminders`,
`sessions`. `audioPlays` and `gameRounds` were deliberately shipped ahead of the decision
they inform (`lib/weekLedger.ts:19-21`), so their invisibility is by design; the other four
are not explained anywhere in code.

The recap card itself only appears **once per week**, on the first session of a new week,
and only if the prior week had ≥2 active days (`lib/weekLedger.ts:182-231`,
`app/index.tsx:422-430`). Six of the twelve signals therefore have **no read path at all**
short of `/reset`-era debugging.

### Local rotation state (adjacent to the ledger)

| Key | Purpose | Persisted? |
|---|---|---|
| `last_anchor_game` | avoid the same game twice in a row | **yes**, AsyncStorage (`app/index.tsx:238,246`) |
| `notebook_recent_prompts` | avoid the last 6 writing prompts | **yes** (`lib/notebook.ts:21-23,96-99`) |
| `lastMissionId` | avoid the same Field Trip twice in a row | **no — in-memory `useRef` only** (`app/index.tsx:195,267-269`). It resets on every app launch, so on a cold start the previous day's mission can repeat immediately. Asymmetric with `last_anchor_game`, which is persisted for exactly this reason. |
| `missions_done` | lifetime Field Trip tally | yes (`lib/missions.ts:9-24`) — and **surfaced nowhere**; the comment at `lib/missions.ts:6-7` calls it "the (future) weekly share card" |
| `moral_compass_recent` | avoid the last 12 Moral Compass entries | **yes**, via the shared `pickRotating` ledger (`lib/rotation.ts`) — unlike `lastMissionId`, this one survives a cold start |
| `good_turns_done` | lifetime Moral Compass tally | yes (`lib/moralCompass.ts`) — and **surfaced nowhere**; the week's count comes from the ledger's `goodTurns`, not from this key |

---

## Appendix — how each number was obtained

- Backend volumes: `curl -s "localhost:8000/api/content/<type>?limit=100000"`, parsed for
  `count`, unique `id`, and per-type fields (`guess` presence, `game_type`, `duration`,
  `audio_url`, `source`). Route: `backend/server.py:719-733`.
- Slate composition: `curl -s "localhost:8000/api/feed?limit=35"`, type-counted.
  Returned 39 items (the full `FEED_RATIOS` total), confirming that `limit` orders the
  prefix rather than truncating the slate.
- Local pools: line-counted in `frontend/data/*.ts` and `frontend/app/index.tsx`.
- Day counts: closed-form arithmetic above, plus a 400-run Monte-Carlo re-implementation
  of `sample_unseen` + `compose_session` + the client slice + `markSeen`, seeded on the
  measured pool sizes.
- Dead code: `grep -rn <symbol> frontend/app frontend/components frontend/lib`.
- Branch state: `git rev-list --left-right --count main...redesign/paper-swipe`,
  `git log --oneline -8 -- backend/server.py`, `git status --short` (clean).

### Could not determine

- Whether the production backend (Vercel + Atlas) has a real `EMERGENT_LLM_KEY`, and so
  whether AI top-up actually fires in prod when a type runs short. `backend/.env` holds
  `dummy_key`; prod env is a Vercel sensitive variable and was not read. Tried: reading
  `backend/.env` and `backend/.env.local` (the latter holds only a Vercel OIDC token).
- Whether the 10 `look_closer` NASA image URLs still resolve. Tried: reading the stored
  URLs; **not** fetched, since that would be a network claim rather than a code reading.
- Real-world session duration. No timing instrumentation exists in the codebase beyond
  the one-minute `addMinute()` tick (`lib/usage.ts:54`), which measures wall-clock time
  with the app open, not per-card dwell.

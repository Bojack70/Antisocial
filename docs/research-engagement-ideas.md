# Deepening Antisocial without betraying the posture

**Research date:** 2026-09-01
**Question asked:** what to add next to make the app more engaging *without* increasing session count, session length, or return frequency.

**Verification status — read this first.** Every non-obvious claim below is tied to a URL that was fetched during the research pass. Claims marked **[search-only]** come from search-engine summaries because the source returned HTTP 403 to a direct fetch — weaker evidence, flagged rather than laundered. Products marked **unverified** could not be established at all and should not be cited downstream. Full source lists are in §5.

---

## 0. Thesis

Museum studies already contains this product's core insight, and it predates the attention economy. Gilman named "museum fatigue" in 1916; Robinson and Melton showed **visitor interest declines as the number of exhibits increases**; Serrell (1997–98) found visitors could become "apathetic towards the museum" in **under 20 minutes**. The literature's mitigations are: fewer objects, **varied pacing**, seating/breaks, and **visitor autonomy over path** ([Museum fatigue, Wikipedia](https://en.wikipedia.org/wiki/Museum_fatigue)).

Antisocial has already done "fewer objects" (quota) and part of "varied pacing" (mixed card types). The three unexploited levers are **curatorial framing**, **dwell**, and **a rendered ending**. Every top recommendation is one of those three.

---

## 1. Top 10 recommendations

### 1. Give every session a title and a one-line wall label

**Idea:** the slate opens with a room name and one deadpan framing line — "Room 4: Things that were true before anyone believed them. Four objects." — and cards are actually chosen to fit it.

**From:** Bloomberg Connects, "a curator in your pocket," where "exhibitions are presented step-by-step with audio and written guides… all curated by the museum itself" **[search-only — bloombergconnects.org 403]** ([I amsterdam](https://www.iamsterdam.com/en/see-and-do/museums-and-galleries/bloomberg-connects-a-curator-in-your-pocket)); Google Arts & Culture's **One Minute Guides**, "AI-tailored art movement introductions" ([artsandculture.google.com/play](https://artsandculture.google.com/play)); The Browser's editors giving "original descriptions with explanations of why they believe each piece is good writing and worth reading" ([thebrowser.com/about](https://thebrowser.com/about/)).

**Why it fits:** zero extra cards, zero extra minutes. It converts a random slate into a curated one — the difference between a feed and an exhibit — and makes the ending legible *in advance* ("four objects"), the opposite of an infinite tail.

**Card sketch:** new `room_label` interstitial as page 0. Parchment, Lora title, one sub-line, no button beyond the existing swipe. Register: "Room 4. Four objects. They do not agree with each other."

**Effort:** M. Frontend trivial (reuse `CardHeader`/`SessionChrome`); real work is the backend slate builder selecting against a theme tag, plus theme tags on existing content.

**Risk:** thin themes. If the theme is "assorted," the label is noise and cheapens the deck. Ship 8–12 hand-written rooms; only emit a label when the slate genuinely satisfies one, else fall back to today's unlabelled deck.

### 2. Close the retell loop — ask, a week later, whether they actually retold it

**Idea:** `guestbook` already asks which card you'd retell. `week_recap` quotes it back: "You said you'd retell the one about the lighthouse. Did you?" Yes / No / Forgot. Nothing uploaded, nothing scored.

**From:** Exist's review model — "By finding relationships in your data, we can help you answer questions like: 'What makes me happiest?'" ([exist.io](https://exist.io/)); How We Feel's check-in-plus-*why* structure, built with Yale's Center for Emotional Intelligence and Marc Brackett, on-device by default ([App Store](https://apps.apple.com/us/app/how-we-feel/id1562706384)).

**Why it fits:** this measures the app's own stated success metric — did content escape into a conversation — instead of return visits. The most posture-aligned instrument available, and it gives the recap card a meaning other than "here are your numbers."

**Card sketch:** extend `WeekRecapCard`. Line 1 quotes the guestbook entry verbatim; line 2 asks; three chips reusing `ReactionButtons`; result to `weekLedger`. "Forgot" must be first-class and unpunished — that's the whole tone.

**Effort:** S. `guestbook.ts` and `weekLedger.ts` both exist; this is a join plus three chips.

**Risk:** edges toward self-assessment guilt. Never aggregate into a score, never show a percentage, never mention it again after its week.

### 3. A slow-look gate on `look_closer`

**Idea:** the reveal is withheld for a fixed dwell — 45 seconds — with honest progress and an always-available skip. Copy names what it's doing: "Look for forty-five seconds. Most of it is in the bottom third."

**From:** Slow Art Day — "participants look at five works of art for 10 minutes each and then meet together over lunch to talk about their experience," guided by "It's not what you look at that matters, it's what you see" ([slowartday.com/about](https://www.slowartday.com/about/)). Mechanically it's one sec: "a deliberation message, friction by a short waiting time, and the option to dismiss," measured at a 57% reduction in app openings across 280 participants over six weeks **[search-only — pnas.org and pubmed both 403]** ([PNAS](https://www.pnas.org/doi/10.1073/pnas.2213114120), [RevenueCat interview with Riedel](https://www.revenuecat.com/blog/growth/frederik-riedel-expected-12-his-app-cut-screen-time-by-57/)).

**Why it fits:** more time on one object while object count stays fixed — the literal definition of depth-not-length. It's also the only mechanic here that changes what a user *notices*.

**Card sketch:** `LookCloserCard` gains `dwellSeconds`. During dwell the reveal button is present, labelled "Skip the looking." Slow Art Day's ten minutes translates to forty-five seconds on mobile. Do not use a spinner — a spinner reads as loading. Use a slowly filling hairline rule under the image.

**Effort:** S.

**Risk:** a timed gate reads as a bug or a paywall. Two load-bearing mitigations: (a) the skip is visible from second zero, per one sec's finding that the dismiss option is its single most effective component **[search-only]**; (b) copy states the duration up front so nothing is a surprise.

### 4. The "what happened next" card

**Idea:** resurface a specific `incident` or `fast_weird` the user saw 3+ weeks ago and add the part that wasn't on the original card. "Eleven days ago you were told the lighthouse keeper was never found. He was. In 1962. In Buenos Aires."

**From:** Delayed Gratification — "last to breaking news," a quarterly that "revisits the events of the previous three months to see what happened after the dust settled" ([slow-journalism.com/what-we-do](https://www.slow-journalism.com/what-we-do)). Mechanically it's Readwise's Daily Review inverted: "Highlighting is great, but what's the point if you're never going to see any of those highlights again?… We surface your best highlights back to you at the right times" ([readwise.io](https://readwise.io/)).

**Why it fits:** multiplies the value of the *existing* corpus instead of demanding more content, and rewards having paid attention weeks ago — a payoff no infinite feed can offer, because infinite feeds have no memory of you.

**Card sketch:** new type `what_happened_next`. Backend stores an optional `followUp` referencing a parent card id. `seen.ts` already knows what was shown and when; the slate builder requests follow-ups whose parent is in the seen set and older than N days. Renders as an `incident` with a small "Previously" eyebrow.

**Effort:** M. Needs a content-authoring commitment, and since the seen ledger is client-side the client must send parent ids up with the slate request.

**Risk:** it can look like a repeat, contradicting the no-repeat promise. The "Previously" framing must be explicit, and if a follow-up has no genuinely new fact it should not exist.

### 5. An Oblique-Strategies deck behind `body_aware_interruption` and `try_this`

**Idea:** replace ad-hoc ambient lines with a designed deck of single-instruction cards with a house grammar, one drawn per session.

**From:** Eno and Schmidt's *Oblique Strategies* (1975, subtitle "Over One Hundred Worthwhile Dilemmas," 113 cards in the first edition). Real cards: "Use an old idea." / "Ask your body." / "Work at a different speed." / "Honour thy error as a hidden intention." The method is the part worth stealing: "the card is trusted even if its appropriateness is quite unclear" ([Wikipedia](https://en.wikipedia.org/wiki/Oblique_Strategies)).

**Why it fits:** pure content quality, zero mechanic, zero session-count effect. Tonal fit is exact — Eno's cards are deadpan, unexplained and never encouraging, which is the voice spec.

**Card sketch:** no new component. What changes is authorship: 100+ lines written as a coherent deck with a stated rule (imperative mood, no explanation, no benefit claim, no exclamation). "Notice where your shoulders are." already obeys the grammar; write the rest to match.

**Effort:** S. Content work, one collection, no client change.

**Risk:** fortune-cookie drift. Eno's test: would you still act on the card if it felt inappropriate? If a line only works when it happens to be relevant, it's a tip, not a strategy — cut it.

### 6. Turn `mission` into dérive decks with two instruction classes

**Idea:** field trips become a deck split into declared classes — *locomotive* (how to move) and *evocative* (what to attend to) — with optional city decks later.

**From:** the Dérive app, built on Debord's dérive ("a mode of experimental behavior linked to the conditions of urban society: a technique of rapid passage through varied ambiances"), issuing "a set of random instructions written on virtual cards" in exactly those two modes, with "localized decks of cards for different cities." Real instructions: "following cars, looking for shaded lanes, and sitting for two minutes while waiting for a man in a red hat to pass by" **[search-only — deriveapp.com 403]** ([Apartment Therapy](https://www.apartmenttherapy.com/derive-app-review-36714600), [UNC Asheville *Capstone*](https://janeway.uncpress.org/capstone/article/id/2437/)). Atlas Obscura is the content-side proof that "wondrous places" curation sustains without a feed ([atlasobscura.com](https://www.atlasobscura.com/)).

**Why it fits:** the mission card is the only card whose completion happens *outside* the app — the purest expression of "install the app you'll hopefully stop using."

**Card sketch:** `MissionCard` gains a class tag as a tiny eyebrow — "A way of moving" / "A thing to notice." `missions.ts` gets deck structure. No geolocation in v1: place-agnostic instructions work anywhere and dodge a permissions prompt.

**Effort:** S for the deck restructure; L for city decks (location permission, per-city content, moderation).

**Risk:** safety and applicability — instructions that assume a walkable city fail for most users. Ship only instructions that work indoors or on any street, and never require going anywhere specific.

### 7. Ask how much time they have, at the door

**Idea:** before card one — "How long have you got?" → *Three objects* / *Six objects*. The larger is today's default; the smaller is new. Sets slate size for this session only.

**From:** Minimalist Phone, which rejects daily quotas for per-session intent: "daily limits don't work. Decide your session length every time you open an addictive app" ([minimalistphone.com](https://www.minimalistphone.com/)). Museum-fatigue research supports the principle: satiation arrives later for "visitors following self-selected paths… than those following predetermined routes" ([Wikipedia](https://en.wikipedia.org/wiki/Museum_fatigue)).

**Why it fits:** the only mechanic in this report whose realistic net effect is *fewer* cards consumed. It gives autonomy in the direction of less and converts an imposed limit into a chosen one — which the research says is also the more satisfying visit.

**Card sketch:** a page-0 chooser sharing the `room_label` slot from #1 (label above, two chips below). Two options only; a third makes it a settings screen. Never offer "more than six."

**Effort:** M. Slate builder accepts a requested length; `quota.ts` must decide whether a three-card session consumes a full session — **it should**, or you've invented a way to get more sessions per day.

**Risk:** a gate before content is what ad-supported apps do and users resent it. Remember the choice and default to it silently afterwards, so it's a one-time question in practice.

### 8. Order the slate against a fatigue curve, not at random

**Idea:** place cards by cognitive load — dense → ambient breath → playable anchor → dense → close. `body_aware_interruption` becomes structural seating rather than a card that happens to appear.

**From:** museum-fatigue design mitigations directly — "providing adequate seating throughout galleries," "incorporating breaks," "varying exhibit types," "reducing object density" ([Wikipedia](https://en.wikipedia.org/wiki/Museum_fatigue)). YouTube's "Take a break" is the software analogue: "The reminder will pause your video until you dismiss it or resume playing the video" ([YouTube Help](https://support.google.com/youtube/answer/9012523)) — note it's on by default only for 13–17s and off for adults, which tells you how the incentive runs at an ad-funded company.

**Why it fits:** invisible, free, and makes the same number of cards land harder. Nothing about session count or length changes.

**Card sketch:** no new card. A `weight` field (1–3) on every card type in Mongo, plus an ordering pass in the FastAPI slate endpoint that forbids adjacent weight-3 cards and inserts an ambient line after the heaviest one.

**Effort:** S. Highest effect-to-effort ratio in the report.

**Risk:** over-fitting makes every session feel identical. Constrain rather than prescribe — forbid bad adjacencies, then shuffle within what remains.

### 9. Render the close as closing time, not as a stop

**Idea:** the closed screen gets a short deliberate animation — parchment dimming, shadow lengthening, one haptic — before the copy appears. The pause is performed, not asserted.

**From:** Apple's Mindfulness app, where Reflect is "read the theme, focus your attention, then tap Begin," runs 1–5 minutes with haptics configurable as "None, Minimal, or Prominent," and ends with a summary screen ([Apple Support](https://support.apple.com/guide/watch/start-a-reflect-or-breathe-session-apd371dfe3d7/watchos)); Endel, where each soundscape carries "their own generative visual to help put you in the right state of mind" ([endel.io](https://endel.io/)); and one sec's catalogue of interruption *types* — "Take a deep breath," "Mirror," "Conversational Reflection," "Rotate Phone," "Type random text," "4-7-8 breathing" ([one-sec.app](https://one-sec.app/)) — the best proof that a pause has many possible renderings and the choice matters.

The cautionary reference is Instagram's "You're All Caught Up," announced 2 July 2018, appearing "when you've seen every post from the last two days" — but already-viewed and older-than-two-days posts still sit *below the message* ([Instagram](https://about.instagram.com/blog/announcements/introducing-youre-all-caught-up-in-feed)). An ending with content under it is not an ending. Antisocial can mean it.

**Why it fits:** the ending is the product. Right now it's asserted in copy; making it sensory is the difference between "the app stopped" and "the room closed."

**Card sketch:** a ~1.2s transition preceding the existing closed-copy pools. Add a single haptic on native.

**Effort:** M. Known constraint: animation can't be verified in this project's headless browser harness — needs device-side verification.

**Risk:** a slow ending is where users are least patient. Keep it well under 1.5s; any tap skips it.

### 10. Prompt packs for `notebook`

**Idea:** the reflection prompt becomes a small themed pack — six prompts on one theme, one per session, entirely local.

**From:** Day One's Prompt Packs, "curated collections of themed journal prompts" across Gratitude, Mindfulness, Creativity, Personal growth and "About Me," each with "a progress bar tracking how many prompts you've answered" ([Prompt Packs](https://dayoneapp.com/features/prompt-packs/)); base prompts "rotate out for a new one every 24 hours" **[search-only]** ([Day One guide](https://dayoneapp.com/guides/tips-and-tutorials/daily-writing-prompts/)). Stoic supplies morning-intention vs evening-review structure and dichotomy-of-control sorting **[search-only]** ([Stoic help centre](https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/daily-journaling-flow/6f9eBdDY7m4AnbXtALLGtM)). How We Feel supplies the best single prompt idea in the family: scanning for physical sensations — "heavy shoulders, fluttering stomach, tight chest" — sitting directly adjacent to `body_aware_interruption` ([App Store](https://apps.apple.com/us/app/how-we-feel/id1562706384)).

**Why it fits:** a themed sequence gives a reason to write beyond novelty, and the notebook is already local-only and unuploaded, so no data-hunger incentive attaches to it.

**Card sketch:** `NotebookCard` gains a pack eyebrow ("Rooms you've lived in — 3 of 6"). Packs in `notebook.ts` / AsyncStorage.

**Effort:** S–M.

**Risk:** the progress bar. Day One's pack progress is a completion mechanic one step from a streak. Show position ("3 of 6"), never a percentage, never a "finish the pack" prompt; let packs sit unfinished forever without comment.

---

## 2. Per-family findings

### Family 1 — Finite feeds and slow media

| Product | What it does | Verdict |
|---|---|---|
| **The Browser** | "Five recommended articles… a daily podcast and a daily video," hand-chosen by named editors; founder reviews ~1000 articles/day to publish 5 **[search-only for the 1000 figure]** ([about](https://thebrowser.com/about/), [Ghost](https://ghost.org/resources/the-browser-curation-tips/)) | **Adopt the framing, not the format.** The named-editor voice explaining *why this one* is recommendation #1. The daily-podcast expansion is the drift to avoid. |
| **Delayed Gratification** | Quarterly print, "last to breaking news," "revisits the events of the previous three months to see what happened after the dust settled" ([what we do](https://www.slow-journalism.com/what-we-do)) | **Adopt.** Recommendation #4. Best content idea in the slow-media family; `incident` is already the right vessel. |
| **Tortoise** | ThinkIns ~5×/week feed "a once-daily news digest of five to seven concise articles that has a beginning, a middle, and an end" **[search-only — Nieman 403]** ([Nieman Lab 2019](https://www.niemanlab.org/2019/03/slow-down-read-up-why-slow-journalism-and-finishable-news-is-quickly-growing-a-following/)) | **Partial.** "Beginning, middle, end" is a better design constraint than "a slate of cards." ThinkIns are a community mechanic — out of scope. |
| **Zetland** | Calls it the "finishable feature"; 35% of subscribers cite the "manageable number of articles" as a primary reason for membership **[search-only, same 403 source]** | **Strongest commercial evidence in the report** that finiteness is a value proposition, not a compromise. Use in positioning. |
| **Artifact** | Dead. Systrom announced 12 Jan 2024 that "the market opportunity wasn't large enough to warrant continued investment"; dark early April 2024, tech acquired by Yahoo. 444k downloads since Feb 2023, ~12k/month by Oct 2023. TechCrunch's diagnosis includes **feature dilution** — it became "a new app entirely" with social posting, link sharing and place recommendations, which "blurred the app's core identity" ([TechCrunch](https://techcrunch.com/2024/01/18/why-artifact-from-instagrams-founders-failed-shut-down/)) | **Learn from, don't copy.** A named, dated precedent for why comments/followers/read-counts kill a reading app. |
| **Nuzzel** | Shut down 6 May 2021, two days after Twitter acquired parent Scroll on 4 May **[search-only]** ([Axios](https://www.axios.com/2021/05/04/twitter-acquires-scroll), [Nuzzel blog](https://blog.nuzzel.com/nuzzel-is-going-away-for-now/)) | **Reject as a model.** Curation was a function of your social graph. |
| **Pocket** | Mozilla shut it down 8 July 2025 (exports to 8 Oct 2025): "the way people save and consume content on the web has evolved" **[search-only]** ([9to5Mac](https://9to5mac.com/2025/05/22/mozilla-announces-shutdown-of-pocket/), [PCWorld](https://www.pcworld.com/article/2793228/mozilla-is-discontinuing-pocket-and-fakespot/)) | **Cautionary.** Save-for-later turns a finite session into an infinite queue held elsewhere. |
| **Refind** | "Brain food, delivered daily… we analyze thousands of articles and send you only the best," 500k+ users. Per-day volume **not stated on the homepage** — could not verify ([refind.com](https://refind.com/)) | **Weak.** Algorithmic personalisation with unspecified volume is closer to a feed than an artefact. |
| **Dense Discovery** | Weekly (Tuesdays), "more than just a newsletter: consider it a carefully edited digital publication"; recurring sections include Worthy Five, Notable Numbers, Aesthetically Pleasing **[section names search-only — densediscovery.com 403 on three fetches]** ([Tools & Toys](https://toolsandtoys.net/dense-discovery-newsletter/), [DD 2025 survey](https://www.densediscovery.com/notes/survey-2025/)) | **Adopt fixed slots cautiously.** Named slots make a weekly artefact feel composed — but DD's own survey shows readers *skip* sections. Fixed slots for `week_recap` only, never the daily slate. |
| **Briefings (Espresso)** | "The daily desert-island briefing with everything distilled so you can get to the end of it without worrying about missed links" **[search-only]** ([Nieman Lab 2015](https://www.niemanlab.org/2015/09/what-you-need-to-know-how-six-publishers-digest-the-news-for-their-readers/)) | **Adopt the copy discipline.** "Get to the end of it" is legible to normal readers. |

### Family 2 — Daily-ritual single-serving apps

| Product | Mechanic | Verdict |
|---|---|---|
| **Wordle** | One puzzle/day, same for everyone. Wardle: "having one puzzle per day creates a sense of scarcity, leaving players wanting more"; it "encourages players to spend only three minutes on the game each day"; ad-free, "not trying to do anything shady with your data or your eyeballs." Spoiler-free emoji grid adopted *from players*; ~1.2M results shared 1–13 Jan 2022 ([Wikipedia](https://en.wikipedia.org/wiki/Wordle)) | **Adopt scarcity + spoiler-free share; reject the streak.** The grid communicates *shape* without content — recruits without spoiling and without pulling the sharer back. |
| **NYT Games** | Friend-following with "daily scores across Wordle, Connections, Spelling Bee and the Mini," score history, archive of "over 10,000 past puzzles" **[search-only]** ([Play listing](https://play.google.com/store/apps/details?id=com.nytimes.crossword)) | **Reject.** Textbook illustration of what a subscription business does to a finite daily object: the archive removes scarcity, friend scores add a comparison return loop. |
| **Duolingo** | Streak, stackable streak freezes (×2 since 2024), Streak Society, escalating guilt notifications incl. "You made Duo sad" **[search-only]** ([Decision Lab](https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification)) | **Hostile — reject entirely.** See §3. |
| **Forest** | "Every minute of concentration grows a tree. Lose focus, and you lose the tree." Sessions accumulate into "a visible record of every minute you chose depth over distraction"; 2,102,946 real trees; "Plant Together" where "the whole group's tree falls if anyone gives up" ([forestapp.cc](https://www.forestapp.cc/)) | **Partial.** Transferable half: the accumulating artefact as a record of depth (`weekLedger` already is this, undramatised). Non-transferable: loss framing and group liability — both coercion. |
| **one sec** | Intercepts an open with "a deliberation message, friction by a short waiting time, and the option to dismiss"; ~10s delay; 57% fewer openings, 36% dismissal after the nudge **[search-only]**. Interruption types: "Take a deep breath," "Mirror," "Conversational Reflection," "Rotate Phone," "Type random text," "4-7-8 breathing" ([one-sec.app](https://one-sec.app/), [PNAS](https://www.pnas.org/doi/10.1073/pnas.2213114120), [RevenueCat](https://www.revenuecat.com/blog/growth/frederik-riedel-expected-12-his-app-cut-screen-time-by-57/)) | **Adopt — best reference here for how to render a pause.** The dismiss-option finding is counter-intuitive and directly shapes #3: always show the skip. |
| **Opal** | Focus Rules®, Focus Timer®, "Opal Score®: your day in one score," **Focus Gems®** for hour milestones (10/50/100/500/1,000) and streaks (2/5/10 days) ([opalapp.com](https://opalapp.com/)) | **Split.** Session-length declaration useful (#7, via Minimalist Phone). Gems and a composite daily score are streaks with better art — reject. |
| **Unpluq** | NFC keychain tag; "to open blocked apps, you need your physical Unpluq Tag (or one of the digital barriers)"; "just enough pause to break the autopilot scroll" ([unpluq.com](https://www.unpluq.com/)) | **Adopt the copy register, not the mechanic.** That tagline is close to Antisocial's voice. Hardware out of scope. |
| **Minimalist Phone** | "Daily limits don't work. Decide your session length every time you open an addictive app" ([minimalistphone.com](https://www.minimalistphone.com/)) | **Adopt.** Recommendation #7 — the strongest single sentence found in the screen-time category. |
| **Finch** | "Take care of your pet by taking care of yourself." Could **not** verify missed-day handling, soul journeys or streak behaviour — homepage carries no mechanics detail ([finchcare.com](https://finchcare.com/)) | **Unverified, and reject anyway.** A dependent virtual creature is loss aversion by another name. |
| **Streaks (app)** | **Unverified — not researched.** | Skipped; §3 covers the mechanic. |
| **Oak** | "Oak adapts to your day—not the other way around"; 1M+ users. Could **not** verify the widely-repeated "entirely free, no subscription" claim — not on the current homepage ([oakmeditation.com](https://www.oakmeditation.com/)) | **Weak.** Adopt the sentence, not the product — it's a defensible framing for #7. |

### Family 3 — Curiosity and knowledge discovery

| Product | Mechanic | Verdict |
|---|---|---|
| **Google Arts & Culture** | Three relevant items: **Odd One Out** ("spot AI-generated imposters among real artworks"), **Visual Crosswords** ("solve artistic puzzles through unexpected pairings"), **One Minute Guides** ("AI-tailored art movement introductions") ([play](https://artsandculture.google.com/play)) | **Adopt two.** *Odd One Out* is a ready-made `look_closer` variant with real 2026 relevance. *Visual Crosswords*' "unexpected pairings" is structurally identical to `quiet_contradiction` and validates that card type. |
| **Wikipedia "On this day"** | "Generally 5 events out of those eligible can be chosen for display each day"; selection balances "chronological diversity, geographic representation, and subject variety," prioritising round anniversaries (100 > 50 > 25/10) ([Wikipedia:On this day](https://en.wikipedia.org/wiki/Wikipedia:On_this_day)) | **Adopt the rubric, not the feature.** A dated "on this day" card creates daily return pressure — mildly hostile. But the editorial rubric is directly usable as content-selection policy for `incident`, battle-tested at scale. |
| **Ground News** | Blindspots = "stories disproportionately covered by one side of the political spectrum," bucketed For the All / Left / Right, each with an L/C/R percentage split ([ground.news](https://ground.news/), [blindspot](https://ground.news/blindspot)) | **Adopt the visual grammar, reject the topic.** Showing the *shape* of what you consumed as a plain distribution is transferable; politics would break the voice. |
| **Kialo** | 33,100 debates, 798,580 claims, 1,326,090 votes; browsable Featured/Popular/New/Hot. Could **not** verify pro/con tree mechanics — not on the homepage ([kialo.com](https://www.kialo.com/)) | **Partial, lower confidence.** A `ponder` variant — a claim, two chips, then a second claim that complicates whichever you picked. Pre-authored branches only; user-generated is one step from a comment system. |
| **The Pudding** | Interactive visual essays: an explorable 5,000-menu NYPL database (Jun 2026), a "Happy Map" of 100,000 moments (Feb 2026), NYC Street View letting users "search every visible word on New York City's streets" (Jul 2025) ([pudding.cool](https://pudding.cool/)) | **Aspirational, mostly out of scope.** One importable pattern: the *single-mechanic explorable* — one dataset, one interaction, one insight. Plausible occasional `mini_game`/`look_closer` hybrid, but L-effort each. |
| **Snipd** | "Just tap your headphones whenever you hear something worth remembering. Our AI creates a snip for you with audio, transcript, and summary"; AI chapters; exports to Readwise/Notion/Obsidian ([snipd.com](https://www.snipd.com/)) | **One take, one reject.** AI chapters validate that a clip should announce its own structure — good for an `audio_drift` eyebrow. The snip/export loop builds an external backlog — reject. |
| **Blinkist** | 9,000+ titles "in just 15 minutes"; free tier is "one free daily summary handpicked by our editorial team"; Premium $79.99–$119.99/yr, Pro $139.99/yr ([App Store](https://apps.apple.com/us/app/blinkist-book-summaries-daily/id568839295)) | **Adopt the free tier as a philosophy.** It's accidentally the ideal Antisocial product: exactly one editorially chosen thing per day, no archive. The paid tiers are the anti-pattern. |
| **Shortform** | 10,000+ guides, "dense, actionable summaries," exercises, community discussions; $16.42/mo annual, $24/mo monthly ([shortform.com](https://www.shortform.com/)) | **Reject.** Volume + archive + community. |
| **CuriosityStream** | Could **not** verify — homepage returned no extractable content ([curiositystream.com](https://curiositystream.com/)) | **Unverified.** Low relevance regardless: subscription long-form video is the opposite of a 90-second `audio_drift`, and licensing makes it a non-starter. |
| **Do Not Research** | "A publishing platform for writing, visual art, internet culture and more"; now on Substack after a redirect from donotresearch.net. Format/cadence **not verifiable** ([donotresearch.substack.com](https://donotresearch.substack.com/)) | **Nothing transferable found.** Reported for completeness. |
| **Atlas Obscura** | "A definitive guidebook and friendly tour-guide to the world's most wondrous places"; Places database, Nearby discovery, daily newsletter promising "wonder in your inbox" ([atlasobscura.com](https://www.atlasobscura.com/)) | **Adopt as a content model for `mission`.** Nearby is the natural v2 of the field trip card; its register is a good target for `incident` copy. |
| **Trivia (QuizUp/Stellar-ish)** | **Unverified — not researched.** | Skipped deliberately: leaderboards, timed rounds and rematch loops are disqualified by the brief before research is warranted. |

### Family 4 — Reflection and journaling

| Product | Prompt design | Verdict |
|---|---|---|
| **Day One** | Prompts rotate every 24h **[search-only]**; **Prompt Packs** are "curated collections of themed journal prompts" with a progress bar of "how many prompts you've answered," plus a favourites library ([Prompt Packs](https://dayoneapp.com/features/prompt-packs/), [guide](https://dayoneapp.com/guides/tips-and-tutorials/daily-writing-prompts/)) | **Adopt the pack, throttle the progress bar.** Recommendation #10. |
| **How We Feel** | Colour-coded mood-meter matrix with fine emotion vocabulary; tag *why*; **scan for physical sensations** ("heavy shoulders, fluttering stomach, tight chest"); four strategy families (Change Your Thinking / Move Your Body / Be Mindful / Reach Out); free; on-device by default with opt-in research sharing; built with Yale's Center for Emotional Intelligence and Marc Brackett ([App Store](https://apps.apple.com/us/app/how-we-feel/id1562706384)) | **Best in family. Take two things.** (a) The body-scan prompt is a free upgrade to `body_aware_interruption` — more specific than "notice where your shoulders are," and specificity is the app's stated content bar. (b) Its privacy posture matches `notebook` already; state it on the card, once. |
| **Stoic** | Morning intention / evening review split; mood check-in on every open; negative visualization and dichotomy-of-control exercises **[search-only]** ([help centre](https://help.getstoic.com/stoic-user-guide/mooMJC6qGFVeG62FpCwNAw/daily-journaling-flow/6f9eBdDY7m4AnbXtALLGtM)) | **Partial.** The morning/evening split implies two sessions/day — mildly hostile. But *dichotomy-of-control sorting* is a superb `ponder` mechanic needing no new UI beyond existing chips. |
| **Daylio** | Two-tap entry (mood + activities), then "crunch data and display it in stats, charts, and correlations"; **Year in Pixels** — "the full year in one chart. Every dot is a day in your life"; also daily/weekly/monthly **goals** and streaks ([daylio.net](https://daylio.net/)) | **Split.** Year in Pixels is a lovely recap idea, visually compatible with parchment. Failure mode: a dense dot grid makes every empty dot an accusation. If adopted, render only days that happened. Goals/streaks: reject. |
| **Exist** | Correlations — "By finding relationships in your data, we can help you answer questions like: 'What makes me happiest?'"; weekly summary emails; mood scale plus behaviour tagging ([exist.io](https://exist.io/)) | **Adopt the question form.** Insight = *a question the data answers about you*, not a number. `week_recap` should read "The cards you said you'd retell were all about people, not things," not "4 retells this week." |
| **Reflectly** | Active; AI-driven prompts, mood tracking, motivational content; v5.0.3 as of 11 Jul 2026 **[search-only]** ([App Store](https://apps.apple.com/us/app/reflectly-journal-ai-diary/id1241229134)) | **Reject.** "Motivational content" is the exact register the voice spec forbids. |
| **Jour** | **Unverified.** Could not find current status or mechanics; searches surfaced unrelated products. Do not cite. | N/A |

### Family 5 — Museum, gallery and exhibit metaphors

Highest-yield family, because the metaphor is already committed to and currently under-used.

- **Museum fatigue is real, measured, and on your side.** Gilman 1916; Robinson/Melton on interest declining as exhibit count rises; Davey (2005) defines it as "a collection of phenomena that present predictable decrease in visitor interest and selectivity"; a Florida Museum of Natural History study found high interest for ~30 minutes then decline; Serrell (1997–98) found apathy in under 20 minutes in some conditions. Mitigations: seating and breaks, varied exhibit types, reduced object density, clear labels, visitor autonomy over path ([Wikipedia](https://en.wikipedia.org/wiki/Museum_fatigue); [Davey, *What is museum fatigue?*](https://www.researchgate.net/publication/292110022_What_is_museum_fatigue)). **Verdict: adopt as the app's design constitution.** Supplies #7 and #8, and independently justifies the existing quota.
- **Slow Art Day** — annual, global; "participants look at five works of art for 10 minutes each and then meet together over lunch"; some venues cut to one or two works; guided by "It's not what you look at that matters, it's what you see"; 232 venues signed up for the next edition ([slowartday.com/about](https://www.slowartday.com/about/)). **Adopt** (#3). Note the almost uncanny parallel: five objects, a fixed dwell, then you tell someone about it — that is Antisocial's session plus its guestbook card.
- **Bloomberg Connects** — free guides to 1000+ institutions; "exhibitions are presented step-by-step with audio and written guides voiced by artists and cultural insiders, plus descriptions of each work and custom maps, all curated by the museum itself"; "a curator in your pocket" **[search-only — 403]** ([I amsterdam](https://www.iamsterdam.com/en/see-and-do/museums-and-galleries/bloomberg-connects-a-curator-in-your-pocket), [Whitney](https://whitney.org/visit/bloomberg-connects)). **Adopt the step-by-step curated-visit structure** (#1). The audio-guide format is also the honest model for `audio_drift` — **and it sidesteps the licensing problem entirely**, because a 40-second first-party curatorial note needs no licence.
- **Google Arts & Culture Pocket Galleries** — AR collection walkthroughs ([play](https://artsandculture.google.com/play)). **Reject.** L-effort, device-gated, adds no depth to a text-and-image card.
- **Cabinet of curiosities / Wunderkammer** — the historical form closest to this app: one room of heterogeneous objects with no taxonomy, shown to a visitor, then closed. **Unverified as a software product** — no credible modern implementation found to cite. Framing device only.

### Family 6 — Ambient, calm and interstitial design

- **Apple Mindfulness / Reflect** — "read the theme, focus your attention, then tap Begin"; 1–5 minutes; haptics "None, Minimal, or Prominent"; heart rate in a summary screen at the end ([Apple Support](https://support.apple.com/guide/watch/start-a-reflect-or-breathe-session-apd371dfe3d7/watchos)). **Adopt the three-beat structure** — theme, deliberate begin, explicit summary. Note especially that Apple *names the end*: there's a summary, not just a disappearance.
- **one sec** — the interruption-type catalogue is the most useful design artefact in this family, because it proves a pause is a design space with many valid renderings ([one-sec.app](https://one-sec.app/)). **Adopt as a menu to steal from.** "Rotate Phone" in particular is a physical-commitment gesture that suits `try_this` or the closing screen and costs almost nothing.
- **Endel** — soundscapes "endlessly generated on the device following your local inputs — weather, time of day, cadence of your walks, and heart rate," four modes, each with "their own generative visual"; claims 7× focus increase, 3.6× stress decrease ([endel.io](https://endel.io/)). **Adopt one narrow idea: generative ambience is a solved problem and dodges licensing entirely** — a procedurally generated 20-second parchment-toned tone bed for the closing screen has no rights-holder. Reject the biometric personalisation (no accounts, no HealthKit, no reason).
- **Calm** — the Daily Calm is a new ~10-minute themed meditation every morning, led by Tamara Levitt **[search-only — calm.com 403]** ([Calm help centre](https://support.calm.com/hc/en-us/articles/115005140414-What-are-the-Calm-Dailies-Daily-Meditations-Movement)). **Partial.** One new themed thing per day is good, but a disappearing daily creates return pressure by construction and would fight the quota.
- **Headspace** — **unverified, not fetched this session.** Do not cite.
- **YouTube "Take a break"** — "The reminder will pause your video until you dismiss it or resume playing the video"; timer resets on app close, sign-out, device switch or 30+ min pause; **on by default for 13–17, off by default for 18+** ([YouTube Help](https://support.google.com/youtube/answer/9012523)). **Instructive, not adoptable.** The default asymmetry is the tell: a pause an ad business ships is a pause it hopes you decline. Antisocial's equivalent is stronger — the session simply ends.
- **Instagram "You're All Caught Up"** — announced 2 July 2018, triggered when "you've seen every post from the last two days," but already-seen and older posts remain *below* the message ([Instagram](https://about.instagram.com/blog/announcements/introducing-youre-all-caught-up-in-feed)). **The definitive negative example.** Worth naming in positioning copy as the thing this app is not doing.

---

## 3. Explicitly rejected ideas

1. **Streaks of any kind.** The Decision Lab documents four failure modes: hollowed engagement (returning out of obligation), intrinsic-motivation drainage ("quantification can drain the enjoyment out of activities we're already motivated to do"), catastrophic abandonment ("users who break their streaks are more likely to stop using the platform entirely"), and ubiquitous meaninglessness ("if everything in your digital life has a counter, a goal, and a notification reminding you of your progress, then none of them feel special") ([Decision Lab](https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification)). The third is fatal here: a streak makes the app's success depend on consecutive-day behaviour — a return-frequency metric in a wellness costume.
2. **Streak freezes / repair.** Duolingo's stackable freezes **[search-only]** monetise and prolong the anxiety the streak created. Adding an antidote to a poison you introduced is not a feature.
3. **Any push notification whose purpose is a return visit.** "You made Duo sad" **[search-only]** is the endpoint of this road, two design reviews away from any "we picked something for you today." The only defensible notification for this app is none.
4. **Collectible achievement currency.** Opal's Focus Gems® for 10/50/100/500/1,000 hours and 2/5/10-day streaks ([opalapp.com](https://opalapp.com/)). Milestone collectibles convert usage into a score; "Done. That's it." is the correct opposite — an action with no receipt.
5. **Friend scores and leaderboards.** NYT Games' friend-following **[search-only]**. Out of scope per the brief, but named here because it's the most common "harmless" first step into a social graph.
6. **A browsable archive of past cards.** NYT sells "over 10,000 past puzzles" **[search-only]**. An archive converts a finite daily object into an infinite backlog and destroys the quota's meaning in one screen. This is the most likely feature request you will receive and the most important to refuse.
7. **Comments, posts, likes and "reads" counters.** Artifact added social posting, link sharing, comments and follower counts; TechCrunch's post-mortem cites feature dilution — "a new app entirely" that "blurred the app's core identity" ([TechCrunch](https://techcrunch.com/2024/01/18/why-artifact-from-instagrams-founders-failed-shut-down/)). Dated precedent, not a hypothetical.
8. **An "end of feed" marker with content below it.** Instagram's implementation ([source](https://about.instagram.com/blog/announcements/introducing-youre-all-caught-up-in-feed)). If the close ever softens into "here are some older ones," the product is over.
9. **Save-for-later queues.** Pocket's shutdown **[search-only]** ends 17 years of evidence that a queue becomes a guilt store. Any "keep" must be capped at one per session with no long list view.
10. **Loss-framed companions.** Forest's dying trees ([forestapp.cc](https://www.forestapp.cc/)) and Finch's dependent bird ([finchcare.com](https://finchcare.com/)) work through loss aversion. An app that hopes you use it less cannot punish you for using it less.
11. **Group liability.** Forest's "the whole group's tree falls if anyone gives up." Social coercion; no accounts; no.
12. **Unlimited or repeatable "drift a little longer."** The single extension is fine *because* it's single. Making it repeatable — or free of quota — reintroduces the infinite tail through the back door.
13. **Personalisation that narrows.** Artifact's AI feed ([TechCrunch](https://techcrunch.com/2024/01/18/why-artifact-from-instagrams-founders-failed-shut-down/)) and Refind's "send you only the best" ([refind.com](https://refind.com/)) optimise toward what you already click. Wikipedia's opposite rubric — deliberate chronological, geographic and subject spread ([Wikipedia:On this day](https://en.wikipedia.org/wiki/Wikipedia:On_this_day)) — is the correct model for a curiosity product.
14. **"Motivational content"** (Reflectly **[search-only]**). Contradicts the deadpan, no-cheerleading voice.
15. **A dense completion grid.** Daylio's Year in Pixels, "every dot is a day in your life" ([daylio.net](https://daylio.net/)), is a visual streak. If used at all, render only days that happened.
16. **Long-form licensed video.** Beyond licensing, a CuriosityStream-style library is structurally session-lengthening. `video` should stay short and first-party or clearly licensed.

---

## 4. Honourable mentions

- **Spoiler-free session share.** Wordle's grid conveyed shape without content, ~1.2M shares in 13 days ([Wikipedia](https://en.wikipedia.org/wiki/Wordle)). `shareCard.ts` could emit the session's *shape* — five glyphs, one per card type, plus the room name. Growth without a return loop for the sharer. **S.** Risk: still a social artefact — keep it manual, never prompt.
- **Odd One Out as a `look_closer` variant.** Four images, one generated ([play](https://artsandculture.google.com/play)). **S** given the existing card-art pipeline; mind the project's documented commercial-use constraints on image tooling.
- **Dichotomy-of-control chips on `ponder`.** From Stoic **[search-only]**. Two chips: "up to me" / "not up to me." **S.**
- **A one-item local vitrine.** Snipd's snip ([snipd.com](https://www.snipd.com/)), capped hard: one keep per session, max nine ever, oldest falls out. The cabinet-of-curiosities framing makes the cap the point rather than a limit. **M.** Risk: any collection is a completion drive; the cap is the mitigation and must never be raised.
- **AI-chapter-style eyebrows on `audio_drift`.** One line on what happens in the clip, before play ([snipd.com](https://www.snipd.com/)). **S**, content-side.
- **Insight-as-question in `week_recap`.** From Exist's framing ([exist.io](https://exist.io/)). **S** once #2 ships.

---

## 5. Sources

**Fetched successfully:**
techcrunch.com/2024/01/18/why-artifact-from-instagrams-founders-failed-shut-down/ · thebrowser.com/about/ · en.wikipedia.org/wiki/Wordle · refind.com · forestapp.cc · thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification · dayoneapp.com/features/prompt-packs/ · apps.apple.com/us/app/how-we-feel/id1562706384 · support.apple.com/guide/watch/start-a-reflect-or-breathe-session-apd371dfe3d7/watchos · artsandculture.google.com/play · snipd.com · kialo.com · ground.news · ground.news/blindspot · pudding.cool · en.wikipedia.org/wiki/Wikipedia:On_this_day · endel.io · unpluq.com · opalapp.com · slow-journalism.com/what-we-do · donotresearch.substack.com · shortform.com · about.instagram.com/blog/announcements/introducing-youre-all-caught-up-in-feed · en.wikipedia.org/wiki/Oblique_Strategies · atlasobscura.com · daylio.net · oakmeditation.com · minimalistphone.com · en.wikipedia.org/wiki/Museum_fatigue · slowartday.com/about/ · support.google.com/youtube/answer/9012523 · apps.apple.com/us/app/blinkist-book-summaries-daily/id568839295 · readwise.io · exist.io · one-sec.app · revenuecat.com/blog/growth/frederik-riedel-expected-12-his-app-cut-screen-time-by-57/ · toolsandtoys.net/dense-discovery-newsletter/ · finchcare.com · curiositystream.com (no extractable content)

**Search-summaries only (fetch returned HTTP 403 or page not directly retrieved) — claims marked [search-only]:**
niemanlab.org/2019/03/slow-down-read-up-why-slow-journalism-and-finishable-news-is-quickly-growing-a-following/ · niemanlab.org/2015/09/what-you-need-to-know-how-six-publishers-digest-the-news-for-their-readers/ · pnas.org/doi/10.1073/pnas.2213114120 · bloombergconnects.org + iamsterdam.com + whitney.org/visit/bloomberg-connects · densediscovery.com + densediscovery.com/notes/survey-2025/ · calm.com + support.calm.com/hc/en-us/articles/115005140414 · deriveapp.com/s/v2/ + apartmenttherapy.com/derive-app-review-36714600 + janeway.uncpress.org/capstone/article/id/2437/ · blinkist.com + dayoneapp.com/guides/tips-and-tutorials/daily-writing-prompts/ · help.getstoic.com/…/daily-journaling-flow/ · apps.apple.com/us/app/reflectly-journal-ai-diary/id1241229134 · 9to5mac.com/2025/05/22/mozilla-announces-shutdown-of-pocket/ + pcworld.com/article/2793228/ · axios.com/2021/05/04/twitter-acquires-scroll + blog.nuzzel.com/nuzzel-is-going-away-for-now/ · play.google.com/store/apps/details?id=com.nytimes.crossword · ghost.org/resources/the-browser-curation-tips/ · researchgate.net/publication/292110022_What_is_museum_fatigue

**Explicitly unverified — do not cite downstream:** Jour (status/mechanics unknown); Headspace (not researched); Streaks the app (not researched); QuizUp/Stellar-style trivia (not researched, excluded on brief grounds); Oak's "free forever" claim (not on current homepage); Finch's missed-day handling and soul-journey structure (not on current homepage); cabinet-of-curiosities software implementations (none found).

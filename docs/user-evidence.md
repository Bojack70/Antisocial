# User evidence: what real people say about apps adjacent to Antisocial

Compiled 2026-09-01. **Every finding below is anchored to a verbatim quote from an actual
user**, with subreddit + thread title + date, or Google Play listing + star rating + date.

## Method and its limits

- **Reddit** was read through the user's logged-in browser via OpenTabs against `old.reddit.com`
  (plain `curl` and `WebFetch` are blocked). Thread bodies and comments were read in full, not
  from search snippets.
- **Google Play reviews** were read by opening each listing in the browser and dumping the
  "See all reviews" dialog. `WebFetch` truncates Play pages before the review section, so it
  was not usable. The **iTunes customer-reviews RSS is dead** and returned nothing.
- **No marketing copy, homepage, Wikipedia page, or press article is cited in this document.**

### Explicit gaps — sources I could not reach

- **Artifact (Systrom/Krieger news app, dead Jan 2024).** I found only one Reddit post about it
  (`r/TheDecoder`, "AI-curated news app Artifact shuts down after one year", 2024-01-15) and it
  has **zero comments**. Searches across r/apple, r/Android, r/technology, r/gadgets,
  r/androidapps and sitewide returned no user-side discussion. **I have no user evidence on
  Artifact and am not substituting a summary for one.**
- **Refind and The Browser** — no user-generated review corpus found in the sources available.
- **Opal on iOS** — Opal is iOS-first; the Play listing (`com.withopal.opal`) reflects a newer,
  rockier Android build. Opal iOS evidence below is second-hand-via-Reddit, and labelled.

### Credibility caveat you should carry through the whole document

Three of the r/nosurf "I tested N apps" threads (`1r2zlsx`, `1r0hjaq`, `1r2znfb`, all Feb 2026)
are by a **single account, `Dangerous-Project874`**, with low scores (18, 25 and 2 points) and a
suspiciously SEO-shaped cadence. A commenter in an adjacent thread notes another such account was
banned shortly after posting. Treat that author's posts as **one person's testimony, possibly
content marketing** — but note the *comments underneath them* come from unrelated accounts, and the
same complaints recur independently in Play reviews. I flag each quote from that author inline.

Separately: the OP of the pivotal "no app is allowed to end" thread **admitted running their post
through GPT** ("I asked gpt to correct my English, probably introduced specific syntax, apologies").
The *idea* is theirs and the 38 comments are unambiguously human — I quote the commenters, not the OP.

---

## 1. Why do people QUIT these apps?

### 1.1 Friction stops working. The brain automates the ritual in about ten days.

This is the single most repeated mechanical failure mode, and it is fatal to the entire
"pause before you scroll" category.

> "one sec was the closest to actually working. The breathing pause before opening apps genuinely
> made me reconsider sometimes. **But after about 10 days my brain just automated the pause. Breathe
> in, breathe out, open app. It became muscle memory like everything else.**"
> — u/Dangerous-Project874, r/nosurf, *"Every focus app I download turns into another app I need to
> stop using"*, 2026-02-12 *(single-author caveat applies)*

Corroborated independently by a paying user in the Play reviews:

> "i bought the premium version of the app because i think it's SO needed & on the right track. The
> more i use it though, the more i wish the user experience could be modified. **I realize that many
> times i just get used to and go through the delay.** Other times, the delay is frustrating because
> I actually need the social media app for productivity related reason."
> — Ali Kapadia, **one sec**, Google Play (44 found helpful), 2023-03-07

**Why this matters to Antisocial:** a bounded slate that *ends* is not a friction mechanic. There is
nothing to habituate through — the wall is the content running out, not a delay you can wait out.

### 1.2 The anti-app becomes another app to manage

> "I download a focus app to spend less time on my phone. Then I spend 20 minutes setting it up. Then
> I spend another 15 minutes customizing the settings. Then I check my stats 6 times a day to see how
> much time I 'saved.' Then I go to the app store to see if theres a better one. […] **The perfect
> focus app would delete itself after setup.**"
> — u/Dangerous-Project874, r/nosurf, same thread, 2026-02-12 *(caveat applies)*

> "StayFree shows you nice graphs of your screen time which sounds helpful except I became obsessed
> with checking the graphs. 'Oh look I only used instagram for 47 minutes today instead of 52.' Cool.
> **I am still on my phone right now looking at a graph about being on my phone.**"
> — same thread

> "Flora had me growing virtual trees and **I was checking on my tree more than I was checking
> instagram.** The gamification thing works for about 3 days and then its just another notification
> on your screen."
> — same thread

### 1.3 Rug-pulls: features that were free, or already paid for, moving behind a paywall

This is the most common single reason in the Play reviews for a long-term user leaving. It shows up
across *every* app I sampled.

> "**I would have given this app 5 stars before 'Forest plus' took away features that I HAD ALREADY
> PAID FOR.** I know it was only $5, but I really resent losing features I paid to access in the
> first place. There was already a premium currency so this really comes across as greedy. It's still
> functional. I still use it. **But I'm honestly looking for alternatives** that let me track my stats
> without paying a subscription."
> — Beth V, **Forest**, Google Play, 2026-04-01

> "I have loved this app for years. I bought the pro version when it first started out, but the app
> just seemed to get worse over time. more glitching, more internal ads, etc. **I finally gave up when
> they created another subscription tier and called it 'plus'.** I am sad to say goodbye to all of my
> hundreds of virtual trees, but I don't see any way that this app could regain my trust."
> — Xochitl Castellanos, **Forest**, Google Play, 2026-07-28

> "I wake up this morning to an entirely new app. The UI is snazzy, sharp … Okay, that's great and
> all, but **putting my multiple time blocks that *I* made behind a subscription? What?** I understand
> that apps need to make money, but only allowing three rules for a free account, when I had at least
> 5-6 rules already in place and it was working for me? So beyond frustrating."
> — Caroline, **Opal**, Google Play, 2026-06-03

> "**was great a few months ago, not worth it now.** It just did the intervention on me when I was
> actively reading an article. Also I can't choose how long to be on an app anymore like I could a few
> months ago. **They stuck, bottom of the barrel, basic features behind a paywall which sucks.** My doc
> and therapist thought it was super neat and asked me what it was and then started recommending it to
> their clients. **Now we are on the hunt for a new one instead and they have stopped recommending it.**"
> — Jamie Volle, **one sec**, Google Play, **2 stars**, 2025-07-03 (28 found helpful)

### 1.4 Dishonest numbers destroy trust permanently

> "this app (just the free version) has helped me stick to my schedules like 90% of the time. So
> ideally I would have given it 5⭐. But I'm someone who keeps their own tracker so I noted the weekly
> average numbers only to realise that **they KEEP CHANGING.** for example, may 4 to may 10 had shown
> 7h 27m last week (after the week was complete of course duh). today when I see the stats, the same
> week shows 3h 32m!! **my trust is now fully gone** and idk how long I'll use the app. such a pity :("
> — Karunya Rao, **Opal**, Google Play, 2026-06-01

> "The stats are misleading. **It counts any time you have the phone locked as 'saved time,'** which
> inflates the numbers. If I put my phone down to eat dinner, Opal counts that as time it 'saved' me.
> That's not honest."
> — u/Dangerous-Project874, r/nosurf, *"I tested Opal (screen time app) for two weeks. Here's why I
> uninstalled it."*, 2026-02-09 *(caveat applies)*

### 1.5 Data loss and account fragility

The single loudest complaint in the Finch community, and it is entirely about the app **owning your
history in an account**.

> "It's wild to me that so many comments here are basically saying, 'Well, you should have known to
> babysit the app.' **No. A paid, modern app should have stable, automated cloud saves. You shouldn't
> need a daily chore list just to keep your self-care app from deleting itself.**"
> — u/Possum-Kingdom94, r/finch, *"Sorry but this is kind of unacceptable ?"*, 2026-07-14
> (**1,685 points**, top comment on a 1,605-point post)

> "I have over 120 apps on my phone - none of which require a manual backup. Every single one of them
> are backed up online automatically using my account. **I'm so perplexed as to how Finch is the only
> one set up this way, so that you can be a user for years and then lose it all in the blink of an
> eye.**"
> — u/Better-Dragonfruit60, same thread

> "I'm going to end up in crisis if I lose my finch data. It's been three years! Three years of hard
> work and progress […] **Even with the backups, I'm not sure I'd want to continue if this happened
> tho… it's like a gut punch.**"
> — u/danceswithdangerr, same thread

### 1.6 Feature bloat and drift away from the original job

> "i stopped using the app about four days ago. **I lost a 401 day streak.** […] this app really helped
> me for a year then with all the new updates it doesn't anymore. **it's like a glorified to-do list
> instead of a mental health app.** […] **the app is just an overwhelming to-do list now**"
> — u/ghost_dreams_, r/finch, *"my mom got me a plushie but i stopped using the app"*, 2025-12-19
> (**2,847 points**, 258 comments)

> "When I started the app, there were no streaks, and goals were not the main focus of the app. **It
> was all about journaling and logging your mood** so that the app would tag the things you talked
> about in a positive way or a negative way […] **It was genius. I don't know why they changed it to a
> generic to-do list app.**"
> — u/sciecne, same thread (**851 points**)

> "The problem with Insight Timer is **they lost their way.** It has all sorts of pop-ups and
> intercepts. You can turn many of them off but not all of them. **It isn't the simple app it used to
> be, now it's got all sorts of sales in it.**"
> — u/oddible, r/Meditation, *"Meditation apps are overwhelming me - looking for something truly
> minimal"*, 2025-09-14

> "While this app started out great, **they seem to have shifted focus from reading to listening.**
> The number of new titles to read doesn't seem to be growing and the app is constantly pushing audio
> and podcasts. I can get that anywhere for free. I paid for blinkist to read summaries of nonfiction
> books. **If the service continues to depart from that mission I guess it isn't for me anymore.**"
> — Joe Eaton, **Blinkist**, Google Play, 2022-01-02 (163 found helpful)

### 1.7 The blunt one: nothing actually changed

> "**Uninstalled after 14 days. My screen time went back to normal within 48 hours of removing it,
> which tells you everything.**"
> — u/Dangerous-Project874, r/nosurf, Opal test thread, 2026-02-09 *(caveat applies)*

---

## 2. What do people say they WANT and can't find?

### 2.1 The headline demand — this thread is essentially a spec for Antisocial

> "Something I can't stop noticing: **almost every app I use is engineered so I can never finish it.**
> The feed refills. The next episode autoplays. The streak guilts me back. **There's no 'you're done
> for today' — being done is treated as a failure state.**
>
> I started wondering what the opposite would feel like. Something you open, that has a **fixed, small
> amount** in it, and when you reach the end it's actually over — no 'related content,' no
> pull-to-refresh, nothing waiting to reclaim you. **You close it and you've genuinely finished a
> thing, which is a feeling I almost never get from a screen anymore.** […]
>
> **Has anyone found digital things that are deliberately finishable? Not 'use less of an infinite
> app,' but experiences designed to end.**"
> — u/Difficult_Egg8736, r/digitalminimalism, *"I got fixated on the fact that basically no app is
> allowed to end"*, 2026-07-24, **263 points, 98% upvoted, 38 comments**
> *(OP admits GPT copy-editing; the demand is corroborated by the commenters quoted throughout §4)*

Nobody in 38 comments named a product that does this. Every answer was either **an old version of a
social app** ("Facebook used to be this way"), **a non-app** (print newspapers, CDs, RSS, e-ink), or
**a paid newspaper** (NYT). **That is an unfilled category, stated in the users' own words.**

### 2.2 "Too many features" is a real, specific, repeated ask

> "I've tried Headspace, Calm, Insight Timer, Ten Percent Happier… they all have the same problem for
> me. **Too many features, too many choices, too much content.**
>
> I just want to sit quietly for 10-20 minutes with maybe a simple bell. **No courses, no streaks, no
> social features, no mindfulness journey.**
>
> **The irony isn't lost on me that meditation apps stress me out.**"
> — u/brushali, r/Meditation, 2025-09-14, 61 points, **176 comments**

### 2.3 "Choose for me" — the anti-scroll audience explicitly does *not* want a search box

This is the most operationally useful quote in the whole document for a curated-slate product:

> "does the app offer recommendations? **A lot of my scrolling comes from not wanting to think or
> decide anything** but if it goes 'hey you like cats, wanna read about a snow leopard?' It just might
> work, **but if it's search only then not a chance.**"
> — u/Fizzabl, r/nosurf, *"My biggest NoSurf discovery - the Wikipedia app"*, 2025-02-22

### 2.4 An account wall is now an active dealbreaker

> "**i'm literally just trying to give you four dollars. I do not want to enter a lifelong digital
> relationship with a piece of pavement.**
>
> Once I finally got in, the pop-ups started. 'Allow to send push notifications?' Absolutely not. Why
> would a parking meter need to send me a push notification? […]
>
> **its crazy that 'works in a normal web browser' has somehow become a luxury feature.**"
> — u/New_Fee_8735, r/digitalminimalism, *"I think I've reached the age where 'download our app' is an
> instant dealbreaker"*, 2026-08-11, **4,132 points, 99% upvoted, 154 comments**

The same appetite shows up as praise, in the Wikipedia thread:

> "Its entirely free, **you don't need to make an account or give them any personal info.**"
> — u/yuckscott, r/nosurf, 2025-02-22 (509 points)

### 2.5 Serendipity without the algorithm

> "I'd like to add **Cloudhiker**. Basically like stumble upon. **Brings back that feeling when the
> Internet felt vast in the 90s**"
> — u/Shawnanigans17, r/digitalminimalism, *"Replace addictive apps with these:"*, 2026-06-23

> "**I was looking for an information app. Like Facebook but information** and you have to pay a month
> subscription for all the options. Such a shame 😭"
> — u/Diana_Tramaine_420, same thread

### 2.6 The replacement problem — quitting leaves a hole nobody fills

> "I used to have a very bad relationship with my phone... usually hovered around 8 hours a day. Every
> time I tried to cut back my usage with a screen time blocker app, **I would end up staring at the
> wall like… okay now what, have the boredom be too painful and then delete the screen time blocker.**
> Deleting apps or blocking them worked for a bit, but the boredom always pulled me back."
> — u/SubstantialCarry7255, r/nosurf, *"The hardest part isn't quitting scrolling, it's knowing what to
> do instead"*, ~2025-10, **286 points, 63 comments**

---

## 3. What do people say they LOVED and then lost?

### 3.1 Pocket (shut down July 2025) — grief, and specifically for the *curated recommendations*

> "**I'm grieving.** I used this feature nearly every day and loved the Kobo integration that allowed
> me to read saved articles distraction-free on my Kobo e-ink devices. **It's the end of an era.**"
> — u/Kry0g3n1K, r/firefox, *"Mozilla: Pocket Is Shutting Down in July, Export Your Data Now"*,
> 2025-05-22, **1,541 points, 611 comments**

> "**I'm gutted. I love Pocket…**" — u/Ok_Mammoth_7303 (348 points, top comment)

> "noooooo. so shit. **all my saves that I thought I'd have forever**" — u/Thrillwaters (124 points)

> "that's true but in this case **one of the features they were selling was called 'permanent
> library'** 😬" — u/joeTaco

A year later, still mourning — and the thing missed is **the recommendation surface, not the save
button**:

> "For someone who loves to read articles on my phone, **life has been tough without the pocket app. I
> miss it everyday. The article recs were great too.** Why do yall need to shut down that app :("
> — u/Technical_State_8350, r/firefox, *"Can we bring back the POCKET app?"*, 2026-07-24

> "Pocket is shutting down and **I'm really gonna miss the suggested articles on the new tab.** Is
> there a list of publications that they used to use?"
> — u/RightPassage, r/firefox, 2025-10-07

**The counter-signal, which matters just as much:** Pocket lost people *before* it died, by adding
algorithmic recommendation on top of the simple job.

> "To be fair **it became less usable in recent years when it started placing a greater emphasis on
> algorithmic recommendations versus just allowing me to save the articles I want to read.** I used to
> be a subscriber but opted out because the UX kept getting worse and worse."
> — u/kit4d, r/firefox shutdown thread

### 3.2 The silent-majority lesson from Pocket's death

> "for years people have been complaining about Pocket and wanting it dropped, they overwhelmed the
> discourse here, and the Pocket appreciators very seldom spoke up […] **People speak up when they have
> something negative to express and don't speak up in support of their favorite features until they are
> gone.**"
> — u/redoubt515, r/firefox shutdown thread, 2025-05-22

### 3.3 Losing a feature inside a living app hurts the same way

> "One of the reflections I really miss doing was being able to reflect on one of my Journeys, but they
> removed this completely […] **At each Journey milestone there was a small suggestion to reflect on it
> and i found these to be some of my most meaningful reflections**, made me really stop and think about
> my progress […] Anyway yeah that one is gone sadly 😕"
> — u/deedeedeedee_, r/finch, 2025-12-19

> "I miss the journeys format so much. It was so much more inspiring and motivating **vs 'self care
> areas' which sounds corporate / work.**"
> — u/RealisticReception88, same thread

---

## 4. Where does "finite / it ends" get praised, and where does it frustrate?

### 4.1 Praised — overwhelmingly, and with a cadence that is *exactly* Antisocial's

> "Facebook and Instagram used to be this way. You scrolled for a couple minutes through only people
> you follow, and then **it would say you're all caught up. I miss that.**"
> — u/rosymaplemoth2513, r/digitalminimalism "no app is allowed to end", 2026-07-24,
> **186 points — the top comment on the thread**

> "Millenial here. That was actually a thing in the early days of social media. Heck, I remember when
> Tiktok actually had an 'end' to scrolling in the very early days of the app.
> **I actually miss this feature because I would just use it twice a day: morning, to catch up
> overnight, and evening, to catch up during the day.**"
> — u/accizzle, same thread (29 points)

> "Just a few days ago I talked to someone how awesome Twitter was back in the late 00s/early 10s. If
> you followed only 100-200 people, and you read it every or every other day, **you could actually
> finish reading your timeline. It was awesome.**"
> — u/LustyRegencyMaid, same thread (62 points)

> "This is why **RSS readers and E-ink devices feel like such a breath of fresh air, they actually let
> you reach the finish line**"
> — u/barroows, same thread

> "Try a subscription to the New York Times. You can scroll there through articles for a minute or two,
> but then you'll always arrive at a couple of recipes, Wirecutter recommendations, etc., **and then…
> the end. Ahhhhh.**"
> — u/l337__h4x0r, same thread

### 4.2 Where it frustrates — the honest counter-quote

Only one commenter in the whole thread named the discomfort of finishing, and it is the most
important line for Antisocial's closed-screen design:

> "**I remember getting to the 'you're all caught up' message in facebook and thinking 'wow, I need a
> hobby'.** Turns out those were the days…"
> — u/Traditional_Front817, same thread

The end of a finite feed **hands the user a moment of exposure**. Facebook's "all caught up" made
this person feel bad about themselves, not satisfied. The design question is whether the closing
screen absorbs that beat or leaves the user standing in it.

The same failure mode, stated from the other side:

> "Every time I tried to cut back my usage with a screen time blocker app, I would end up **staring at
> the wall like… okay now what**"
> — u/SubstantialCarry7255, r/nosurf, 286 points

### 4.3 "I finished it and wanted more" is a *satisfaction*, not a complaint — Wordle proves it

When a user asked whether Wordle should offer more than one puzzle a day, the community rejected the
idea outright, and the top answers explain *why* scarcity is the product:

> "There are tons or Wordle clones and similar word puzzles all over the internet. **If you are craving
> more than one word a day, give those a try. So with all that said, No, I don't think there is any
> reason to have more than one word a day on Wordle.**"
> — [deleted], r/wordle, *"Do You Think That Wordle Should've Added a Hard Mode or Should've Have Stayed
> With One Puzzle a Day"*, 2025-09-16 (8 points; the post itself sits at **27% upvoted** — the community
> disliked the question)

> "**Some people think Wordle is more like a daily warm-up game that trains their mind every morning. If
> there is more than one per day the game would not be famous anymore**, because it would never mean
> WOTD or people would instead go for the knockoffs"
> — u/Expensive_Dig_3149, same thread

> "There are a finite number of good Wordle words so this wouldn't be good"
> — u/joined_under_duress, same thread (4 points)

### 4.4 Finiteness that comes from *content shape* rather than a quota also works

> "It's not flashy, colorful, or designed to be addictive like everything else. It's dull, its reading.
> But that's the beauty of it. You can actually learn stuff and **it never feels like a waste of time,
> plus after maybe 30-60 minutes of reading I get bored and have a natural desire to move to something
> else.**"
> — u/yuckscott, r/nosurf, *"My biggest NoSurf discovery - the Wikipedia app"*, 2025-02-22,
> **509 points, 99% upvoted**

> "**At least it has an end. A Wikipedia article is not an endless scroll.** Reddit would be worse than
> that."
> — [deleted], same thread

---

## 5. What makes someone still open one of these on day 30?

### 5.1 An accumulating personal record — the thing you'd lose by stopping

> "edit 7/27/26: **it's been 6 years of using this app daily. it's great to look back over the years and
> see my mood patterns as well as what stuff i was getting up to.** it's like a diary in a way"
> — Niles, **Daylio**, Google Play, 2026-07-28

> "I've been using Daylio since 2018, logging entries multiple times each day […] It's been an
> incredibly useful tool across all that time, but, more than that, **I think it's the only app I use
> that truly improves with every update.** It has many more features than it did when I first got it,
> but each of them has slotted into its existing flows/interface in a considered, thoughtful way; **they
> never get in the way.** It's really wonderful."
> — Else, **Daylio**, Google Play, 2026-07-23

**Note the mechanism:** Daylio retains by *never getting in the way*, and by making the archive worth
more the longer you keep it. Not by streaks.

### 5.2 A small daily unit that slots into an existing routine

> "**The free daily Blinks are what got me hooked.**"
> — A Google user, **Blinkist**, Google Play, 2019-05-03

> "**I have really enjoyed my daily 'Blinks' for quite awhile now.**"
> — Keyna Quinn, **Blinkist**, Google Play, 2026-01-24

And the explicit frame of a daily slot with competition for it:

> "I will continue to keep the app installed for **the daily blink offered**, and perhaps it will grow
> on me. **It will be competing against many new apps for my daily routine… we'll see.**"
> — Norie Holley, **Blinkist**, Google Play, 2026-06-03

### 5.3 A single, legible behavioural change the user can name

> "I have used this app for a couple of years and have recommended it to others. **It helps me look up
> instead of down all the time.** The pause has been really helpful."
> — Michelle Stewart, **one sec**, Google Play, 2025-06-10

> "Every time I press an app mindlessly out of habit or boredom and opal blocks it I think '**oh good!
> opal is working**' and I remember to leave my phone alone for a while."
> — Anita Porter, **Opal**, Google Play, 2026-06-02 (29 found helpful)

### 5.4 Price that never re-enters your attention

> "I love the idea and it had almost immediate positive impacts on my screentime. **I also love the
> pricing model because it's set to a price almost everyone can afford and there's no annoying ads.**"
> — David Carlson, **one sec**, Google Play, 2024-11-16

### 5.5 The honest limit on "healthy replacement" retention

> "If you find Wikipedia reliably engaging enough that it can displace an unhealthy addiction, you will
> be immeasurably better off. **The problem is the 'reliably' part.** I have days when dipping a single
> toe in Wikipedia leads to an instant 3-hour binge, 50 open tabs and whatnot, **and days when the old
> brain cells just aren't up to the task and clamor for emptier calories.** So I don't think Wikipedia
> alone will always be able to scratch the true addict's itch. But it's worth trying."
> — u/duganp, r/nosurf, 2025-02-22 (42 points)

### 5.6 And the deepest retention warning in the corpus

> "**Blocking yourself from the Internet is only a bandaid.** […] Some of it worked temporarily, but I
> would invariably discover a way out of my own restrictions. When you're dependent, you'll find a way.
> […] **The source of this dependency, from my personal experience, is lack of connection** with the
> fundamental things that we need as human beings."
> — u/preetcolors, r/nosurf, *"'Don't block yourself from the internet' and other lessons from an
> experienced nosurfer"*, 2022-09-14, **768 points, 100% upvoted**

---

## 6. What do people find condescending or preachy?

This is where the deadpan voice earns its keep. Users are extremely sensitive to being handled.

### 6.1 Cute-voiced apology for real harm reads as contempt

> "I remember how condescending the words on my screen felt (**'Sorry for the inconvenience, your pet
> data got corrupted 🥺 But here are 5000 stones!'**). Quite frankly, this bug isn't taken seriously
> enough and **Finch's devs need to take care of it instead of talking to their users like they're
> children.**"
> — u/im_weird_and_insane, r/finch, *"Sorry but this is kind of unacceptable ?"*, 2026-07-14
> (**465 points**)

> "And I concur that **this is almost condescending** to think that 5k stones is an acceptable
> 'compensation' for losing your entire history and progress."
> — u/Ok-Plate-832, same thread

**The rule this implies:** whimsy in the copy is fine; whimsy *in place of* acknowledgement is what
gets called condescending. The tone must not do the work that substance should.

### 6.2 Unsolicited moral or spiritual content

> "**I dislike the addition of them adding Bible verses to the little messages that occur when you click
> on an app**, but that's just a personal thing."
> — Lee, **Opal**, Google Play, 2026-06-08 (17 found helpful)

> "The motivational quotes on the block screen are a nice touch (**though they get repetitive fast**)."
> — u/Dangerous-Project874, r/nosurf Opal thread, 2026-02-09 *(caveat applies)*

### 6.3 Being sold to inside a wellbeing app

> "AppBlock was so bare bones on the free tier that I spent more time being annoyed by upgrade prompts
> than I saved by blocking apps. Its like those free games where every 30 seconds theres an ad. **The
> irony of a focus app interrupting your focus to sell you something.**"
> — u/Dangerous-Project874, r/nosurf, 2026-02-12 *(caveat applies)*

> "Loved it initially, but **the constant premium upsells have pushed me to look for alternatives. I'm
> here to use your app, not be pestered into upgrading. If I'm sticking to free features, that's my
> choice. Respect it.**"
> — Gunnar Middleton, **Forest**, Google Play, 2026-05-27 (15 found helpful)

> "(paid user) **annoying amount of ads for their other products no matter how many times I dismiss
> them.** […] **cannot disable the endless steam of annoying achievement popups. I just want to log some
> information, not dismiss a bunch of dialogs and ads.**"
> — Justin Brown, **Daylio**, Google Play, 2026-08-30

### 6.4 Turning a private problem into a social scoreboard

> "The 'community' features feel forced. **Leaderboards for screen time? It turns a personal health
> issue into a competition. That's not helpful for most people.** It adds social pressure to something
> that should be about your own relationship with your phone."
> — u/Dangerous-Project874, r/nosurf Opal thread, 2026-02-09 *(caveat applies)*

### 6.5 The community itself has codified the anti-preachy norm

r/digitalminimalism (14 years old) has this as a **standing subreddit rule**:

> "**Lazy advice such as just use 'will power' and 'self-control' are not welcome here.** A better
> approach is to inform people how you developed those skills."
> — r/digitalminimalism sidebar rule 3

And when a poster gatekept meditation apps as spiritually inauthentic, the top reply (104 points, more
than the post itself) shut it down:

> "**it's not really anyone's role to decide for others what they ought to be doing unless and until they
> ask us directly. it's not our role to apply purity tests to things other people do**"
> — u/metaphorm, r/Meditation, *"Most meditation apps are probably not helping you meditate"*, 2026-01-20

### 6.6 One user's counter-example of what *doesn't* feel preachy

> "It can get a little pushy some times but **it never makes you feel bad for clicking 'no thanks'.**"
> — Gavin Krogstad, **Finch**, Google Play, 2026-03-06 (77 found helpful)

---

## 7. What do people say about paying?

### 7.1 There is a loud, organised "do not pay for this category" faction

> "**It shouldn't cost anything to use your phone less!** […] On one side you are battling trillionaire
> tech companies trying to get your attention, on the other side there's billionaire VC backed companies
> flexing their huge advertising budgets, claiming to have the antidote.
>
> Opal is $99/yr, $399. To use your phone less? Buggy experience, easy bypass. **I believe Opal is okay
> with 'kind-of' working so you blame your willpower and keep subscribing.**"
> — u/normal__engineering, r/digitalminimalism, *"PLEASE DO NOT PAY for screentime apps/blockers/OS!"*,
> 2026-08-14, 37 points, 97% upvoted

> "I think **MOST of the screentime apps are money grabs** though, people are struggling with screen
> addiction, and companies are taking advantage of that."
> — same author, in-thread

### 7.2 Subscription for a simple app is the specific trigger

> "**Works great but is ABSURDLY priced for such a simple app.** This app has pretty much one feature and
> does not need constant updates. No reason for it to be another subscription (and an expensive one).
> **A $5 maybe even $10 dollar purchase would be plenty generous. Having to pay $100 dollars to own it
> for life is a spat on the face.** Plenty of free alternatives out there too, because again, behind the
> cute ui and marketing, its such a simple app."
> — Joao C, **one sec**, Google Play, 2026-01-25

> "**$30 to use it for more than a single app? What a poor faith cash grab.** If the app isn't free, then
> don't make it free. […] $5 would be reasonable. A free version limited to like 10 apps would be
> reasonable. $30 is simply egregious."
> — Jesten Herrild, **one sec**, Google Play, 2024-12-29

> "The more basic tasks (the ones I would like motivation to do) are locked behind a paywall. **A $10 a
> month subscription! That's crazy expensive!** […] **I wish the paywall wasn't there, or maybe if it was
> a one time purchase, I would do that.** I feel like the makers of this app are too greedy"
> — Shy (ShinraSan23), **Finch**, Google Play, 2024-12-18 — **1,650 people found this helpful**, the
> single most-endorsed review on the Finch listing

### 7.3 Regional price discrimination is a trust event, not a pricing detail

> "I don't understand why IOS users are allowed to only have to pay 14.99 for a year's subscription, as
> where Android users have to pay 69.99 for a year. That's an incredible difference in pricing, and an
> extremely unfair one at that. It's a cute app, but, **I can't support something that rips it's users off
> so badly depending on their device.**"
> — Samantha Whitman, **Finch**, Google Play, 2025-04-05 (**1,234 found helpful**)

### 7.4 But people *do* pay — for a small daily unit, or a one-time price, or an obvious time trade

> "I pay for premium **because I figure the time it saves me is worth the couple dollars a month.**"
> — Danica West, **one sec**, Google Play, 2025-07-07 (15 found helpful)

> "**its only $11 to get all of what the app has to offer and it is a LOT.**"
> — Ren Sullivan, **Daylio**, Google Play, 2026-07-29

> "They have a subscription and lifetime pass you can buy, **but you don't have to to get the entire
> experience.** All it really adds is some more personalization options […] **I recommend this app to all
> of my friends and family, and want to get the sub just to support the company!**"
> — Andrew Mkrtchyan, **Daylio**, Google Play, 2026-06-09

> "Try out the **Bloom Card**. **it costs like $35 (one time payment)**, but honestly it is a game changer."
> — u/Electronic_Drag_492, r/nosurf, 2026-02

### 7.5 The Blinkist lesson: a free daily unit converts; a hard wall repels

> "**The free version is great - one can get the summary of one curated book each day.** Though $80 / year
> is a great price for access to so many book summaries."
> — Katherine Knutson, **Blinkist**, Google Play, 2023-01-20 (124 found helpful)

> "**Every single 'blink', book summary, whatever you want to call it is locked behind a subscription.
> Having some of them be free, with ads for example, would get a lot more users** (myself included) using
> the app. At which point you could at least try and convert them to 'premium' accounts instead of losing
> them all together because they uninstall it like I'm about to."
> — Sean Piercy, **Blinkist**, Google Play, 2025-09-11 (**170 found helpful**)

> "Useless without signing up. Way too expensive. I do not want to sign up for high monthly fee to
> experience the 'free' trial. […] **The onboarding process was like grinding teeth. Forced me to pick
> categories etc, many MANY pop-ups. By the time I could even get to the main view it felt like I was
> buying a car with the amount of forms. NO.**"
> — David Vogel, **Blinkist**, Google Play, 2025-09-15 (120 found helpful)

---

## Validation signals: complaints about mechanics Antisocial deliberately does NOT have

Worth calling out separately, because each of these is a documented churn cause that Antisocial's
architecture makes structurally impossible.

| Mechanic Antisocial lacks | User complaint about it |
|---|---|
| **Streaks** | "i stopped using the app about four days ago. **I lost a 401 day streak.**" — r/finch, 2,847 pts · "**Streak died at 3,068 days**" — r/NYTCrossword, 2026-07-22 · "I wrote them a message asking for **streaks to be made optional**" — u/sciecne, r/finch |
| **Notifications** | "'Allow to send push notifications?' **Absolutely not. Why would a parking meter need to send me a push notification?**" — r/digitalminimalism, 4,132 pts · Flora "wore off in about 3 days… **then its just another notification on your screen**" — r/nosurf |
| **Accounts / cloud state** | "You shouldn't need a daily chore list just to keep your self-care app from deleting itself" — r/finch, 1,685 pts · "**I do not want to enter a lifelong digital relationship with a piece of pavement**" — r/digitalminimalism, 4,132 pts |
| **Social graph / leaderboards** | "**Leaderboards for screen time? It turns a personal health issue into a competition.**" — r/nosurf |
| **Infinite feed** | "There's no 'you're done for today' — **being done is treated as a failure state**" — r/digitalminimalism, 263 pts |
| **Stats dashboards** | "**I am still on my phone right now looking at a graph about being on my phone**" — r/nosurf · "the weekly average numbers… **KEEP CHANGING**… my trust is now fully gone" — Opal, Play |
| **Subscription** | "**It shouldn't cost anything to use your phone less!**" — r/digitalminimalism · "$100 dollars to own it for life **is a spat on the face**" — one sec, Play |

---

## What this implies for a finite curiosity feed

1. **The core thesis is a stated, unmet demand — not a hypothesis.** Ship the "it ends" as the
   headline promise, not as a constraint you apologise for. *"Has anyone found digital things that are
   deliberately finishable? Not 'use less of an infinite app,' but experiences designed to end."*
   (r/digitalminimalism, 263 pts, zero product answers in 38 comments.)

2. **Twice a day is the cadence users nostalgically describe, not once.** Build the two-slate rhythm
   deliberately and say so: *"I would just use it twice a day: morning, to catch up overnight, and
   evening, to catch up during the day."* (u/accizzle)

3. **The closing screen is the highest-risk surface in the product.** Running out of content can land
   as relief or as indictment: *"I remember getting to the 'you're all caught up' message in facebook
   and thinking 'wow, I need a hobby'."* (u/Traditional_Front817) The end-of-day card must close the
   loop, not hand the user an empty room.

4. **Antisocial does not have to survive habituation — and that is its structural advantage over the
   entire blocker category.** Friction products die on a ten-day clock: *"after about 10 days my brain
   just automated the pause. Breathe in, breathe out, open app."* A slate that ends has nothing to
   wait out.

5. **Do not add a search box; do the choosing.** The target user is explicit that deciding is the part
   they're fleeing: *"A lot of my scrolling comes from not wanting to think or decide anything… but if
   it's search only then not a chance."* (u/Fizzabl)

6. **No account is a feature to advertise, not a limitation to hide.** Both the loudest complaint
   (4,132 pts on the parking-app account wall) and the loudest praise (*"you don't need to make an
   account or give them any personal info"*, 509 pts on Wikipedia) point the same way.

7. **Guard against the drift that killed the incumbents' loyalty.** Every app in this sample lost its
   best users by growing: *"it's like a glorified to-do list instead of a mental health app"* (Finch,
   2,847 pts); *"they lost their way… now it's got all sorts of sales in it"* (Insight Timer);
   *"they seem to have shifted focus from reading to listening"* (Blinkist). Feature restraint is
   retention.

8. **Never inflate a number.** One user recalculated Opal's stats by hand and left: *"they KEEP
   CHANGING… my trust is now fully gone."* If Antisocial ever shows a count, it must be one the user
   could verify themselves.

9. **Deadpan works, but never in place of acknowledgement.** The condescension charge lands on cute
   copy that substitutes for substance: *"'Sorry for the inconvenience, your pet data got corrupted 🥺
   But here are 5000 stones!' … talking to their users like they're children."* (465 pts) And keep
   the voice free of moralising: *"I dislike the addition of them adding Bible verses."* (Opal, Play)

10. **Price it as a one-time purchase or a free daily unit, not a subscription.** The most-endorsed
    review across every listing sampled is a subscription complaint (Finch, 1,650 helpful:
    *"I wish the paywall wasn't there, or maybe if it was a one time purchase, I would do that"*),
    and Blinkist's own converts credit the free daily item: *"The free daily Blinks are what got me
    hooked."* People will pay $11–$35 once; they resent $99/yr for something simple.

11. **Retention will come from an accumulating record and from staying out of the way — not from
    hooks.** *"it's the only app I use that truly improves with every update… they never get in the
    way"* (Daylio, 6-year user). Whatever Antisocial keeps for the user should get more valuable the
    longer they have it, without ever demanding attention to maintain it.

12. **Set expectations honestly: this replaces some scrolling, not all of it.** The most credible
    long-term user in the corpus says so plainly: *"I have days when dipping a single toe in Wikipedia
    leads to an instant 3-hour binge… and days when the old brain cells just aren't up to the task and
    clamor for emptier calories."* A product that promises to be *one good thing you finish*, rather
    than a cure, will outlive the ones that overpromise — and it matches the "install the app you'll
    hopefully stop using" posture already.

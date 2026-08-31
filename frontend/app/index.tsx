import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import Text from '../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import components
import FastWeirdCard from '../components/FastWeirdCard';
import FastWeirdStageCard from '../components/FastWeirdStageCard';
import ExplainerStageCard from '../components/ExplainerStageCard';
import MiniGameStageCard from '../components/MiniGameStageCard';

// Design finalized 2026-08-31: every card follows the classic structure —
// icon + label header, left-aligned heading, tags where the type has them
// (the Gentle Reminder alone keeps an illustration, and carries no tags).
// The centred "stage" experiments are retired; the set stays only so a
// stage component can be re-auditioned by naming its type here.
const STAGE_PREVIEW_TYPES = new Set<string>([]);
import ExplainerCard from '../components/ExplainerCard';
import PonderCard from '../components/PonderCard';
import IncidentCard from '../components/IncidentCard';
import MiniGameCard from '../components/MiniGameCard';
import AudioDriftCard from '../components/AudioDriftCard';
import VideoCard from '../components/VideoCard';
import AlmostNothingCard from '../components/AlmostNothingCard';
import QuietContradictionCard from '../components/QuietContradictionCard';
import ShareableCard from '../components/ShareableCard';
import GameCard from '../components/GameCard';
import GuestbookCard from '../components/GuestbookCard';
import NotebookCard from '../components/NotebookCard';
import TryThisCard from '../components/TryThisCard';
import LookCloserCard from '../components/LookCloserCard';
import MissionCard from '../components/MissionCard';
import { GAMES } from '../data/games';
import { WRITING_PROMPTS } from '../data/writingPrompts';
import { pickPrompt } from '../lib/notebook';
import { MISSIONS } from '../data/missions';
import { cards, colors, type } from '../lib/theme';
import { addMinute, minutesUsedToday, DAILY_LIMIT_MINUTES } from '../lib/usage';
import { hasSessionsLeftToday, consumeSession } from '../lib/quota';
import { getSeenIds, markSeen } from '../lib/seen';
import { isOnboardingComplete } from '../lib/onboarding';
import { recordSession, recordLeftEarly, dueRecap, markRecapShown } from '../lib/weekLedger';
import WeekRecapCard from '../components/WeekRecapCard';
import SessionChrome from '../components/SessionChrome';
import { DeckAdvanceContext } from '../components/DeckContext';
import { sessionsUsedToday, MAX_SESSIONS_PER_DAY } from '../lib/quota';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// PRD Constants
const BODY_AWARE_INTERRUPTIONS = [
  "Notice where your shoulders are.",
  "When was the last time you drank water?",
  "Time passed while you were here.",
  "Check the tension in your jaw.",
  "Feel the weight of the device in your hands.",
  "Take a single, intentional breath.",
  "Blink. Properly, this time.",
  "Look at the farthest thing you can see.",
  "Notice which hand is holding the phone.",
  "Your feet are somewhere. Find them."
];

// Terminal screens. The museum closes; there is deliberately no button that
// reopens it. Each pool is drawn from at the moment of closing so the line
// varies day to day — a repeated line stops landing by Thursday. Voice rule
// for every pool here: irony by understatement only; if a line sounds like
// it knows it's funny, it doesn't ship.
type ClosedScreen = {
  icon: 'moon-outline' | 'walk-outline';
  title: string;
  subtext: string;
};

const pick = <T,>(pool: readonly T[]): T =>
  pool[Math.floor(Math.random() * pool.length)];

const CAUGHT_UP_SCREENS: readonly ClosedScreen[] = [
  { icon: 'moon-outline', title: 'The museum is closed for today.', subtext: 'New exhibits tomorrow.' },
  { icon: 'moon-outline', title: 'You’ve seen today’s collection.', subtext: 'The rest of the world is still open.' },
  { icon: 'moon-outline', title: 'The doors are locked. Nothing personal.', subtext: 'Tomorrow there will be more.' },
  { icon: 'moon-outline', title: 'That was everything.', subtext: 'More arrives overnight.' },
  { icon: 'moon-outline', title: 'Closed. Even the curators went home.', subtext: 'Come back tomorrow.' },
  { icon: 'moon-outline', title: 'The museum is closed.', subtext: 'It will manage without you.' },
  { icon: 'moon-outline', title: 'Nothing left to see today.', subtext: 'That was always the arrangement.' },
  { icon: 'moon-outline', title: 'The lights are off.', subtext: 'The exhibits need their rest.' },
];

// Rarely seen (requires idling three hours in one day), so a smaller pool —
// eight variants would outnumber sightings.
const TIME_UP_SCREENS: readonly ClosedScreen[] = [
  { icon: 'moon-outline', title: 'Three hours. The benches are worn.', subtext: 'The museum reopens tomorrow.' },
  { icon: 'moon-outline', title: 'That’s enough for today.', subtext: 'Even museums close.' },
  { icon: 'moon-outline', title: 'You’ve been here a while.', subtext: 'The exit is well marked.' },
  { icon: 'moon-outline', title: 'The staff have gone home.', subtext: 'You should too.' },
];

// The success state — leaving is the point, so this is the voice at its
// warmest, which for this museum means faint approval.
const LEFT_SCREENS: readonly ClosedScreen[] = [
  { icon: 'walk-outline', title: 'You left before closing time.', subtext: 'The museum approves.' },
  { icon: 'walk-outline', title: 'Gone before the doors shut.', subtext: 'That’s the idea.' },
  { icon: 'walk-outline', title: 'An intentional exit.', subtext: 'Rare. Noted.' },
  { icon: 'walk-outline', title: 'You chose to leave.', subtext: 'The exhibits will keep.' },
  { icon: 'walk-outline', title: 'You walked out on your own.', subtext: 'The best way to leave.' },
  { icon: 'walk-outline', title: 'Left with time to spare.', subtext: 'Spend it somewhere real.' },
];

const FINAL_SESSION_MESSAGES = [
  'That’s everything for today. The museum reopens tomorrow.',
  'The collection ends here. Tomorrow it grows back.',
  'You’ve reached the last room.',
  'Nothing else today. That’s deliberate.',
  'The wall you just hit was built on purpose.',
  'No more rooms today. The door out is right there.',
  'That’s the whole museum. Come back tomorrow.',
  'End of the collection. The rest of the day is yours.',
];

const END_SESSION_CARDS = [
  'That’s enough input for now.',
  'Some things don’t improve with more information.',
  'There’s nothing new here right now.',
  'You’ve wandered far enough for this session.',
  'A good museum visit is a short one.',
  'This is a natural place to stop.',
  'Whatever you were looking for, it isn’t further down.',
  'The exhibits thin out past this point.',
];

interface ContentItem {
  id: string;
  type: string;
  [key: string]: any;
}

export default function Index() {
  const router = useRouter();
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [endSessionMessage, setEndSessionMessage] = useState('');
  const [finalSessionMessage, setFinalSessionMessage] = useState('');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [closed, setClosed] = useState<ClosedScreen | null>(null);
  const [driftLeft, setDriftLeft] = useState(false);
  // TRIAL (vertical deck): the feed is a vertical pager — one full-screen
  // card at a time, swipe up for the next — so the feed keeps the familiar
  // up-and-down motion but never shows two cards at once. "Where am I" is a
  // page index rather than a scroll offset. Pages snap by the deck's
  // measured height (the space between the chrome and the screen bottom),
  // which only exists after first layout, so pages render once it is known.
  const [page, setPage] = useState(0);
  const [deckHeight, setDeckHeight] = useState(0);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [minutesToday, setMinutesToday] = useState(0);
  const pagerRef = useRef<ScrollView>(null);

  // The chrome's numbers come from the same stores the quota already uses,
  // so the header can't drift from what the app actually enforces.
  useEffect(() => {
    let alive = true;
    Promise.all([sessionsUsedToday(), minutesUsedToday()]).then(([used, mins]) => {
      if (!alive) return;
      setSessionNumber(Math.min(Math.max(used, 1), MAX_SESSIONS_PER_DAY));
      setMinutesToday(mins);
    }).catch(() => {});
    return () => { alive = false; };
  }, [feed.length]);
  const lastGameId = useRef<string | null>(null);
  const lastMissionId = useRef<string | null>(null);
  const fetchInFlight = useRef(false);
  const didInit = useRef(false);

  // What a card would be called if you retold it — the label the
  // guestbook shows. Types with nothing quotable return null and stay
  // out of the guestbook list.
  const cardTitle = (item: ContentItem): string | null => {
    switch (item.type) {
      case 'fast_weird': return item.headline ?? null;
      case 'explainer':
      case 'ponder': return item.question ?? null;
      case 'incident': return item.hook ?? null;
      case 'mini_game': return item.prompt ?? null;
      case 'audio_drift':
      case 'video': return item.title ?? null;
      case 'almost_nothing': return (item.text ?? '').trim().split('\n')[0] || null;
      case 'try_this': return item.title ?? null;
      case 'look_closer': return item.answer ?? null;
      case 'quiet_contradiction': return item.statement1 ?? null;
      default: return null;
    }
  };

  // Generate body aware insertion indices (every 6-10 items)
  const generateInsertionIndices = (totalItems: number) => {
    let indices = [];
    let current = Math.floor(Math.random() * 5) + 6; // random between 6 and 10
    while (current < totalItems) {
      indices.push(current);
      current += Math.floor(Math.random() * 5) + 6;
    }
    return indices;
  };

  // One game rides in the feed like any other card, dropped a few items
  // down the scroll — the session's playable ANCHOR (spec item 2), framed
  // as a bounded arc with a natural end. Never the same game twice in a
  // row; the last anchor is persisted so the rotation survives app
  // restarts instead of resetting with the in-memory ref.
  const insertGameCard = async (items: ContentItem[]) => {
    let lastId = lastGameId.current;
    try {
      lastId = (await AsyncStorage.getItem('last_anchor_game')) ?? lastId;
    } catch {
      // Unreadable flag: fall back to the in-memory ref.
    }
    const candidates = GAMES.filter((g) => g.id !== lastId);
    const pool = candidates.length > 0 ? candidates : GAMES;
    const game = pool[Math.floor(Math.random() * pool.length)];
    lastGameId.current = game.id;
    AsyncStorage.setItem('last_anchor_game', game.id).catch(() => {});

    const withGame = [...items];
    const index = Math.min(
      Math.floor(Math.random() * 3) + 2, // 2, 3 or 4
      withGame.length
    );
    withGame.splice(index, 0, {
      id: `game-${game.id}-${Date.now()}`,
      type: 'game',
      game,
      anchor: true,
    });

    return withGame;
  };

  // The Field Trip rides at the very end of the session — appended after
  // the interruptions are placed, so nothing can splice in behind it. The
  // last card before the museum closes is a reason to leave it.
  const appendMissionCard = (items: ContentItem[]) => {
    const candidates = MISSIONS.filter((m) => m.id !== lastMissionId.current);
    const mission = candidates[Math.floor(Math.random() * candidates.length)];
    lastMissionId.current = mission.id;

    return [
      ...items,
      {
        id: `mission-${mission.id}-${Date.now()}`,
        type: 'mission',
        mission,
      },
    ];
  };

  // Fetch feed on mount, unless today's boundary has already been reached.
  useEffect(() => {
    // Guard against double-invoked effects (StrictMode / Fast Refresh)
    // consuming two sessions for one visit.
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      // A first visit goes to the opening screens before anything else — and
      // specifically before fetchFeed(), which consumes one of the day's two
      // sessions. Checking after the fetch would spend a session on a feed the
      // visitor is about to be redirected away from and never sees.
      // `loading` stays true through the redirect, so the feed never flashes.
      if (!(await isOnboardingComplete())) {
        router.replace('/onboarding');
        return;
      }

      const used = await minutesUsedToday();
      if (used >= DAILY_LIMIT_MINUTES) {
        setClosed(pick(TIME_UP_SCREENS));
        setLoading(false);
        return;
      }
      fetchFeed();
    })();

    // Track usage time every minute
    const interval = setInterval(async () => {
      const { minutes, rolledOver } = await addMinute();

      // A session running past midnight gets its day back rather than
      // staying locked out until the app is restarted.
      if (rolledOver) {
        setClosed(null);
        return;
      }

      if (minutes >= DAILY_LIMIT_MINUTES) {
        setClosed(pick(TIME_UP_SCREENS));
        setFeed([]);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    try {
      // The daily quota gates every path here — mount, drift, retry and
      // refresh — so no button can serve a session the day no longer has.
      if (!(await hasSessionsLeftToday())) {
        setClosed(pick(CAUGHT_UP_SCREENS));
        setFeed([]);
        setError('');
        return;
      }

      setSessionCompleted(false);
      // Determine session size (9-12 items as per PRD)
      const sessionSize = Math.floor(Math.random() * 4) + 9;

      // The seen ledger travels in the body, not the query string: a week of
      // ids runs to several kilobytes, past what is safe in a URL.
      const response = await fetch(`${BACKEND_URL}/api/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: sessionSize, seen: await getSeenIds() }),
      });
      const data = await response.json();

      if (data.success) {
        // We only want `sessionSize` number of items for this session
        let sessionItems = data.feed.slice(0, sessionSize);

        // TEMP (redesign/paper-swipe): force a Gentle Reminder to the front so
        // the staged-card treatment can be checked on screen. Remove before merge.
        if (!sessionItems.some((i: ContentItem) => i.type === 'almost_nothing')) {
          const gentle = data.feed.find((i: ContentItem) => i.type === 'almost_nothing');
          if (gentle) sessionItems = [gentle, ...sessionItems.slice(0, sessionSize - 1)];
        } else {
          sessionItems.sort((a: ContentItem, b: ContentItem) =>
            (b.type === 'almost_nothing' ? 1 : 0) - (a.type === 'almost_nothing' ? 1 : 0));
        }

        // An empty fetch must not burn quota — show the empty state instead.
        if (sessionItems.length === 0) {
          setFeed([]);
          setError('');
          return;
        }
        await consumeSession();
        // Spend only the cards that reach the screen. The slate holds 35 and
        // this session shows 9-12; marking the whole slate would burn three
        // sessions of content for one session's worth of reading.
        await markSeen(sessionItems.map((item: ContentItem) => item.id));
        await recordSession(sessionItems.length);
        setDriftLeft(await hasSessionsLeftToday());

        // The guestbook needs the session's content cards before games
        // and interruptions are spliced among them.
        const guestbookItems = sessionItems
          .map((i: ContentItem) => ({ id: i.id, type: i.type, title: cardTitle(i) }))
          .filter((i: any): i is { id: string; type: string; title: string } => !!i.title);

        // Drop a game into the scroll as the session's playable anchor
        sessionItems = await insertGameCard(sessionItems);

        // One writing card rides mid-slate: a specific prompt, two or
        // three lines, kept locally. Prompt rotation avoids repeats
        // within about a week of sessions.
        const writingPrompt = await pickPrompt(WRITING_PROMPTS);
        sessionItems.splice(
          Math.min(Math.floor(Math.random() * 3) + 5, sessionItems.length), // 5, 6 or 7
          0,
          {
            id: `notebook-${writingPrompt.id}-${Date.now()}`,
            type: 'notebook',
            promptId: writingPrompt.id,
            prompt: writingPrompt.prompt,
          }
        );

        // Insert Body-Aware interruptions
        const indices = generateInsertionIndices(sessionItems.length);
        indices.reverse().forEach((index: number) => {
           const randomInterruption = BODY_AWARE_INTERRUPTIONS[Math.floor(Math.random() * BODY_AWARE_INTERRUPTIONS.length)];
           sessionItems.splice(index, 0, {
             id: `interruption-${Date.now()}-${index}`,
             type: 'body_aware_interruption',
             text: randomInterruption
           });
        });

        // The guestbook closes the session, just ahead of the exit ramp:
        // name the one card you'd actually retell.
        if (guestbookItems.length > 0) {
          sessionItems.push({
            id: `guestbook-${Date.now()}`,
            type: 'guestbook',
            items: guestbookItems,
          });
        }

        // The exit ramp goes on last
        sessionItems = appendMissionCard(sessionItems);

        // Last week's recap rides in once, near the top of the first
        // session of a new week — whichever day that turns out to be.
        const recap = await dueRecap();
        if (recap) {
          sessionItems.splice(Math.min(1, sessionItems.length), 0, {
            id: `week-recap-${recap.weekStart}`,
            type: 'week_recap',
            recap,
          });
          await markRecapShown(recap.weekStart);
        }

        setFeed(sessionItems);
        setError('');
        setClosed(null);

        setEndSessionMessage(pick(END_SESSION_CARDS));
        setFinalSessionMessage(pick(FINAL_SESSION_MESSAGES));
      } else {
        setError('The exhibits didn’t arrive.');
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
      setError('The museum isn’t answering.');
    } finally {
      fetchInFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  // Shareable card types get wrapped so their header shows a share icon
  // that exports the card as a branded image. Video capture is unreliable
  // (embedded iframes), so video cards stay unwrapped.
  const shareableCardFor = (item: ContentItem): React.ReactNode | null => {
    switch (item.type) {
      case 'fast_weird':
        return STAGE_PREVIEW_TYPES.has('fast_weird')
          ? <FastWeirdStageCard content={item as any} />
          : <FastWeirdCard content={item as any} />;
      case 'explainer':
        return STAGE_PREVIEW_TYPES.has('explainer')
          ? <ExplainerStageCard content={item as any} />
          : <ExplainerCard content={item as any} />;
      case 'ponder':
        return <PonderCard content={item as any} />;
      case 'incident':
        return <IncidentCard content={item as any} />;
      case 'mini_game':
        return STAGE_PREVIEW_TYPES.has('mini_game')
          ? <MiniGameStageCard content={item as any} />
          : <MiniGameCard content={item as any} />;
      case 'audio_drift':
        return <AudioDriftCard content={item as any} />;
      case 'almost_nothing':
        return <AlmostNothingCard content={item as any} />;
      case 'quiet_contradiction':
        return <QuietContradictionCard content={item as any} />;
      default:
        return null;
    }
  };

  const renderContentCard = (item: ContentItem, fill = false) => {
    const shareable = shareableCardFor(item);
    if (shareable) {
      return (
        <ShareableCard key={item.id} shareName={`modern-weirdness-${item.type}`} fill={fill}>
          {shareable}
        </ShareableCard>
      );
    }
    switch (item.type) {
      case 'game':
        return <GameCard key={item.id} game={item.game} anchor={!!item.anchor} />;
      case 'try_this':
        return <TryThisCard key={item.id} content={item as any} />;
      case 'look_closer':
        return <LookCloserCard key={item.id} content={item as any} />;
      case 'notebook':
        return (
          <NotebookCard key={item.id} promptId={item.promptId} prompt={item.prompt} />
        );
      case 'guestbook':
        return <GuestbookCard key={item.id} items={item.items} />;
      case 'mission':
        return <MissionCard key={item.id} mission={item.mission} />;
      case 'week_recap':
        return (
          <ShareableCard key={item.id} shareName="modern-weirdness-week">
            <WeekRecapCard recap={item.recap} />
          </ShareableCard>
        );
      case 'video':
        return <VideoCard key={item.id} content={item as any} />;
      case 'body_aware_interruption':
        return (
          <View key={item.id} style={styles.interruptionContainer}>
            <Text style={styles.interruptionText}>{item.text}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Reaching the last page is what ends the session now. On the vertical
  // build this was "scrolled to the bottom of a long list"; the swipe deck
  // has no bottom, so the final page is the boundary instead.
  const pageCount = feed.length + 1;

  const goToPage = (i: number) => {
    const next = Math.max(0, Math.min(i, pageCount - 1));
    pagerRef.current?.scrollTo({ y: next * deckHeight, animated: true });
    setPage(next);
    if (next >= pageCount - 1 && !sessionCompleted) setSessionCompleted(true);
  };

  const handlePageSettle = (event: any) => {
    if (!deckHeight) return;
    const i = Math.round(event.nativeEvent.contentOffset.y / deckHeight);
    if (i !== page) setPage(i);
    if (i >= pageCount - 1 && !sessionCompleted) setSessionCompleted(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={colors.muted} />
        <Text style={styles.loadingText}>Opening the museum…</Text>
      </View>
    );
  }

  if (closed) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="dark" />
        <Ionicons name={closed.icon} size={40} color={colors.muted} />
        <Text style={styles.closedTitle}>{closed.title}</Text>
        <Text style={styles.closedSubtext}>{closed.subtext}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFeed}>
          <Text style={styles.retryButtonText}>Knock again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {feed.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.feedContainer}
          refreshControl={
            // Pull-to-refresh is a recovery gesture for the empty state
            // only. On a loaded session it would be the infinite-refresh
            // habit this feed exists to end.
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.muted}
              colors={[colors.muted]}
            />
          }
        >
          <View style={styles.emptyState}>
            <Ionicons name="telescope-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>The rooms are empty.</Text>
            <Text style={styles.emptySubtext}>Pull down to check again.</Text>
          </View>
        </ScrollView>
      ) : (
        <>
          <SessionChrome
            sessionNumber={sessionNumber}
            totalSessions={MAX_SESSIONS_PER_DAY}
            minutesToday={minutesToday}
            index={page}
            count={pageCount}
            onPrev={() => goToPage(page - 1)}
            onNext={() => goToPage(page + 1)}
          />

          {/* One card per page. The deck snaps vertically — swipe up for
              the next card. Every page is exactly one deck-height tall, so
              the snap always lands on a whole card; anything that doesn't
              fit scrolls inside its own page or card, never the deck. */}
          <ScrollView
            ref={pagerRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handlePageSettle}
            scrollEventThrottle={16}
            style={styles.pager}
            // The deck's own height is the page size the snap needs.
            onLayout={(e) => setDeckHeight(e.nativeEvent.layout.height)}
            contentContainerStyle={styles.pagerContent}
          >
            {deckHeight > 0 && feed.map((item, i) => (
              // Every page is the same now: the card, top-anchored, in the
              // classic structure. A card taller than its page scrolls
              // inside the page; the deck itself only ever snaps. The
              // advance context lets a card's completion button (CardAction)
              // move the deck on without prop-drilling through every card.
              <View key={item.id} style={{ width: '100%', height: deckHeight }}>
                <DeckAdvanceContext.Provider value={() => goToPage(i + 1)}>
                  <ScrollView
                    contentContainerStyle={styles.pageInner}
                    showsVerticalScrollIndicator={false}
                  >
                    {renderContentCard(item, false)}
                  </ScrollView>
                </DeckAdvanceContext.Provider>
              </View>
            ))}

            {/* End of session — the last page rather than a trailing card */}
            {deckHeight > 0 && (
            <View style={{ width: '100%', height: deckHeight }}>
              <ScrollView
                contentContainerStyle={styles.pageInner}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.endSessionCard}>
                  <Text style={styles.endSessionText}>
                    {driftLeft ? endSessionMessage : finalSessionMessage}
                  </Text>

                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={() => {
                      // Leaving with a drift still available is the early
                      // exit worth counting; leaving at the final card is
                      // just the museum closing.
                      if (driftLeft) recordLeftEarly();
                      setClosed(pick(LEFT_SCREENS));
                      setFeed([]);
                    }}
                  >
                    <Text style={styles.leaveButtonText}>Leave</Text>
                  </TouchableOpacity>

                  {driftLeft && (
                    <TouchableOpacity style={styles.driftButton} onPress={fetchFeed}>
                      <Text style={styles.driftButtonText}>Drift a little longer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  // Each page carries the card's own margin, so the deck itself needs no
  // padding — a page has to be exactly one deck-height tall for the
  // vertical snap to land on whole cards.
  // Top-aligned, not centred: card heights vary a lot across types, and
  // centring makes each one sit at a different height, so the card appears
  // to jump as you swipe. Anchored to the top, only the bottom edge moves.
  pageInner: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingText: {
    ...type.micro,
    marginTop: 16,
  },
  errorText: {
    ...type.body,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 11,
    backgroundColor: colors.ink,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    ...type.title,
    marginTop: 16,
  },
  emptySubtext: {
    ...type.micro,
    marginTop: 8,
  },
  closedTitle: {
    ...type.title,
    marginTop: 16,
    textAlign: 'center',
  },
  closedSubtext: {
    ...type.micro,
    marginTop: 8,
    textAlign: 'center',
  },
  interruptionContainer: {
    paddingVertical: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interruptionText: {
    fontSize: 16,
    color: colors.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  endSessionCard: {
    ...cards.white,
    padding: 32,
    marginBottom: 0,
    alignItems: 'center',
  },
  endSessionText: {
    ...type.title,
    textAlign: 'center',
    marginBottom: 32,
  },
  // Primary action, per the Tailwind spec: solid ink, rounded-xl, py-3,
  // medium weight. No high-contrast hover — it grounds the action.
  leaveButton: {
    backgroundColor: colors.ink,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.surface,
  },
  // Secondary: quiet outline, the same shape as the reflection tags.
  driftButton: {
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  driftButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.body,
  },
});

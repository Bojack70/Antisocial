import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import FastWeirdCard from '../../components/FastWeirdCard';
import ExplainerCard from '../../components/ExplainerCard';
import PonderCard from '../../components/PonderCard';
import IncidentCard from '../../components/IncidentCard';
import MiniGameCard from '../../components/MiniGameCard';
import AudioDriftCard from '../../components/AudioDriftCard';
import VideoCard from '../../components/VideoCard';
import AlmostNothingCard from '../../components/AlmostNothingCard';
import QuietContradictionCard from '../../components/QuietContradictionCard';
import ShareableCard from '../../components/ShareableCard';
import GameCard from '../../components/GameCard';
import GuestbookCard from '../../components/GuestbookCard';
import NotebookCard from '../../components/NotebookCard';
import TryThisCard from '../../components/TryThisCard';
import LookCloserCard from '../../components/LookCloserCard';
import MissionCard from '../../components/MissionCard';
import WeekRecapCard from '../../components/WeekRecapCard';
import SessionChrome from '../../components/SessionChrome';
import BodyAwareInterruption from '../../components/BodyAwareInterruption';
import BeforeYouWatchCard from '../../components/BeforeYouWatchCard';
import IllusionCard from '../../components/IllusionCard';
import { DeckAdvanceContext } from '../../components/DeckContext';
import { GAMES } from '../../data/games';
import { WRITING_PROMPTS } from '../../data/writingPrompts';
import { MISSIONS } from '../../data/missions';
import { colors, type } from '../../lib/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// PROTOTYPE DATA — three hand-verified examples for the Before You Watch
// card. Frames are `hq2.jpg` (a still from the middle of the clip), never
// `thumbnail_url`: YouTube thumbnails have the title painted across them.
// Decoys are real titles from other videos in the corpus, so nobody has to
// write plausible wrong answers.
const BEFORE_YOU_WATCH_SAMPLES = [
  {
    id: '8hgEorF0vyY',
    frame_url: 'https://i.ytimg.com/vi/8hgEorF0vyY/hq2.jpg',
    answer: 'How exactly do inhalers work?',
    decoys: ['What Do We Really Breathe In?', 'What the Flu Does to Your Body'],
    channel_title: 'TED-Ed',
    duration: 280,
  },
  {
    id: 'Fv1JJ227CQk',
    frame_url: 'https://i.ytimg.com/vi/Fv1JJ227CQk/hq2.jpg',
    answer: 'Do Photons Cast Shadows?',
    decoys: ['Some Galaxies Move Faster Than the Speed of Light', 'How To Make MUONS'],
    channel_title: 'minutephysics',
    duration: 191,
  },
  {
    id: 'HQjjkRTqTeg',
    frame_url: 'https://i.ytimg.com/vi/HQjjkRTqTeg/hq2.jpg',
    answer: 'Does Processed and Red Meat Really Cause Cancer?',
    decoys: ['The Deadliest Thing in Your Kitchen', 'How Stress Changes Your Brain'],
    channel_title: 'sciBRIGHT',
    duration: 286,
  },
];

// A testing door, sibling of /reset: one page per card type, in the same
// vertical deck the feed uses, so every layout can be judged on a real
// device in one pass. Reads the backend for real content but consumes
// nothing — no session, no seen ledger, no usage clock.

// The backend types, in the order they should appear; the local
// (client-invented) types follow.
const BACKEND_TYPE_ORDER = [
  'almost_nothing', 'fast_weird', 'explainer', 'incident', 'ponder',
  'quiet_contradiction', 'mini_game', 'try_this', 'look_closer',
  'illusion', 'audio_drift', 'video',
];

interface ContentItem {
  id: string;
  type: string;
  [key: string]: any;
}

export default function CardGallery() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [deckHeight, setDeckHeight] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 40, seen: [] }),
        });
        const data = await response.json();
        const slate: ContentItem[] = data.success ? data.feed : [];

        // First of each backend type, in display order; a type the slate
        // didn't draw is simply absent from the walk.
        const one: ContentItem[] = [];
        for (const t of BACKEND_TYPE_ORDER) {
          const hit = slate.find((i) => i.type === t);
          if (hit) one.push(hit);
        }

        // The local types, built the same way the feed builds them. The
        // real feed carries ONE game per session; the gallery shows every
        // game's card, one page each.
        for (const game of GAMES) {
          one.push({ id: `gallery-game-${game.id}`, type: 'game', game, anchor: true });
        }
        one.push({
          id: 'gallery-notebook', type: 'notebook',
          promptId: WRITING_PROMPTS[0].id, prompt: WRITING_PROMPTS[0].prompt,
        });
        one.push({
          id: 'gallery-interruption', type: 'body_aware_interruption',
          text: 'Notice where your shoulders are.',
        });

        // PROTOTYPE — a guess card built from the video pool, for design
        // review only. The three frames below were eyeballed on 2026-09-01;
        // every one is a storyboard frame (hq2.jpg) rather than a thumbnail,
        // because thumbnails carry the title as burned-in artwork.
        for (const p of BEFORE_YOU_WATCH_SAMPLES) {
          one.push({ ...p, id: `gallery-byw-${p.id}`, type: 'before_you_watch' });
        }
        one.push({
          id: 'gallery-guestbook', type: 'guestbook',
          items: slate.slice(0, 5).map((i, n) => ({
            id: `g-${n}`, type: i.type,
            title: i.headline ?? i.question ?? i.hook ?? i.title ?? i.prompt ?? 'A card from today',
          })).filter((i) => !!i.title),
        });
        one.push({ id: 'gallery-mission', type: 'mission', mission: MISSIONS[0] });
        one.push({
          id: 'gallery-recap', type: 'week_recap',
          recap: {
            weekStart: '2026-08-24', weekEnd: '2026-08-30', daysVisited: 4,
            sessions: 6, cards: 58, missions: 3, leftEarly: 2, guesses: 9,
            audioPlays: 2, gameRounds: 4, retells: 3, writes: 2,
            skillsDone: 1, reminders: 3,
          },
        });

        setItems(one);
      } catch {
        setError('The museum isn’t answering.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderCard = (item: ContentItem) => {
    switch (item.type) {
      case 'fast_weird':
        return <ShareableCard shareName="gallery" ><FastWeirdCard content={item as any} /></ShareableCard>;
      case 'explainer':
        return <ShareableCard shareName="gallery"><ExplainerCard content={item as any} /></ShareableCard>;
      case 'ponder':
        return <ShareableCard shareName="gallery"><PonderCard content={item as any} /></ShareableCard>;
      case 'incident':
        return <ShareableCard shareName="gallery"><IncidentCard content={item as any} /></ShareableCard>;
      case 'mini_game':
        return <ShareableCard shareName="gallery"><MiniGameCard content={item as any} /></ShareableCard>;
      case 'audio_drift':
        return <ShareableCard shareName="gallery"><AudioDriftCard content={item as any} /></ShareableCard>;
      case 'almost_nothing':
        return <ShareableCard shareName="gallery"><AlmostNothingCard content={item as any} /></ShareableCard>;
      case 'quiet_contradiction':
        return <ShareableCard shareName="gallery"><QuietContradictionCard content={item as any} /></ShareableCard>;
      case 'video':
        return <VideoCard content={item as any} />;
      case 'try_this':
        return <TryThisCard content={item as any} />;
      case 'look_closer':
        return <LookCloserCard content={item as any} />;
      case 'before_you_watch':
        return <BeforeYouWatchCard content={item as any} />;
      case 'illusion':
        return <IllusionCard content={item as any} />;
      case 'game':
        return <GameCard game={item.game} anchor />;
      case 'notebook':
        return <NotebookCard promptId={item.promptId} prompt={item.prompt} />;
      case 'guestbook':
        return <GuestbookCard items={item.items} />;
      case 'mission':
        return <MissionCard mission={item.mission} />;
      case 'week_recap':
        return (
          <ShareableCard shareName="gallery"><WeekRecapCard recap={item.recap} /></ShareableCard>
        );
      // 'body_aware_interruption' is not a card — the gallery renders it as
      // a whole page below, the same way the feed does.
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.muted} />
        <Text style={styles.centerText}>Hanging the exhibits…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <SessionChrome
        sessionNumber={1}
        totalSessions={1}
        minutesToday={0}
        index={page}
        count={items.length}
        onPrev={() => {}}
        onNext={() => {}}
      />
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => setDeckHeight(e.nativeEvent.layout.height)}
        // onScroll, not onMomentumScrollEnd — see the note on the feed's
        // handlePageSettle: react-native-web never fires momentum-end, and
        // the epsilon keeps mid-flick ticks from counting as a landing.
        onScroll={(e) => {
          if (!deckHeight) return;
          const y = e.nativeEvent.contentOffset.y;
          const i = Math.round(y / deckHeight);
          if (Math.abs(y - i * deckHeight) > 2) return;
          setPage(i);
        }}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}
      >
        {deckHeight > 0 && items.map((item, i) => (
          <View key={item.id} style={{ width: '100%', height: deckHeight }}>
            <DeckAdvanceContext.Provider value={() => {}}>
              {/* The full-bleed page can't take the caption inline without
                  losing the bleed, so here alone the caption floats over it.
                  The gallery doesn't lock the deck — it is a review surface,
                  not a session — but the beat still plays so the timing can
                  be judged. */}
              {item.type === 'body_aware_interruption' ? (
                <View style={styles.fullPage}>
                  <BodyAwareInterruption text={item.text} active={page === i} />
                  <Text style={[styles.caption, styles.captionOverlay]}>
                    {i + 1} of {items.length} · {item.type}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.pageInner}
                  showsVerticalScrollIndicator={false}
                >
                  {/* The caption is the gallery's one departure from the real
                      feed: which type this page shows, and where you are. */}
                  <Text style={styles.caption}>
                    {i + 1} of {items.length} · {item.type}
                  </Text>
                  {renderCard(item)}
                </ScrollView>
              )}
            </DeckAdvanceContext.Provider>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  center: {
    flex: 1,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerText: {
    ...type.micro,
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  pageInner: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  caption: {
    ...type.micro,
    textAlign: 'center',
    marginBottom: 8,
  },
  fullPage: {
    flex: 1,
  },
  captionOverlay: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
  },
});

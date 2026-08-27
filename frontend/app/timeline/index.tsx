import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TIMELINE_EVENTS, TimelineEvent, formatYear } from '../../data/timelineEvents';
import { colors, type } from '../../lib/theme';

// Year gap between anchor and challenger shrinks as the streak grows.
const minGapForStreak = (streak: number) => {
  if (streak < 3) return 150;
  if (streak < 6) return 60;
  if (streak < 10) return 25;
  return 8;
};

type Phase = 'playing' | 'correct' | 'gameover';

export default function TimelineGame() {
  const router = useRouter();
  const [anchor, setAnchor] = useState<TimelineEvent | null>(null);
  const [challenger, setChallenger] = useState<TimelineEvent | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');
  const [choice, setChoice] = useState<'before' | 'after' | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem('timeline_best_streak').then((v) => {
      if (v) setBest(parseInt(v, 10) || 0);
    });
    startRun();
  }, []);

  const pickChallenger = useCallback(
    (from: TimelineEvent, used: Set<string>, currentStreak: number): TimelineEvent => {
      let gap = minGapForStreak(currentStreak);
      while (gap >= 1) {
        const candidates = TIMELINE_EVENTS.filter(
          (e) =>
            e.name !== from.name &&
            !used.has(e.name) &&
            Math.abs(e.year - from.year) >= gap
        );
        if (candidates.length > 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }
        // Pool exhausted at this gap: first forget history, then relax the gap.
        if (used.size > 0) {
          used.clear();
          continue;
        }
        gap = Math.floor(gap / 2);
      }
      // Absolute fallback: anything that isn't the anchor.
      const rest = TIMELINE_EVENTS.filter((e) => e.name !== from.name);
      return rest[Math.floor(Math.random() * rest.length)];
    },
    []
  );

  const startRun = useCallback(() => {
    const first = TIMELINE_EVENTS[Math.floor(Math.random() * TIMELINE_EVENTS.length)];
    const used = new Set<string>([first.name]);
    const second = pickChallenger(first, used, 0);
    used.add(second.name);
    setAnchor(first);
    setChallenger(second);
    setUsedNames(used);
    setStreak(0);
    setChoice(null);
    setPhase('playing');
  }, [pickChallenger]);

  const handleAnswer = async (answer: 'before' | 'after') => {
    if (!anchor || !challenger || phase !== 'playing') return;
    setChoice(answer);
    const isBefore = challenger.year < anchor.year;
    const correct = (answer === 'before') === isBefore;

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setPhase('correct');
      if (newStreak > best) {
        setBest(newStreak);
        AsyncStorage.setItem('timeline_best_streak', String(newStreak)).catch(() => {});
      }
    } else {
      setPhase('gameover');
    }
  };

  const nextRound = () => {
    if (!challenger) return;
    const used = new Set(usedNames);
    const next = pickChallenger(challenger, used, streak);
    used.add(next.name);
    setAnchor(challenger);
    setChallenger(next);
    setUsedNames(used);
    setChoice(null);
    setPhase('playing');
  };

  const shareRun = async () => {
    const message =
      `I survived ${streak} round${streak === 1 ? '' : 's'} of The Timeline ` +
      `in Modern Weirdness. The fax machine came before the telephone — how far can you get?`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ text: message });
      } else {
        await Share.share({ message });
      }
    } catch {
      // Sharing cancelled or unsupported — nothing to do.
    }
  };

  if (!anchor || !challenger) return null;

  const revealed = phase !== 'playing';
  const challengerIsBefore = challenger.year < anchor.year;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.body} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>The Timeline</Text>
          <Text style={styles.headerSubtitle}>Which came first?</Text>
        </View>
        <View style={styles.streakPill}>
          <Ionicons name="flame-outline" size={13} color={colors.muted} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        {/* Anchor: the event whose year you can see */}
        <View style={styles.anchorCard}>
          <Text style={styles.cardLabel}>ANCHOR</Text>
          <Text style={styles.anchorName}>{anchor.name}</Text>
          <Text style={styles.anchorYear}>{formatYear(anchor.year)}</Text>
        </View>

        <View style={styles.versusRow}>
          <View style={styles.versusLine} />
          <Text style={styles.versusText}>did this happen before or after?</Text>
          <View style={styles.versusLine} />
        </View>

        {/* Challenger: year hidden until answered */}
        <View
          style={[
            styles.challengerCard,
            phase === 'correct' && styles.challengerCorrect,
            phase === 'gameover' && styles.challengerWrong,
          ]}
        >
          <Text style={styles.challengerName}>{challenger.name}</Text>
          {revealed ? (
            <>
              <Text
                style={[
                  styles.challengerYear,
                  phase === 'correct' ? styles.yearCorrect : styles.yearWrong,
                ]}
              >
                {formatYear(challenger.year)}
                {'  ·  '}
                {challengerIsBefore ? 'before' : 'after'}
              </Text>
              <Text style={styles.detailText}>{challenger.detail}</Text>
            </>
          ) : (
            <Text style={styles.hiddenYear}>· · · ·</Text>
          )}
        </View>

        {phase === 'playing' && (
          <View style={styles.answerRow}>
            <TouchableOpacity
              style={styles.answerButton}
              onPress={() => handleAnswer('before')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={14} color={colors.body} />
              <Text style={styles.answerText}>Before</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.answerButton}
              onPress={() => handleAnswer('after')}
              activeOpacity={0.7}
            >
              <Text style={styles.answerText}>After</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.body} />
            </TouchableOpacity>
          </View>
        )}

        {phase === 'correct' && (
          <TouchableOpacity style={styles.nextButton} onPress={nextRound} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {phase === 'gameover' && (
          <View style={styles.gameoverPanel}>
            <Text style={styles.gameoverTitle}>
              {streak === 0
                ? 'Time is slippery.'
                : streak >= best && streak > 0
                ? 'A new best.'
                : 'The run ends here.'}
            </Text>
            <Text style={styles.gameoverStats}>
              Streak {streak} · Best {best}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={startRun} activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>Run it back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={shareRun} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={13} color={colors.body} />
              <Text style={styles.ghostButtonText}>Challenge a friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.ghostButtonText}>Back to the museum</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surfaceTinted,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.45,
  },
  headerSubtitle: {
    ...type.micro,
    marginTop: 5,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    minWidth: 46,
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
  },
  playArea: {
    flex: 1,
    padding: 16,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  anchorCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    alignItems: 'center',
  },
  cardLabel: {
    ...type.label,
    marginBottom: 12,
  },
  anchorName: {
    ...type.title,
    textAlign: 'center',
  },
  anchorYear: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.ink,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  versusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  versusLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  versusText: {
    ...type.micro,
  },
  challengerCard: {
    backgroundColor: colors.surfaceTinted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  challengerCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#10b9810D',
  },
  challengerWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#ef44440D',
  },
  challengerName: {
    ...type.title,
    textAlign: 'center',
  },
  hiddenYear: {
    fontSize: 22,
    color: colors.hairline,
    marginTop: 12,
    letterSpacing: 4,
  },
  challengerYear: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 12,
    letterSpacing: -0.3,
  },
  yearCorrect: {
    color: '#10b981',
  },
  yearWrong: {
    color: '#ef4444',
  },
  detailText: {
    ...type.body,
    textAlign: 'center',
    marginTop: 12,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  answerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.body,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  gameoverPanel: {
    marginTop: 16,
    alignItems: 'stretch',
  },
  gameoverTitle: {
    ...type.title,
    textAlign: 'center',
  },
  gameoverStats: {
    ...type.micro,
    textAlign: 'center',
    marginTop: 8,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  ghostButtonText: {
    color: colors.body,
    fontSize: 11,
    fontWeight: '400',
  },
});

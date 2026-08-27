import React, { useState, useEffect, useRef } from 'react';
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
import { GAMES } from '../data/games';
import { cards, colors, type } from '../lib/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// PRD Constants
const BODY_AWARE_INTERRUPTIONS = [
  "Notice where your shoulders are.",
  "When was the last time you drank water?",
  "Time passed while you were here.",
  "Check the tension in your jaw.",
  "Feel the weight of the device in your hands.",
  "Take a single, intentional breath."
];

const END_SESSION_CARDS = [
  "That’s enough input for now.",
  "Some things don’t improve with more information.",
  "There’s nothing new here right now.",
  "You've wandered far enough for this session."
];

interface ContentItem {
  id: string;
  type: string;
  [key: string]: any;
}

export default function Index() {
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [endSessionMessage, setEndSessionMessage] = useState('');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const lastGameId = useRef<string | null>(null);

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
  // down the scroll — a surprise, not a fixture. Never the same game twice
  // in a row, so a refresh always offers something different.
  const insertGameCard = (items: ContentItem[]) => {
    const candidates = GAMES.filter((g) => g.id !== lastGameId.current);
    const pool = candidates.length > 0 ? candidates : GAMES;
    const game = pool[Math.floor(Math.random() * pool.length)];
    lastGameId.current = game.id;

    const withGame = [...items];
    const index = Math.min(
      Math.floor(Math.random() * 3) + 2, // 2, 3 or 4
      withGame.length
    );
    withGame.splice(index, 0, {
      id: `game-${game.id}-${Date.now()}`,
      type: 'game',
      game,
    });

    return withGame;
  };

  // Fetch feed on mount
  useEffect(() => {
    fetchFeed();
    
    // Track usage time every minute
    const interval = setInterval(async () => {
      const currentMinutes = await AsyncStorage.getItem('daily_usage_minutes');
      const newMinutes = (parseInt(currentMinutes || '0') + 1).toString();
      await AsyncStorage.setItem('daily_usage_minutes', newMinutes);
      
      // Check if limit reached (3 hours = 180 minutes)
      if (parseInt(newMinutes) >= 180) {
        setError('Daily time boundary reached. See you tomorrow.');
        setFeed([]);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      setSessionCompleted(false);
      // Determine session size (9-12 items as per PRD)
      const sessionSize = Math.floor(Math.random() * 4) + 9; 
      
      const response = await fetch(`${BACKEND_URL}/api/feed?limit=${sessionSize}`);
      const data = await response.json();
      
      if (data.success) {
        // We only want `sessionSize` number of items for this session
        let sessionItems = data.feed.slice(0, sessionSize);

        // Drop a game into the scroll as an ordinary card
        sessionItems = insertGameCard(sessionItems);

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

        setFeed(sessionItems);
        setError('');
        
        setEndSessionMessage(END_SESSION_CARDS[Math.floor(Math.random() * END_SESSION_CARDS.length)]);
      } else {
        setError('Failed to load feed');
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
      setError('Unable to connect to server');
    } finally {
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
        return <FastWeirdCard content={item as any} />;
      case 'explainer':
        return <ExplainerCard content={item as any} />;
      case 'ponder':
        return <PonderCard content={item as any} />;
      case 'incident':
        return <IncidentCard content={item as any} />;
      case 'mini_game':
        return <MiniGameCard content={item as any} />;
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

  const renderContentCard = (item: ContentItem) => {
    const shareable = shareableCardFor(item);
    if (shareable) {
      return (
        <ShareableCard key={item.id} shareName={`modern-weirdness-${item.type}`}>
          {shareable}
        </ShareableCard>
      );
    }
    switch (item.type) {
      case 'game':
        return <GameCard key={item.id} game={item.game} />;
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

  const handleEndScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!sessionCompleted) {
        setSessionCompleted(true);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={colors.muted} />
        <Text style={styles.loadingText}>Loading curiosities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFeed}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Modern Weirdness</Text>
          <Text style={styles.headerSubtitle}>A museum of curiosity in your pocket</Text>
        </View>
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.muted}
            colors={[colors.muted]}
          />
        }
        onScroll={handleEndScroll}
        scrollEventThrottle={400}
      >
        {feed.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="telescope-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>No content yet</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        ) : (
          feed.map((item) => renderContentCard(item))
        )}
        
        {/* End of Session Card */}
        {feed.length > 0 && sessionCompleted && (
          <View style={styles.endSessionCard}>
            <Text style={styles.endSessionText}>{endSessionMessage}</Text>
            
            <TouchableOpacity 
              style={styles.leaveButton}
              onPress={() => setError('You have intentionally left the session. Close the app to fully step away.')}
            >
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.driftButton}
              onPress={fetchFeed}
            >
              <Text style={styles.driftButtonText}>Drift a little longer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Footer padding for scroll spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surfaceTinted,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
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
  scrollView: {
    flex: 1,
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
    marginTop: 16,
    marginBottom: 48,
    alignItems: 'center',
  },
  endSessionText: {
    ...type.title,
    textAlign: 'center',
    marginBottom: 32,
  },
  leaveButton: {
    backgroundColor: colors.ink,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  driftButton: {
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  driftButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.body,
  },
  footerSpacing: {
    height: 80,
  },
});

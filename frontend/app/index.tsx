import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
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
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading curiosities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
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
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        onScroll={handleEndScroll}
        scrollEventThrottle={400}
      >
        {feed.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="telescope-outline" size={64} color="#8C8E92" />
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
    backgroundColor: '#F7F7F5',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F7F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECE9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16171A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8C8E92',
    marginTop: 4,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8C8E92',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B6D76',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8C8E92',
  },
  interruptionContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interruptionText: {
    fontSize: 20,
    color: '#8C8E92',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  endSessionCard: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECECE9',
    padding: 32,
    marginTop: 16,
    marginBottom: 48,
    alignItems: 'center',
  },
  endSessionText: {
    fontSize: 22,
    color: '#16171A',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  leaveButton: {
    backgroundColor: '#16171A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  driftButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDA',
  },
  driftButtonText: {
    color: '#6B6D76',
    fontSize: 14,
  },
  footerSpacing: {
    height: 80,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';

const { width } = Dimensions.get('window');

interface VideoCardProps {
  content: {
    title: string;
    description: string;
    video_url: string;
    duration?: number;
    rarity?: string;
    tags?: string[];
  };
}

export default function VideoCard({ content }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const cardRef = useRef<View>(null);

  const getYouTubeEmbedUrl = (url: string, autoplay: boolean = false) => {
    if (!url || url.includes('PLACEHOLDER')) return null;
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0];
    }
    
    if (!videoId) return null;
    
    // Add autoplay, mute (required for autoplay), and other parameters
    const params = autoplay 
      ? '?autoplay=1&mute=1&playsinline=1&controls=1&modestbranding=1&rel=0'
      : '?autoplay=1&playsinline=1&controls=1&modestbranding=1&rel=0';
    
    return `https://www.youtube.com/embed/${videoId}${params}`;
  };

  // Auto-play when scrolled into view (first time only)
  useEffect(() => {
    if (!hasAutoPlayed) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        setHasAutoPlayed(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [hasAutoPlayed]);

  const embedUrl = getYouTubeEmbedUrl(content.video_url, isPlaying);
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    return `${seconds}s`;
  };

  return (
    <View style={styles.card} ref={cardRef}>
      <View style={styles.header}>
        <Ionicons name="videocam-outline" size={20} color="#f43f5e" />
        <Text style={styles.cardType}>Short Explainer</Text>
        {content.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(content.duration)}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>
      
      {embedUrl ? (
        <>
          {isPlaying ? (
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: embedUrl }}
                style={styles.webview}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.videoButton}
              onPress={() => setIsPlaying(true)}
              activeOpacity={0.7}
            >
              <View style={styles.playIcon}>
                <Ionicons name="play" size={24} color="#ffffff" />
              </View>
              <Text style={styles.videoButtonText}>Watch Now</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="film-outline" size={32} color="#6b7280" />
          <Text style={styles.placeholderText}>Video coming soon</Text>
          <Text style={styles.placeholderSubtext}>
            Real video URLs will be added in production
          </Text>
        </View>
      )}
      
      <ReactionButtons reactions={['Makes Sense', 'Tell Me More', 'Unexpected']} />
      
      {content.tags && content.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {content.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardType: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#1f1f1f',
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
    marginBottom: 16,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f43f5e',
    borderRadius: 12,
    marginBottom: 12,
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  videoContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 12,
  },
  webview: {
    flex: 1,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#1f1f1f',
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

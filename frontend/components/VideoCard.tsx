import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';

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

  // Render iframe for web, WebView for native
  const renderVideo = () => {
    if (!embedUrl) return null;

    if (Platform.OS === 'web') {
      // Use iframe for web
      return (
        <View style={styles.videoContainer}>
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 12,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </View>
      );
    } else {
      // Use WebView for native
      return (
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
      );
    }
  };

  return (
    <View style={styles.card} ref={cardRef}>
      <CardHeader
        icon="videocam-outline"
        color="#f43f5e"
        label="Short Explainer"
        badge={
          content.duration ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(content.duration)}</Text>
            </View>
          ) : undefined
        }
      />
      
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>
      
      {embedUrl ? (
        <>
          {isPlaying ? (
            renderVideo()
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
      
      <ReactionButtons
        reactions={['Makes Sense', 'Noted', 'Unexpected']}
        tags={content.tags}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECE9',
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F5F5F3',
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    color: '#6B6D76',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: '#16171A',
    marginBottom: 10,
    lineHeight: 25,
  },
  description: {
    fontSize: 15,
    color: '#5B5D63',
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
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECE9',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B6D76',
    fontWeight: '600',
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#8C8E92',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';

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
    <View style={cards.white} ref={cardRef}>
      <CardHeader
        icon="videocam-outline"
        color="#f43f5e"
        label="Short Explainer"
        badge={
          content.duration ? (
            <Text style={styles.durationText}>{formatDuration(content.duration)}</Text>
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
                <Ionicons name="play" size={13} color="#FFFFFF" />
              </View>
              <Text style={styles.videoButtonText}>Watch Now</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="film-outline" size={28} color={colors.muted} />
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
  durationText: {
    ...type.micro,
  },
  title: {
    ...type.title,
    marginBottom: 10,
  },
  description: {
    ...type.body,
    marginBottom: 16,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.ink,
    borderRadius: 12,
    marginBottom: 12,
  },
  playIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
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
    backgroundColor: colors.surfaceTinted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  placeholderText: {
    ...type.body,
    marginTop: 12,
  },
  placeholderSubtext: {
    ...type.micro,
    marginTop: 6,
    textAlign: 'center',
  },
});

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';

const { width } = Dimensions.get('window');

interface VideoCardProps {
  content: {
    title: string;
    description: string;
    video_url: string;
    duration?: number;
    channel_title?: string;
    channel_url?: string;
    rarity?: string;
    tags?: string[];
  };
}

export default function VideoCard({ content }: VideoCardProps) {
  // Playback is only ever started by a tap. There used to be a 500ms timer
  // here that set this true on mount, with no visibility check — which
  // breaks YouTube's terms twice over: an API Client "must not initiate an
  // automatic playback until the player is visible and more than half of
  // the player is visible", and a screen "must not have more than one
  // YouTube player that automatically plays content simultaneously" (the
  // feed carries three video cards per load).
  const [isPlaying, setIsPlaying] = useState(false);
  const scale = cardScale(content.title, content.description);
  const cardRef = useRef<View>(null);

  const getYouTubeEmbedUrl = (url: string) => {
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

    // autoplay is safe here because this URL is only ever mounted after the
    // viewer taps play. modestbranding was removed: YouTube deprecated it in
    // August 2023 and it has no effect, and suppressing their branding is
    // not something we should look like we're attempting.
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&rel=0`;
  };

  const embedUrl = getYouTubeEmbedUrl(content.video_url);
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
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
    <View style={[cards.white, cards.fill]} ref={cardRef}>
      <View>
      <CardHeader
        icon="videocam-outline"
        color={accents.curiosity}
        label="Short Explainer"
        badge={
          content.duration ? (
            <Text style={styles.durationText}>{formatDuration(content.duration)}</Text>
          ) : undefined
        }
      />
      
      <Text style={[styles.title, scale.title]}>{content.title}</Text>

      {/* Whose work this is, before you press play. The embedded player
          credits the channel too, but the card shouldn't pass off someone
          else's explainer as unattributed content. */}
      {content.channel_title ? (
        content.channel_url ? (
          <TouchableOpacity
            style={styles.creditRow}
            onPress={() => Linking.openURL(content.channel_url!)}
            activeOpacity={0.7}
          >
            <Text style={styles.credit}>{content.channel_title}</Text>
            <Ionicons name="open-outline" size={11} color={colors.muted} />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.credit, styles.creditRow]}>{content.channel_title}</Text>
        )
      ) : null}

      {/* Plenty of shorts ship with no description at all — render the gap
          away rather than leaving an empty line of padding. */}
      {content.description?.trim() ? (
        <Text style={[styles.description, scale.body]}>{content.description}</Text>
      ) : (
        <View style={styles.descriptionSpacer} />
      )}

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
          <Text style={styles.placeholderText}>The projector is down.</Text>
          <Text style={styles.placeholderSubtext}>
            Someone is looking at it.
          </Text>
        </View>
      )}
      
      </View>

      <CardFoot ruled>
        <ReactionButtons
          reactions={['Makes Sense', 'Noted', 'Unexpected']}
          tags={content.tags}
          flush
        />
      </CardFoot>
    </View>
  );
}

const styles = StyleSheet.create({
  durationText: {
    ...type.micro,
  },
  title: {
    ...type.title,
    marginBottom: 6,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  credit: {
    ...type.micro,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
  },
  description: {
    ...type.body,
    marginBottom: 16,
  },
  descriptionSpacer: {
    height: 6,
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

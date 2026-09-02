import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import { Image } from 'expo-image';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
import { cleanSourcedTitle, cleanSourcedText } from '../lib/titles';

const { width } = Dimensions.get('window');

interface VideoCardProps {
  content: {
    title: string;
    description: string;
    video_url: string;
    duration?: number;
    channel_title?: string;
    channel_url?: string;
    /** YouTube's own poster art, from the Data API. */
    thumbnail_url?: string;
    video_id?: string;
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
  const [posterFailed, setPosterFailed] = useState(false);
  const title = cleanSourcedTitle(content.title);
  // Capped at 23. A video title is somebody else's headline, not one this
  // app wrote to the content bar — at the 31px wall-label step a
  // three-line YouTube title becomes the loudest thing in the deck and
  // out-shouts the cards whose sentences were actually authored for it.
  const scale = cardScale(title, content.description);
  const titleSize = Math.min((scale.title.fontSize as number) ?? 19, 23);
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

  // The poster. `thumbnail_url` is what the Data API returned; where it is
  // missing we can still build one from the id, because YouTube serves a
  // predictable path per video. hqdefault exists for every video ever
  // uploaded, which maxresdefault does not.
  const videoId =
    content.video_id ||
    (content.video_url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)?.[1] ?? '');
  const posterUrl =
    content.thumbnail_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

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
      <View style={styles.top}>
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
      
      <Text style={[styles.title, scale.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.35) }]}>
        {title}
      </Text>

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
        <Text style={[styles.description, scale.body]}>{cleanSourcedText(content.description)}</Text>
      ) : (
        <View style={styles.descriptionSpacer} />
      )}

      {embedUrl ? (
        isPlaying ? (
          renderVideo()
        ) : posterUrl && !posterFailed ? (
          /* The poster IS the play control: tapping the picture is what
             everyone already expects of a video, and it gives the card
             something to look at instead of a bare bar. The player mounts
             into the same frame on tap, so nothing shifts underneath the
             thumb. */
          <TouchableOpacity
            style={[styles.poster, cards.artFill]}
            onPress={() => setIsPlaying(true)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Play: ${title}`}
          >
            <Image
              source={{ uri: posterUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              onError={() => setPosterFailed(true)}
            />
            {/* A scrim under the badge only, not across the picture: the
                badge has to stay legible on a bright frame without the
                whole thumbnail going grey. */}
            <View style={styles.playBadge}>
              <Ionicons name="play" size={20} color={colors.surface} style={styles.playGlyph} />
            </View>
          </TouchableOpacity>
        ) : (
          /* No poster, or it failed to load: the old bar, which still works. */
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
        )
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
          flush
        />
      </CardFoot>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
  },
  // The poster fills the height the card has spare, inside the same
  // 240-400 band every other picture on the deck uses.
  poster: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(28, 27, 26, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The glyph's own bounding box is wider than the triangle it draws, so
  // centring it optically needs a nudge right.
  playGlyph: {
    marginLeft: 3,
  },
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
    flex: 1,
    minHeight: 240,
    maxHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
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

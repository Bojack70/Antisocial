import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';
import { recordAudioPlay } from '../lib/weekLedger';

interface AudioDriftCardProps {
  content: {
    title: string;
    narration_script?: string;
    /** A real audio file, and the only thing ever handed to a player. */
    audio_url?: string;
    duration?: number; // seconds
    show_title?: string;
    author?: string;
    episode_link?: string;
    rarity?: string;
    tags?: string[];
  };
}

const formatTime = (millis: number) => {
  const total = Math.floor(millis / 1000);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function AudioDriftCard({ content }: AudioDriftCardProps) {
  // Only `audio_url`. There used to be a `|| content.embed_url` fallback
  // here, and embed_url was a podcast-directory iframe PAGE — an HTML
  // document, which no audio element can decode. The card rendered a
  // player that could never play. A URL we can't verify as audio is
  // treated as no audio at all.
  const audioUrl = content.audio_url;

  // Hooks live at the top level. They used to be declared inside the
  // native branch of a nested render function, which is a Rules of Hooks
  // violation that only survived because Platform.OS never changes.
  const [sound, setSound] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState((content.duration ?? 0) * 1000);

  // Depth action: the first play press on this card, and only the first —
  // pause/resume cycles are one listen, not several. This counter is what
  // decides the spec's item-5 listening-room question, so it must mean
  // "someone actually chose to listen", nothing looser.
  const playRecorded = useRef(false);
  const recordFirstPlay = () => {
    if (playRecorded.current) return;
    playRecorded.current = true;
    recordAudioPlay();
  };

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const playPauseAudio = async () => {
    if (!audioUrl) return;
    try {
      const { Audio } = require('expo-av');

      recordFirstPlay();

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            if (status.didJustFinish) setIsPlaying(false);
          }
        }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const renderAudioPlayer = () => {
    if (!audioUrl) return null;

    if (Platform.OS === 'web') {
      return (
        <View style={styles.audioPlayerContainer}>
          <audio
            controls
            onPlay={recordFirstPlay}
            src={audioUrl}
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: 'rgba(39, 39, 42, 0.5)',
            }}
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
        </View>
      );
    }

    return (
      <View style={styles.mobilePlayerContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={playPauseAudio}
          activeOpacity={0.7}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
              ]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Crediting the show and linking back is the half of "behave like a
  // podcast client" that isn't automatic. The audio itself streams from
  // the publisher's own server, unmodified.
  const renderCredit = () => {
    const credit = [content.show_title, content.author].filter(Boolean).join(' · ');
    if (!credit) return null;

    const length =
      content.duration && Platform.OS === 'web'
        ? ` · ${formatTime(content.duration * 1000)}`
        : '';

    if (!content.episode_link) {
      return <Text style={styles.credit}>{credit}{length}</Text>;
    }

    return (
      <TouchableOpacity
        style={styles.creditRow}
        onPress={() => Linking.openURL(content.episode_link!)}
        activeOpacity={0.7}
      >
        <Text style={styles.credit}>{credit}{length}</Text>
        <Ionicons name="open-outline" size={11} color={colors.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={cards.dark}>
      <CardHeader icon="headset-outline" color="#06b6d4" label="Audio Drift" tone="dark" />

      <Text style={styles.title}>{content.title}</Text>
      {renderCredit()}

      {audioUrl ? (
        <>
          {renderAudioPlayer()}
          {content.narration_script ? (
            <View style={styles.scriptContainer}>
              <Text style={styles.scriptText}>{content.narration_script}</Text>
            </View>
          ) : (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Listen to the audio above, then share your reaction
              </Text>
            </View>
          )}
        </>
      ) : content.narration_script ? (
        <View style={styles.scriptContainer}>
          <Text style={styles.scriptText}>{content.narration_script}</Text>
        </View>
      ) : (
        <View style={styles.noAudioContainer}>
          <Ionicons name="musical-notes-outline" size={32} color={colors.darkLine} />
          <Text style={styles.noAudioText}>This one hasn’t found its voice yet.</Text>
          <Text style={styles.noAudioSubtext}>
            It will speak eventually.
          </Text>
        </View>
      )}

      <ReactionButtons
        reactions={['Stayed With Me', 'Lingering', 'Unsettling', 'Let It Pass']}
        tags={content.tags}
        tone="dark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.titleOnDark,
    marginBottom: 6,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 16,
  },
  credit: {
    ...type.micro,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
  },
  audioPlayerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  mobilePlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkPanel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.darkPill,
    borderWidth: 1,
    borderColor: colors.darkLine,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.darkLine,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.muted,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    ...type.micro,
  },
  scriptContainer: {
    backgroundColor: colors.darkPanel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scriptText: {
    ...type.bodyOnDark,
  },
  instructionContainer: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  instructionText: {
    ...type.body,
    color: colors.darkLine,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noAudioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: colors.darkPanel,
    borderRadius: 12,
    marginBottom: 16,
  },
  noAudioText: {
    ...type.bodyOnDark,
    marginTop: 12,
  },
  noAudioSubtext: {
    ...type.micro,
    marginTop: 6,
    textAlign: 'center',
  },
});

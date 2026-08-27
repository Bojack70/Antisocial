import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';

interface AudioDriftCardProps {
  content: {
    title: string;
    narration_script?: string;
    audio_url?: string;
    embed_url?: string;
    duration?: number;
    rarity?: string;
    tags?: string[];
  };
}

export default function AudioDriftCard({ content }: AudioDriftCardProps) {
  const audioUrl = content.audio_url || content.embed_url;

  // Render HTML5 audio player
  const renderAudioPlayer = () => {
    if (!audioUrl) return null;

    if (Platform.OS === 'web') {
      // Use HTML5 audio for web
      return (
        <View style={styles.audioPlayerContainer}>
          <audio
            controls
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: 'rgba(39, 39, 42, 0.5)',
            }}
            preload="metadata"
          >
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </View>
      );
    } else {
      // For mobile, use expo-av Audio
      const { Audio } = require('expo-av');
      const [sound, setSound] = useState<any>(null);
      const [isPlaying, setIsPlaying] = useState(false);
      const [position, setPosition] = useState(0);
      const [duration, setDuration] = useState(0);

      useEffect(() => {
        return () => {
          if (sound) {
            sound.unloadAsync();
          }
        };
      }, [sound]);

      const playPauseAudio = async () => {
        try {
          if (sound) {
            if (isPlaying) {
              await sound.pauseAsync();
              setIsPlaying(false);
            } else {
              await sound.playAsync();
              setIsPlaying(true);
            }
          } else {
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
                  if (status.didJustFinish) {
                    setIsPlaying(false);
                  }
                }
              }
            );
            setSound(newSound);
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Audio playback error:', error);
        }
      };

      const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

      return (
        <View style={styles.mobilePlayerContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={playPauseAudio}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#ffffff"
            />
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
    }
  };

  return (
    <View style={cards.dark}>
      <CardHeader icon="headset-outline" color="#06b6d4" label="Audio Drift" tone="dark" />

      <Text style={styles.title}>{content.title}</Text>
      
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
          <Text style={styles.noAudioText}>Audio coming soon</Text>
          <Text style={styles.noAudioSubtext}>
            Pre-recorded narrations will be added
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
    marginBottom: 16,
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

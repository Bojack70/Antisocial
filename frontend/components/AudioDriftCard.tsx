import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';

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
              backgroundColor: '#F5F5F3',
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
    <View style={styles.card}>
      <CardHeader icon="headset-outline" color="#06b6d4" label="Audio Drift" />

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
          <Ionicons name="musical-notes-outline" size={40} color="#8C8E92" />
          <Text style={styles.noAudioText}>Audio coming soon</Text>
          <Text style={styles.noAudioSubtext}>
            Pre-recorded narrations will be added
          </Text>
        </View>
      )}
      
      <ReactionButtons
        reactions={['Stayed With Me', 'Lingering', 'Unsettling', 'Let It Pass']}
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
  title: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#16171A',
    marginBottom: 14,
    lineHeight: 25,
  },
  audioPlayerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  mobilePlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ECECE9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#8C8E92',
  },
  scriptContainer: {
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scriptText: {
    fontSize: 14.5,
    color: '#5B5D63',
    lineHeight: 22,
  },
  instructionContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F3',
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B6D76',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noAudioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECE9',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  noAudioText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B6D76',
    fontWeight: '600',
  },
  noAudioSubtext: {
    marginTop: 6,
    fontSize: 13,
    color: '#8C8E92',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

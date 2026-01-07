import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';

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
              backgroundColor: '#1a1a1a',
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
      <View style={styles.header}>
        <Ionicons name="headset-outline" size={20} color="#06b6d4" />
        <Text style={styles.cardType}>Audio Drift</Text>
      </View>
      
      <Text style={styles.title}>{content.title}</Text>
      
      {audioUrl ? (
        <>
          {renderAudioPlayer()}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Listen to the audio above, then share your reaction
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.noAudioContainer}>
          <Ionicons name="musical-notes-outline" size={40} color="#4b5563" />
          <Text style={styles.noAudioText}>Audio coming soon</Text>
          <Text style={styles.noAudioSubtext}>
            Pre-recorded narrations will be added
          </Text>
        </View>
      )}
      
      <ReactionButtons reactions={['Stayed With Me', 'Drifted Off', 'Unsettling', 'Let It Pass']} />
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 20,
    lineHeight: 32,
  },
  audioPlayerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  mobilePlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#262626',
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
    color: '#6b7280',
  },
  instructionContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noAudioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  noAudioText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '600',
  },
  noAudioSubtext: {
    marginTop: 6,
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

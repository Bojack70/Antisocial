import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import ReactionButtons from './ReactionButtons';

interface AudioDriftCardProps {
  content: {
    title: string;
    narration_script: string;
    audio_url?: string;
    duration?: number;
    rarity?: string;
    tags?: string[];
  };
}

export default function AudioDriftCard({ content }: AudioDriftCardProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);

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
      } else if (content.audio_url) {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: content.audio_url },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setAudioEnded(true);
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '~1 min';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="headset-outline" size={20} color="#06b6d4" />
        <Text style={styles.cardType}>Audio Drift</Text>
        {content.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(content.duration)}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.title}>{content.title}</Text>
      
      {content.audio_url ? (
        <TouchableOpacity
          style={styles.playButton}
          onPress={playPauseAudio}
          activeOpacity={0.7}
        >
          <View style={styles.playIcon}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#ffffff"
            />
          </View>
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause' : 'Listen'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.noAudioContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#9ca3af" />
          <Text style={styles.noAudioText}>Audio coming soon</Text>
        </View>
      )}
      
      {audioEnded && (
        <ReactionButtons reactions={['Stayed With Me', 'Drifted Off', 'Unsettling', 'Let It Pass']} />
      )}
      
      <TouchableOpacity
        style={styles.scriptToggle}
        onPress={() => setShowScript(!showScript)}
        activeOpacity={0.7}
      >
        <Text style={styles.scriptToggleText}>
          {showScript ? 'Hide Script' : 'Read Script'}
        </Text>
        <Ionicons
          name={showScript ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#9ca3af"
        />
      </TouchableOpacity>
      
      {showScript && (
        <View style={styles.scriptContainer}>
          <Text style={styles.scriptText}>{content.narration_script}</Text>
        </View>
      )}
      
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
    marginBottom: 16,
    lineHeight: 28,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    marginBottom: 12,
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  noAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 12,
  },
  noAudioText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  scriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  scriptToggleText: {
    fontSize: 13,
    color: '#9ca3af',
    marginRight: 4,
  },
  scriptContainer: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
  },
  scriptText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
  const [showReactions, setShowReactions] = useState(false);

  // Render iframe for Listen Notes embeds
  const renderEmbed = () => {
    const embedUrl = content.embed_url || content.audio_url;
    
    if (!embedUrl) return null;

    if (Platform.OS === 'web') {
      // Use iframe for web
      return (
        <View style={styles.embedContainer}>
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: '200px',
              border: 'none',
              borderRadius: '12px',
            }}
            frameBorder="0"
            scrolling="no"
            loading="lazy"
            allow="autoplay"
          />
        </View>
      );
    } else {
      // For mobile, we'll use WebView
      const { WebView } = require('react-native-webview');
      return (
        <View style={styles.embedContainer}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
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
      
      {content.embed_url || content.audio_url ? (
        <>
          {renderEmbed()}
          {!showReactions && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Listen to the audio above, then share your reaction
              </Text>
            </View>
          )}
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
  embedContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  webview: {
    flex: 1,
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

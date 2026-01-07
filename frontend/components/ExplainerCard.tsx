import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';

interface ExplainerCardProps {
  content: {
    question: string;
    steps: string[];
    video_url?: string;
    interaction?: string;
    rarity?: string;
    tags?: string[];
  };
}

export default function ExplainerCard({ content }: ExplainerCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={20} color="#10b981" />
        <Text style={styles.cardType}>How Does This Work?</Text>
      </View>
      
      <Text style={styles.question}>{content.question}</Text>
      
      <View style={styles.stepsContainer}>
        {content.steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.stepCard,
              selectedStep === index && styles.stepCardSelected,
            ]}
            onPress={() => setSelectedStep(index === selectedStep ? null : index)}
            activeOpacity={0.7}
          >
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ReactionButtons 
        reactions={['Makes Sense', 'Tell Me More', 'Unexpected']}
        microPrompt="Which part surprised you?"
      />
      
      {content.video_url && (
        <TouchableOpacity
          style={styles.videoButton}
          onPress={() => setShowVideo(!showVideo)}
        >
          <Ionicons
            name={showVideo ? 'close-circle-outline' : 'play-circle-outline'}
            size={20}
            color="#6366f1"
          />
          <Text style={styles.videoButtonText}>
            {showVideo ? 'Hide Video' : 'Watch Explanation'}
          </Text>
        </TouchableOpacity>
      )}
      
      {showVideo && content.video_url && (
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: getYouTubeEmbedUrl(content.video_url) }}
            style={styles.webview}
            allowsFullscreenVideo
          />
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
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
    lineHeight: 26,
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262626',
  },
  stepCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  videoButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  videoContainer: {
    marginTop: 16,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
});

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
  const [showSteps, setShowSteps] = useState(false);

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

      <TouchableOpacity
        style={styles.seeHowRow}
        onPress={() => setShowSteps(!showSteps)}
        activeOpacity={0.7}
      >
        <Text style={styles.seeHowText}>{showSteps ? 'Hide steps' : 'See how'}</Text>
        <Ionicons
          name={showSteps ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#5B5D63"
        />
      </TouchableOpacity>

      {showSteps && (
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
      )}

      {content.interaction && (
        <>
          <View style={styles.divider} />
          <Text style={styles.interaction}>{content.interaction}</Text>
        </>
      )}

      <View style={styles.divider} />

      <ReactionButtons
        reactions={['Makes Sense', 'Noted', 'Unexpected']}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECE9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardType: {
    fontSize: 15,
    color: '#6B6D76',
    marginLeft: 9,
    fontWeight: '600',
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16171A',
    marginBottom: 14,
    lineHeight: 27,
  },
  seeHowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeHowText: {
    fontSize: 15,
    color: '#5B5D63',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECE9',
    marginVertical: 16,
  },
  interaction: {
    fontSize: 15,
    color: '#8C8E92',
    fontStyle: 'italic',
  },
  stepsContainer: {
    gap: 12,
    marginTop: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECE9',
  },
  stepCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#10b98114',
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
    color: '#3A3B3E',
    lineHeight: 20,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F3',
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

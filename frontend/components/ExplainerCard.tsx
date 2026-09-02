import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';

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
  // Open by default (user call, 2026-08-31): the steps ARE the card, so
  // they show without a tap. The toggle stays for collapsing.
  const [showSteps, setShowSteps] = useState(true);
  const scale = cardScale(content.question, content.steps, content.interaction);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <View style={[cards.white, cards.fill]}>
      <View>
      <CardHeader icon="bulb-outline" color={accents.curiosity} label="How Does This Work?" />

      <Text style={[styles.question, scale.title]}>{content.question}</Text>

      <TouchableOpacity
        style={styles.seeHowRow}
        onPress={() => setShowSteps(!showSteps)}
        activeOpacity={0.7}
      >
        <Text style={styles.seeHowText}>{showSteps ? 'Hide steps' : 'See how'}</Text>
        <Ionicons
          name={showSteps ? 'chevron-up' : 'chevron-down'}
          size={15}
          color={colors.muted}
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
              <Text style={[styles.stepText, scale.row]}>{step}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {content.interaction && (
        <>
          <View style={styles.divider} />
          <Text style={[styles.interaction, scale.body]}>{content.interaction}</Text>
        </>
      )}

      {content.video_url && (
        <TouchableOpacity
          style={styles.videoButton}
          onPress={() => setShowVideo(!showVideo)}
        >
          <Ionicons
            name={showVideo ? 'close-circle-outline' : 'play-circle-outline'}
            size={18}
            color={colors.body}
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
  question: {
    ...type.title,
    marginBottom: 14,
  },
  seeHowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeHowText: {
    ...type.body,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 16,
  },
  interaction: {
    ...type.body,
    color: colors.muted,
    fontStyle: 'italic',
  },
  stepsContainer: {
    gap: 10,
    marginTop: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepCardSelected: {
    borderColor: colors.hairline,
    backgroundColor: '#F4F4F5',
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.body,
  },
  stepText: {
    ...type.body,
    flex: 1,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 11,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  videoButtonText: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '400',
    color: colors.body,
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

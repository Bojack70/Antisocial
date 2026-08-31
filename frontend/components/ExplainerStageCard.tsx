import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { cards, colors, stageType } from '../lib/theme';

interface ExplainerStageCardProps {
  content: {
    question: string;
    steps: string[];
    video_url?: string;
    interaction?: string;
  };
}

// PREVIEW — How Does This Work? on the stage treatment (see
// FastWeirdStageCard for the pattern; ExplainerCard is the shipped layout
// and stays untouched). The question is the sub-heading; the steps keep
// their see-how reveal — the commitment-before-payoff beat this card has
// always had — and arrive as numbered parchment rows.
export default function ExplainerStageCard({ content }: ExplainerStageCardProps) {
  const [showSteps, setShowSteps] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <View style={cards.stage}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={stageType.eyebrow}>How Does This Work?</Text>
        <Text style={[stageType.headline, styles.subheading]}>{content.question}</Text>

        <View style={styles.rule} />

        <TouchableOpacity
          style={styles.seeHowRow}
          onPress={() => setShowSteps(!showSteps)}
          activeOpacity={0.7}
        >
          <Text style={styles.seeHowText}>{showSteps ? 'Hide steps' : 'See how'}</Text>
          <Ionicons
            name={showSteps ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.muted}
          />
        </TouchableOpacity>

        {showSteps && (
          <View style={styles.steps}>
            {content.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {!!content.interaction && (
          <Text style={styles.interaction}>{content.interaction}</Text>
        )}

        {!!content.video_url && (
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => setShowVideo(!showVideo)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showVideo ? 'close-circle-outline' : 'play-circle-outline'}
              size={18}
              color={colors.ink}
            />
            <Text style={styles.videoButtonText}>
              {showVideo ? 'Hide Video' : 'Watch Explanation'}
            </Text>
          </TouchableOpacity>
        )}

        {showVideo && !!content.video_url && (
          <View style={styles.videoContainer}>
            <WebView
              source={{ uri: getYouTubeEmbedUrl(content.video_url) }}
              style={styles.webview}
              allowsFullscreenVideo
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subheading: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  rule: {
    width: 44,
    height: 1,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: 22,
    marginBottom: 22,
  },
  seeHowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeHowText: {
    fontSize: 19,
    lineHeight: 25,
    color: colors.ink,
  },
  steps: {
    gap: 10,
    marginTop: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
  },
  stepText: {
    fontSize: 19,
    lineHeight: 25,
    color: colors.ink,
    flex: 1,
    textAlign: 'left',
  },
  interaction: {
    fontSize: 17,
    lineHeight: 23,
    color: colors.muted,
    fontStyle: 'italic',
    textAlign: 'left',
    marginTop: 18,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  videoButtonText: {
    fontSize: 15,
    color: colors.ink,
  },
  videoContainer: {
    marginTop: 16,
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
});

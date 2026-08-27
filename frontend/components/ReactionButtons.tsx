import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Text from './AppText';
import { colors, type } from '../lib/theme';

interface ReactionButtonsProps {
  reactions: string[];
  onReact?: (reaction: string) => void;
  microPrompt?: string;
  tags?: string[];
  tone?: 'light' | 'dark';
}

export default function ReactionButtons({
  reactions,
  onReact,
  microPrompt,
  tags,
  tone = 'light',
}: ReactionButtonsProps) {
  const dark = tone === 'dark';
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showNoted, setShowNoted] = useState(false);
  const [showMicroPrompt, setShowMicroPrompt] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    
    // Fade out button
    Animated.timing(fadeAnim, {
      toValue: 0.4,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Show "Noted." briefly
    setShowNoted(true);
    setTimeout(() => {
      setShowNoted(false);
      if (microPrompt) {
        setShowMicroPrompt(true);
      }
    }, 1500);

    // Call callback if provided
    if (onReact) {
      onReact(reaction);
    }
  };

  return (
    <View style={styles.container}>
      {showNoted && (
        <View style={styles.notedContainer}>
          <Text style={styles.notedText}>Noted.</Text>
        </View>
      )}
      
      {showMicroPrompt && microPrompt && (
        <View style={styles.microPromptContainer}>
          <Text style={styles.microPromptText}>{microPrompt}</Text>
        </View>
      )}
      
      {!showNoted && !showMicroPrompt && (
        <View style={styles.rowBetween}>
          <View style={styles.buttonsContainer}>
            {reactions.map((reaction, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reactionButton,
                  dark && styles.reactionButtonDark,
                  selectedReaction === reaction &&
                    (dark ? styles.reactionButtonSelectedDark : styles.reactionButtonSelected),
                ]}
                onPress={() => handleReaction(reaction)}
                activeOpacity={0.7}
                disabled={selectedReaction !== null}
              >
                <Animated.View style={{ opacity: selectedReaction === reaction ? fadeAnim : 1 }}>
                  <Text
                    style={[
                      styles.reactionText,
                      dark && styles.reactionTextDark,
                      selectedReaction === reaction &&
                        (dark ? styles.reactionTextSelectedDark : styles.reactionTextSelected),
                    ]}
                  >
                    {reaction}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
          {tags && tags.length > 0 && (
            <Text style={styles.tagsText} numberOfLines={1}>
              {tags.join(' · ')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    minHeight: 34,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flexShrink: 1,
  },
  reactionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  reactionButtonDark: {
    backgroundColor: colors.darkPill,
    borderColor: colors.darkLine,
  },
  reactionButtonSelected: {
    borderColor: colors.ink,
  },
  reactionButtonSelectedDark: {
    borderColor: colors.muted,
  },
  reactionText: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16.5,
    color: colors.body,
  },
  reactionTextDark: {
    color: colors.darkBody,
  },
  reactionTextSelected: {
    color: colors.ink,
  },
  reactionTextSelectedDark: {
    color: '#FFFFFF',
  },
  tagsText: {
    ...type.micro,
    marginLeft: 8,
    flexShrink: 0,
  },
  notedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  notedText: {
    fontSize: 13,
    color: '#8C8E92',
    fontStyle: 'italic',
  },
  microPromptContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F3',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#DDDDDA',
  },
  microPromptText: {
    fontSize: 12,
    color: '#6B6D76',
    lineHeight: 18,
  },
});

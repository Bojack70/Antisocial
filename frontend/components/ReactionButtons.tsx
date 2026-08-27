import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Text from './AppText';

interface ReactionButtonsProps {
  reactions: string[];
  onReact?: (reaction: string) => void;
  microPrompt?: string;
  tags?: string[];
}

export default function ReactionButtons({ reactions, onReact, microPrompt, tags }: ReactionButtonsProps) {
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
                  selectedReaction === reaction && styles.reactionButtonSelected,
                ]}
                onPress={() => handleReaction(reaction)}
                activeOpacity={0.7}
                disabled={selectedReaction !== null}
              >
                <Animated.View style={{ opacity: selectedReaction === reaction ? fadeAnim : 1 }}>
                  <Text
                    style={[
                      styles.reactionText,
                      selectedReaction === reaction && styles.reactionTextSelected,
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
    gap: 6,
    flexShrink: 1,
  },
  reactionButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E3E3E0',
  },
  reactionButtonSelected: {
    borderColor: '#16171A',
  },
  reactionText: {
    fontSize: 12.5,
    color: '#6B6D76',
    fontWeight: '500',
  },
  reactionTextSelected: {
    color: '#16171A',
  },
  tagsText: {
    fontSize: 11,
    color: '#A9ABAF',
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

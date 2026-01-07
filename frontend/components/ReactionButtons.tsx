import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface ReactionButtonsProps {
  reactions: string[];
  onReact?: (reaction: string) => void;
  microPrompt?: string;
}

export default function ReactionButtons({ reactions, onReact, microPrompt }: ReactionButtonsProps) {
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    minHeight: 40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reactionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#262626',
  },
  reactionButtonSelected: {
    borderColor: '#3f3f3f',
  },
  reactionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  reactionTextSelected: {
    color: '#4b5563',
  },
  notedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  notedText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  microPromptContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#4b5563',
  },
  microPromptText: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
});

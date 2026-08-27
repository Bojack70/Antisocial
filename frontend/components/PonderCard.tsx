import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';

// This card carries no visual. The question is the content, and any image
// above it quietly suggests a mood — which works against the card's own
// closing line, "No right answer. Just you thinking."

interface PonderCardProps {
  content: {
    question: string;
    options: string[];
    rarity?: string;
    tags?: string[];
  };
}

export default function PonderCard({ content }: PonderCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <View style={cards.white}>
      <CardHeader icon="infinite-outline" color="#8b5cf6" label="Ponder & Play" />

      <Text style={styles.question}>{content.question}</Text>
      
      <View style={styles.optionsContainer}>
        {content.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              selectedOption === index && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedOption(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === index && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
            {selectedOption === index && (
              <Ionicons name="checkmark" size={14} color={colors.ink} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedOption !== null && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>No right answer. Just you thinking.</Text>
        </View>
      )}
      
      <ReactionButtons
        reactions={['I’m Unsure', 'Lingering', 'Stayed With Me']}
        tags={content.tags}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    ...type.title,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  optionCardSelected: {
    borderColor: colors.ink,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16.5,
    color: colors.body,
  },
  optionTextSelected: {
    color: colors.ink,
  },
  responseContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  responseText: {
    ...type.body,
    color: colors.muted,
    fontStyle: 'italic',
  },
});

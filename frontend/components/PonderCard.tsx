import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';

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
  // Staged reveal (spec item 7): the question stands alone first. A few
  // seconds of actually pondering before the options appear is the card
  // doing its job; the options arrive when asked for.
  const [showOptions, setShowOptions] = useState(false);
  const scale = cardScale(content.question, content.options);

  return (
    <View style={[cards.white, cards.fill]}>
      <View>
      <CardHeader icon="infinite-outline" color={accents.curiosity} label="Ponder & Play" />

      <Text style={[styles.question, scale.title]}>{content.question}</Text>

      {!showOptions && (
        <TouchableOpacity
          style={styles.revealRow}
          onPress={() => setShowOptions(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.revealText}>See the options</Text>
          <Ionicons name="chevron-down" size={15} color={colors.muted} />
        </TouchableOpacity>
      )}

      {showOptions && (
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
                scale.row,
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
      )}

      {selectedOption !== null && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>No right answer. Just you thinking.</Text>
        </View>
      )}
      
      </View>

      <CardFoot ruled>
        <ReactionButtons
          reactions={['I’m Unsure', 'Lingering', 'Stayed With Me']}
          flush
        />
      </CardFoot>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    ...type.title,
    marginBottom: 16,
  },
  revealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  revealText: {
    ...type.body,
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
    // Options are full sentences, so a pill can be wider than the card.
    // Without these it keeps its one-line intrinsic width and runs off the
    // right edge instead of wrapping its text.
    flexShrink: 1,
    maxWidth: '100%',
  },
  optionCardSelected: {
    borderColor: colors.ink,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16.5,
    color: colors.body,
    flexShrink: 1,
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

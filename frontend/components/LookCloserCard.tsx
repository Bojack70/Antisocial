import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

interface LookCloserCardProps {
  content: {
    image_url: string;
    prompt?: string;
    options: string[];
    answer: string;
    facts?: string[];
    credit: string;
    source_link?: string;
    rarity?: string;
    tags?: string[];
  };
}

// Wave 2, item 3: one photograph, three honest first impressions, then
// the reveal. The wrong options are the reasonable ones — that's the
// game. Counts as an interactive-guess anchor and ticks the same
// guesses counter as the other guess cards.
export default function LookCloserCard({ content }: LookCloserCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const answered = selected !== null;
  const isCorrect = selected === content.answer;

  // Without the picture there is nothing to guess at; the card degrades
  // to its reveal — a small fact card with a credit — rather than asking
  // a question about an image that never arrived.
  const degraded = imageFailed;

  return (
    <View style={cards.white}>
      <CardHeader icon="eye-outline" color="#4f46e5" label="Look Closer" />

      {!degraded && (
        <Image
          source={{ uri: content.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setImageFailed(true)}
        />
      )}

      {!degraded ? (
        <>
          <Text style={styles.prompt}>{content.prompt || 'What is this?'}</Text>

          <View style={styles.optionsContainer}>
            {content.options.map((option, index) => {
              const isSelected = selected === option;
              const isCorrectOption = answered && option === content.answer;
              const isWrongSelection = answered && isSelected && !isCorrect;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    isCorrectOption && styles.optionCardCorrect,
                    isWrongSelection && styles.optionCardWrong,
                  ]}
                  onPress={() => {
                    if (answered) return;
                    setSelected(option);
                    recordGuess(); // depth action; fire-and-forget
                  }}
                  disabled={answered}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (isSelected || isCorrectOption) && styles.optionTextBold,
                    ]}
                  >
                    {option}
                  </Text>
                  {isCorrectOption && (
                    <Ionicons name="checkmark" size={14} color={colors.ink} />
                  )}
                  {isWrongSelection && (
                    <Ionicons name="close" size={14} color={colors.muted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : (
        <Text style={styles.prompt}>{content.answer}</Text>
      )}

      {(answered || degraded) && (
        <>
          {(content.facts ?? []).map((fact, index) => (
            <Text key={index} style={styles.fact}>
              {fact}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.creditRow}
            onPress={() => content.source_link && Linking.openURL(content.source_link)}
            disabled={!content.source_link}
            activeOpacity={0.7}
          >
            <Text style={styles.credit}>{content.credit}</Text>
          </TouchableOpacity>
          <ReactionButtons
            reactions={['Unexpected', 'Unsettling', 'Makes Sense']}
            tags={content.tags}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#F4F4F5',
  },
  prompt: {
    ...type.title,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  optionCardSelected: {
    borderColor: colors.ink,
  },
  optionCardCorrect: {
    borderColor: colors.ink,
    backgroundColor: colors.surfaceTinted,
  },
  optionCardWrong: {
    borderColor: colors.line,
    backgroundColor: colors.surfaceTinted,
  },
  optionText: {
    ...type.body,
    flex: 1,
  },
  optionTextBold: {
    color: colors.ink,
  },
  fact: {
    ...type.body,
    marginTop: 12,
  },
  creditRow: {
    marginTop: 10,
  },
  credit: {
    ...type.micro,
  },
});

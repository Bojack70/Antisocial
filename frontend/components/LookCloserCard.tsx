import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
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
  const scale = cardScale(content.prompt, content.options, answered ? content.facts : undefined);

  return (
    <View style={[cards.white, cards.fill]}>
      <View style={styles.top}>
      <CardHeader icon="eye-outline" color={accents.curiosity} label="Look Closer" />

      {!degraded && (
        <Image
          source={{ uri: content.image_url }}
          style={[styles.image, cards.artFill]}
          contentFit="cover"
          transition={200}
          onError={() => setImageFailed(true)}
        />
      )}

      {!degraded ? (
        <Text style={[styles.prompt, scale.title]}>{content.prompt || 'What is this?'}</Text>
      ) : (
        <Text style={[styles.prompt, scale.title]}>{content.answer}</Text>
      )}

      {(answered || degraded) && (
        <>
          {(content.facts ?? []).map((fact, index) => (
            <Text key={index} style={[styles.fact, scale.body]}>
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
        </>
      )}
      </View>

      {/* The card already owned a foot: the thing you tap. Unanswered, the
          options sit at the bottom, in the thumb's reach, and the gap above
          them is thinking room. Answered, the chips take the same slot —
          the one place on the card that means "you are done here". */}
      {answered || degraded ? (
        <CardFoot ruled>
          <ReactionButtons
            reactions={['Unexpected', 'Unsettling', 'Makes Sense']}
            flush
          />
        </CardFoot>
      ) : (
        <CardFoot>
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
                      scale.row,
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
        </CardFoot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // No aspectRatio: it fights `cards.artFill`'s flex height. The 240-400
  // band caps the growth instead, which is what the ratio was really for.
  image: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#F4F4F5',
  },
  top: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
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

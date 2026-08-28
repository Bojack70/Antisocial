import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

interface NumberGuess {
  prompt: string;
  options: string[];
  answer: string;
  reveal?: string;
}

interface FastWeirdCardProps {
  content: {
    headline: string;
    facts: string[];
    // Guess-before-reveal (session-depth spec, item 1): when present, the
    // facts stay hidden until the reader commits to a range. Cards without
    // it render exactly as before.
    guess?: NumberGuess;
    rarity?: string;
    tags?: string[];
  };
}

export default function FastWeirdCard({ content }: FastWeirdCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const guess = content.guess?.options?.length ? content.guess : null;
  const answered = selected !== null;
  const isCorrect = guess ? selected === guess.answer : false;

  const facts = (
    <View style={styles.factsContainer}>
      {content.facts.map((fact, index) => (
        <View key={index} style={styles.factRow}>
          <View style={styles.bullet} />
          <Text style={styles.fact}>{fact}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={cards.white}>
      <CardHeader
        icon="flash-outline"
        color="#6366f1"
        label="Wait... What?"
        badge={
          content.rarity && content.rarity !== 'common' ? (
            <Text style={styles.rarityText}>{content.rarity}</Text>
          ) : undefined
        }
      />

      <Text style={styles.headline}>{content.headline}</Text>

      {guess ? (
        <>
          <Text style={styles.guessPrompt}>{guess.prompt}</Text>

          <View style={styles.optionsContainer}>
            {guess.options.map((option, index) => {
              const isSelected = selected === option;
              const isCorrectOption = answered && option === guess.answer;
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

          {answered && (
            <>
              <View style={styles.resultRow}>
                <Ionicons
                  name={isCorrect ? 'happy-outline' : 'bulb-outline'}
                  size={15}
                  color={colors.muted}
                />
                <Text style={styles.resultText}>
                  {isCorrect ? 'Correct.' : 'Interesting choice'}
                </Text>
              </View>

              {/* The payoff arrives only after the commitment. */}
              {facts}
              {!!guess.reveal && <Text style={styles.reveal}>{guess.reveal}</Text>}

              <ReactionButtons
                reactions={['Unexpected', 'Unsettling', 'Makes Sense']}
                tags={content.tags}
              />
            </>
          )}
        </>
      ) : (
        <>
          {facts}
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
  rarityText: {
    ...type.micro,
  },
  headline: {
    ...type.title,
    marginBottom: 14,
  },
  guessPrompt: {
    ...type.body,
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
  resultRow: {
    marginTop: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    ...type.micro,
  },
  reveal: {
    ...type.body,
    marginTop: 10,
  },
  factsContainer: {
    gap: 10,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.muted,
    marginTop: 10,
    marginRight: 11,
  },
  fact: {
    ...type.body,
    flex: 1,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
import { recordGuess } from '../lib/weekLedger';

interface QuoteGuessCardProps {
  content: {
    quote: string;
    // The correct source, as displayed (e.g. "Slaughterhouse-Five — Kurt Vonnegut, novel").
    answer: string;
    decoys: string[];
    // The payoff after the guess: who says it, when, or the story behind it.
    reveal: string;
  };
}

// A single good line, stripped of its home; the guess is which book, show,
// song or poem it walked out of. Half the game is not knowing the MEDIUM —
// the decoys deliberately cross novels, TV, songs and poems.
export default function QuoteGuessCard({ content }: QuoteGuessCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  // Shuffle once per mount so the answer doesn't always sit first.
  const [options] = useState(() =>
    [content.answer, ...content.decoys].sort(() => Math.random() - 0.5)
  );
  const answered = selected !== null;
  const isCorrect = selected === content.answer;
  const scale = cardScale(content.quote, options, answered ? content.reveal : '');

  const optionList = (
    <View style={styles.optionsContainer}>
          {options.map((option, index) => {
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
                {isCorrectOption && <Ionicons name="checkmark" size={14} color={colors.ink} />}
                {isWrongSelection && <Ionicons name="close" size={14} color={colors.muted} />}
              </TouchableOpacity>
            );
          })}
        </View>
  );

  return (
    <View style={[cards.white, cards.fill]}>
      <View>
      <CardHeader icon="chatbox-ellipses-outline" color={accents.curiosity} label="One Good Line" />

      <Text style={styles.quote}>“{content.quote}”</Text>
      <Text style={styles.prompt}>Where is this from?</Text>


      {answered && (
        <>
          <View style={styles.resultContainer}>
            <Ionicons
              name={isCorrect ? 'happy-outline' : 'bulb-outline'}
              size={15}
              color={colors.muted}
            />
            <Text style={styles.resultText}>{isCorrect ? 'Correct.' : 'Interesting choice'}</Text>
          </View>
          <Text style={[styles.reveal, scale.body]}>{content.reveal}</Text>
        </>
      )}
      </View>

      {/* Unanswered, the options ARE the foot — the quote takes the height
          above and the only thing you can tap sits in the thumb's reach.
          Answered, the reveal is the payoff and there is nothing left to
          act on, so the card keeps no foot. */}
      {!answered && <CardFoot>{optionList}</CardFoot>}
    </View>
  );
}

const styles = StyleSheet.create({
  quote: {
    ...type.title,
    marginBottom: 10,
  },
  prompt: {
    ...type.micro,
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
  resultContainer: {
    marginTop: 16,
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
});

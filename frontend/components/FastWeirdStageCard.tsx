import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { cards, colors, stageType } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

interface NumberGuess {
  prompt: string;
  options: string[];
  answer: string;
  reveal?: string;
}

interface Props {
  content: {
    headline: string;
    facts: string[];
    guess?: NumberGuess;
  };
}

// PREVIEW — the Wait... What? card on the Gentle Reminder stage treatment,
// so the template can be judged on a no-illustration card before rollout.
// FastWeirdCard (the shipped layout) is untouched; app/index.tsx picks this
// one only while the stage preview flag is on.
//
// Where the Gentle Reminder's illustration sits, this card has only a short
// rule: with no art to absorb the spare height, the slack falls below the
// facts, the same way the reference lets it fall below the body.
export default function FastWeirdStageCard({ content }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const guess = content.guess?.options?.length ? content.guess : null;
  const answered = selected !== null;
  const isCorrect = guess ? selected === guess.answer : false;

  const facts = (
    <View style={styles.facts}>
      {content.facts.map((fact, i) => (
        <Text key={i} style={[stageType.body, styles.prose]}>
          {fact}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={cards.stage}>
      {/* The card is pinned between chrome and footer; overflow (a long
          answered guess especially) scrolls inside it so the card never
          slides under the pill. */}
      <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={stageType.eyebrow}>Wait... What?</Text>
      <Text style={[stageType.headline, styles.subheading]}>{content.headline}</Text>

      <View style={styles.rule} />

      {guess ? (
        <>
          <Text style={[stageType.body, styles.prose]}>{guess.prompt}</Text>

          <View style={styles.options}>
            {guess.options.map((option, i) => {
              const isSelected = selected === option;
              const isCorrectOption = answered && option === guess.answer;
              const isWrongSelection = answered && isSelected && !isCorrect;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    isCorrectOption && styles.optionCorrect,
                    isWrongSelection && styles.optionWrong,
                  ]}
                  onPress={() => {
                    if (answered) return;
                    setSelected(option);
                    recordGuess(); // depth action; fire-and-forget
                  }}
                  disabled={answered}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option}</Text>
                  {isCorrectOption && (
                    <Ionicons name="checkmark" size={16} color={colors.ink} />
                  )}
                  {isWrongSelection && (
                    <Ionicons name="close" size={16} color={colors.muted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {answered && (
            <>
              <Text style={styles.result}>
                {isCorrect ? 'Correct.' : 'Interesting choice'}
              </Text>
              {facts}
              {!!guess.reveal && (
                <Text style={[stageType.body, styles.prose, styles.reveal]}>{guess.reveal}</Text>
              )}
            </>
          )}
        </>
      ) : (
        facts
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stands in for the illustration band: a short centred rule, the same
  // 22pt above and below the art frame keeps.
  rule: {
    width: 44,
    height: 1,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: 22,
    marginBottom: 22,
  },
  facts: {
    gap: 16,
  },
  // This card's headline is a small muted sub-heading under the eyebrow, not
  // the near-equal second line the Gentle Reminder has (user-set: 17, muted).
  subheading: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  // Body copy reads as prose on this card, not as a caption — left-aligned
  // (was justified, before that centred; the centred stageType.body stays
  // for the Gentle Reminder).
  prose: {
    textAlign: 'left',
  },
  options: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  optionSelected: {
    borderColor: colors.ink,
  },
  optionCorrect: {
    borderColor: colors.ink,
    backgroundColor: colors.surfaceTinted,
  },
  optionWrong: {
    borderColor: colors.line,
    backgroundColor: colors.surfaceTinted,
  },
  optionText: {
    fontSize: 19,
    lineHeight: 25,
    color: colors.ink,
    textAlign: 'center',
  },
  result: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 16,
  },
  reveal: {
    marginTop: 16,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cards, colors, stageType } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

interface MiniGameStageCardProps {
  content: {
    game_type: string;
    prompt: string;
    options: string[];
    correct_answer: string;
    reveal?: string;
  };
}

// PREVIEW — the mini games (Predict Outcome, Fact or Myth, ...) on the
// stage treatment (see FastWeirdStageCard for the pattern; MiniGameCard is
// the shipped layout and stays untouched). The game label is the eyebrow —
// it changes per card, unlike the fixed labels of the other stage types —
// and the prompt is the sub-heading the question hangs from.
export default function MiniGameStageCard({ content }: MiniGameStageCardProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const answered = selected !== null;
  const isCorrect = selected === content.correct_answer;

  const eyebrow = {
    fact_vs_fiction: 'Fact or Myth',
    predict_outcome: 'Predict Outcome',
    arrange_steps: 'Arrange Steps',
    guess_scale: 'Guess Scale',
  }[content.game_type] || 'Mini Game';

  return (
    <View style={cards.stage}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={stageType.eyebrow}>{eyebrow}</Text>
        <Text style={[stageType.headline, styles.subheading]}>{content.prompt}</Text>

        <View style={styles.rule} />

        <View style={styles.options}>
          {content.options.map((option, i) => {
            const isSelected = selected === option;
            const isCorrectOption = answered && option === content.correct_answer;
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

            {/* The payoff — where the belief came from, not just the verdict. */}
            {!!content.reveal && (
              <Text style={[stageType.body, styles.prose]}>{content.reveal}</Text>
            )}

            <TouchableOpacity
              style={styles.gameRoomLink}
              onPress={() => router.push('/play')}
              activeOpacity={0.7}
            >
              <Ionicons name="game-controller-outline" size={15} color={colors.muted} />
              <Text style={styles.gameRoomText}>Want a real run? Visit the Game Room</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.muted} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subheading: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  rule: {
    width: 44,
    height: 1,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: 22,
    marginBottom: 22,
  },
  options: {
    alignSelf: 'stretch',
    gap: 10,
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
  prose: {
    textAlign: 'left',
  },
  gameRoomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 11,
  },
  gameRoomText: {
    fontSize: 15,
    color: colors.muted,
  },
});

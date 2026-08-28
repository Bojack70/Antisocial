import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CardHeader from './CardHeader';
import { cards, colors, type, accents } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

interface MiniGameCardProps {
  content: {
    game_type: string;
    prompt: string;
    options: string[];
    correct_answer: string;
    // The line that turns a right/wrong answer into an "oh — really?".
    // Without it a Fact-or-Myth card just scores you and moves on.
    reveal?: string;
    rarity?: string;
    tags?: string[];
  };
}

export default function MiniGameCard({ content }: MiniGameCardProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setShowResult(true);
    recordGuess(); // depth action; fire-and-forget, the UI never waits on it
  };

  const isCorrect = selectedOption === content.correct_answer;

  const gameTypeLabel = {
    fact_vs_fiction: 'Fact or Myth',
    predict_outcome: 'Predict Outcome',
    arrange_steps: 'Arrange Steps',
    guess_scale: 'Guess Scale',
  }[content.game_type] || 'Mini Game';

  return (
    <View style={cards.white}>
      <CardHeader icon="game-controller-outline" color={accents.play} label={gameTypeLabel} />

      <Text style={styles.prompt}>{content.prompt}</Text>
      
      <View style={styles.optionsContainer}>
        {content.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = showResult && option === content.correct_answer;
          const isWrongSelection = showResult && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                isCorrectOption && styles.optionCardCorrect,
                isWrongSelection && styles.optionCardWrong,
              ]}
              onPress={() => !showResult && handleSelect(option)}
              disabled={showResult}
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
      
      {showResult && (
        <View>
          <View
            style={[
              styles.resultContainer,
              isCorrect ? styles.resultCorrect : styles.resultWrong,
            ]}
          >
            <Ionicons
              name={isCorrect ? 'happy-outline' : 'bulb-outline'}
              size={15}
              color={colors.muted}
            />
            <Text style={styles.resultText}>
              {isCorrect ? 'Correct.' : 'Interesting choice'}
            </Text>
          </View>

          {/* The payoff. Being told you were wrong is worth nothing on its own —
              what makes the card land is finding out where the belief came from. */}
          {!!content.reveal && <Text style={styles.reveal}>{content.reveal}</Text>}
        </View>
      )}

      {showResult && (
        <TouchableOpacity
          style={styles.timelineLink}
          onPress={() => router.push('/play')}
          activeOpacity={0.7}
        >
          <Ionicons name="game-controller-outline" size={13} color={colors.body} />
          <Text style={styles.timelineLinkText}>Want a real run? Visit the Game Room</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.body} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    ...type.title,
    marginBottom: 16,
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
  resultCorrect: {},
  resultWrong: {},
  resultText: {
    ...type.micro,
  },
  reveal: {
    ...type.body,
    marginTop: 10,
  },
  timelineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  timelineLinkText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.body,
  },
});

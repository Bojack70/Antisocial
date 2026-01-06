import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MiniGameCardProps {
  content: {
    game_type: string;
    prompt: string;
    options: string[];
    correct_answer: string;
    rarity?: string;
    tags?: string[];
  };
}

export default function MiniGameCard({ content }: MiniGameCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setShowResult(true);
  };

  const isCorrect = selectedOption === content.correct_answer;

  const gameTypeLabel = {
    fact_vs_fiction: 'Fact vs Fiction',
    predict_outcome: 'Predict Outcome',
    arrange_steps: 'Arrange Steps',
    guess_scale: 'Guess Scale',
  }[content.game_type] || 'Mini Game';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="game-controller-outline" size={20} color="#ec4899" />
        <Text style={styles.cardType}>{gameTypeLabel}</Text>
      </View>
      
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
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              )}
              {isWrongSelection && (
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showResult && (
        <View
          style={[
            styles.resultContainer,
            isCorrect ? styles.resultCorrect : styles.resultWrong,
          ]}
        >
          <Ionicons
            name={isCorrect ? 'happy-outline' : 'bulb-outline'}
            size={20}
            color={isCorrect ? '#10b981' : '#f59e0b'}
          />
          <Text style={styles.resultText}>
            {isCorrect ? 'You got it!' : 'Interesting choice'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardType: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '600',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262626',
  },
  optionCardSelected: {
    borderColor: '#ec4899',
  },
  optionCardCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  optionCardWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444410',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  optionTextBold: {
    fontWeight: '600',
    color: '#f9fafb',
  },
  resultContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  resultCorrect: {
    backgroundColor: '#10b98110',
    borderLeftColor: '#10b981',
  },
  resultWrong: {
    backgroundColor: '#f59e0b10',
    borderLeftColor: '#f59e0b',
  },
  resultText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '600',
  },
});

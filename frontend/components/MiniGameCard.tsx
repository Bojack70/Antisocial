import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CardHeader from './CardHeader';

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
  const router = useRouter();
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
      <CardHeader icon="game-controller-outline" color="#ec4899" label={gameTypeLabel} />

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

      {showResult && (
        <TouchableOpacity
          style={styles.timelineLink}
          onPress={() => router.push('/play')}
          activeOpacity={0.7}
        >
          <Ionicons name="game-controller-outline" size={15} color="#6B6D76" />
          <Text style={styles.timelineLinkText}>Want a real run? Visit the Game Room</Text>
          <Ionicons name="arrow-forward" size={14} color="#6B6D76" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECE9',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#16171A',
    marginBottom: 16,
    lineHeight: 25,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDDDDA',
  },
  optionCardSelected: {
    borderColor: '#ec4899',
  },
  optionCardCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#10b98114',
  },
  optionCardWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444414',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#3A3B3E',
    lineHeight: 20,
  },
  optionTextBold: {
    fontWeight: '700',
    color: '#16171A',
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
    backgroundColor: '#10b98114',
    borderLeftColor: '#10b981',
  },
  resultWrong: {
    backgroundColor: '#f59e0b14',
    borderLeftColor: '#f59e0b',
  },
  resultText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3A3B3E',
    fontWeight: '600',
  },
  timelineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DDDDDA',
  },
  timelineLinkText: {
    fontSize: 13,
    color: '#6B6D76',
    fontWeight: '500',
  },
});

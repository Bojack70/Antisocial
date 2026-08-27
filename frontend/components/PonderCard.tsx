import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';

interface PonderCardProps {
  content: {
    image_url: string;
    question: string;
    options: string[];
    rarity?: string;
    tags?: string[];
  };
}

export default function PonderCard({ content }: PonderCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="infinite-outline" size={20} color="#8b5cf6" />
        <Text style={styles.cardType}>Ponder & Play</Text>
      </View>
      
      {content.image_url && (
        <Image
          source={{ uri: content.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <Text style={styles.question}>{content.question}</Text>
      
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
                selectedOption === index && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
            {selectedOption === index && (
              <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedOption !== null && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>No right answer. Just you thinking.</Text>
        </View>
      )}
      
      <ReactionButtons reactions={['I’m Unsure', 'Lingering', 'Stayed With Me']} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECE9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardType: {
    fontSize: 15,
    color: '#6B6D76',
    marginLeft: 9,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#F5F5F3',
  },
  question: {
    fontSize: 19,
    fontWeight: '700',
    color: '#16171A',
    marginBottom: 16,
    lineHeight: 26,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DDDDDA',
  },
  optionCardSelected: {
    borderColor: '#8b5cf6',
  },
  optionText: {
    fontSize: 14,
    color: '#3A3B3E',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#16171A',
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 6,
    padding: 12,
    backgroundColor: '#F5F5F3',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 13,
    color: '#6B6D76',
    fontStyle: 'italic',
  },
});

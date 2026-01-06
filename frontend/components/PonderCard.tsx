import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  question: {
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
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf610',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#f9fafb',
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
  responseText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

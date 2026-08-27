import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';

const { width } = Dimensions.get('window');

interface AlmostNothingCardProps {
  content: {
    text: string;
  };
}

export default function AlmostNothingCard({ content }: AlmostNothingCardProps) {
  // PRD Reactions for this specific vibe
  const reactions = ['Let It Pass', 'Noted', 'Stayed With Me'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="sunny-outline" size={17} color="#3F9A6C" />
        </View>
        <Text style={styles.label}>Gentle Reminder</Text>
      </View>
      <Text style={styles.text}>{content.text}</Text>
      <ReactionButtons reactions={reactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32, // container padding is 16 on each side
    backgroundColor: '#E9F6EE',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D8EEDF',
    padding: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D8EEDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#3F9A6C',
    fontWeight: '700',
  },
  text: {
    fontSize: 21,
    color: '#16171A',
    fontWeight: '700',
    lineHeight: 28,
  },
});

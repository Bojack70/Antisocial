import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';

const { width } = Dimensions.get('window');

interface QuietContradictionCardProps {
  content: {
    statement1: string;
    statement2: string;
  };
}

export default function QuietContradictionCard({ content }: QuietContradictionCardProps) {
  const reactions = ['Unsettling', 'I’m Unsure', 'Noted', 'Stayed With Me'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="contrast-outline" size={20} color="#64748b" />
        <Text style={styles.label}>Quiet Contradiction</Text>
      </View>

      <View style={styles.statementContainer}>
        <Text style={styles.statementText}>{content.statement1}</Text>
      </View>

      {/* Subtle visual separator to indicate the gap/unresolved nature */}
      <View style={styles.separator} />

      <View style={styles.statementContainer}>
        <Text style={styles.statementText}>{content.statement2}</Text>
      </View>

      <ReactionButtons reactions={reactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ECECE9',
    padding: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    color: '#6B6D76',
    fontWeight: '600',
  },
  statementContainer: {
    marginBottom: 16,
  },
  statementText: {
    fontSize: 19,
    color: '#16171A',
    lineHeight: 28,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    width: 28,
    backgroundColor: '#ECECE9',
    marginVertical: 20,
  },
});

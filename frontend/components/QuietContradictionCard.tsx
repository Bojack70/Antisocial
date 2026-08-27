import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';

interface QuietContradictionCardProps {
  content: {
    statement1: string;
    statement2: string;
    tags?: string[];
  };
}

export default function QuietContradictionCard({ content }: QuietContradictionCardProps) {
  const reactions = ['Unsettling', 'I’m Unsure', 'Noted', 'Stayed With Me'];

  return (
    <View style={styles.container}>
      <CardHeader icon="contrast-outline" color="#64748b" label="Quiet Contradiction" />

      <Text style={styles.statementText}>{content.statement1}</Text>

      {/* Subtle visual separator to indicate the gap/unresolved nature */}
      <View style={styles.separator} />

      <Text style={styles.statementText}>{content.statement2}</Text>

      <ReactionButtons reactions={reactions} tags={content.tags} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECECE9',
    padding: 20,
    marginBottom: 16,
  },
  statementText: {
    fontSize: 17,
    color: '#16171A',
    lineHeight: 26,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    width: 28,
    backgroundColor: '#DDDDDA',
    marginVertical: 18,
  },
});

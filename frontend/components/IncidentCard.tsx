import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';

interface IncidentCardProps {
  content: {
    hook: string;
    story: string[];
    rarity?: string;
    tags?: string[];
  };
}

export default function IncidentCard({ content }: IncidentCardProps) {
  return (
    <View style={styles.card}>
      <CardHeader icon="newspaper-outline" color="#f59e0b" label="Quietly Fascinating" />

      <Text style={styles.hook}>{content.hook}</Text>

      <View style={styles.storyContainer}>
        {content.story.map((line, index) => (
          <Text key={index} style={styles.storyLine}>
            {line}
          </Text>
        ))}
      </View>

      <ReactionButtons
        reactions={['Let It Pass', 'Unexpected', 'Makes Sense']}
        tags={content.tags}
      />
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
  hook: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#16171A',
    marginBottom: 12,
    lineHeight: 25,
  },
  storyContainer: {
    gap: 10,
    marginBottom: 12,
  },
  storyLine: {
    fontSize: 15,
    color: '#5B5D63',
    lineHeight: 22,
  },
});

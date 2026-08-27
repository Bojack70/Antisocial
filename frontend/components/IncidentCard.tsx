import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';

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
      <View style={styles.header}>
        <Ionicons name="newspaper-outline" size={20} color="#f59e0b" />
        <Text style={styles.cardType}>Quietly Fascinating</Text>
      </View>
      
      <Text style={styles.hook}>{content.hook}</Text>
      
      <View style={styles.storyContainer}>
        {content.story.map((line, index) => (
          <Text key={index} style={styles.storyLine}>
            {line}
          </Text>
        ))}
      </View>
      
      <ReactionButtons reactions={['Let It Pass', 'Unexpected', 'Makes Sense']} />
      
      {content.tags && content.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {content.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
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
  hook: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16171A',
    marginBottom: 14,
    lineHeight: 28,
  },
  storyContainer: {
    gap: 12,
    marginBottom: 12,
  },
  storyLine: {
    fontSize: 15,
    color: '#5B5D63',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F5F5F3',
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#6B6D76',
  },
});

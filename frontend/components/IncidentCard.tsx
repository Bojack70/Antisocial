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
      
      <ReactionButtons reactions={['I’d Forgotten This Happens', 'Unexpected', 'Makes Sense']} />
      
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
  hook: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
    lineHeight: 28,
  },
  storyContainer: {
    gap: 12,
    marginBottom: 12,
  },
  storyLine: {
    fontSize: 15,
    color: '#d1d5db',
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
    backgroundColor: '#1f1f1f',
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

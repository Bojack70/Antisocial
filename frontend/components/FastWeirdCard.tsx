import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';

interface FastWeirdCardProps {
  content: {
    headline: string;
    facts: string[];
    rarity?: string;
    tags?: string[];
  };
}

export default function FastWeirdCard({ content }: FastWeirdCardProps) {
  const rarityColor = {
    common: '#6b7280',
    uncommon: '#8b5cf6',
    rare: '#f59e0b',
  }[content.rarity || 'common'];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="flash-outline" size={20} color="#6366f1" />
        <Text style={styles.cardType}>Wait... What?</Text>
        {content.rarity && content.rarity !== 'common' && (
          <View style={[styles.rarityBadge, { borderColor: rarityColor }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {content.rarity}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.headline}>{content.headline}</Text>
      
      <View style={styles.factsContainer}>
        {content.facts.map((fact, index) => (
          <View key={index} style={styles.factRow}>
            <View style={styles.bullet} />
            <Text style={styles.fact}>{fact}</Text>
          </View>
        ))}
      </View>
      
      <ReactionButtons reactions={['Unexpected', 'Didn\u2019t know this', 'Makes Sense']} />
      
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
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
    lineHeight: 28,
  },
  factsContainer: {
    gap: 12,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginTop: 7,
    marginRight: 12,
  },
  fact: {
    flex: 1,
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

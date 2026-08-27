import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';

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
      <CardHeader
        icon="flash-outline"
        color="#6366f1"
        label="Wait... What?"
        badge={
          content.rarity && content.rarity !== 'common' ? (
            <View style={[styles.rarityBadge, { borderColor: rarityColor }]}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {content.rarity}
              </Text>
            </View>
          ) : undefined
        }
      />

      <Text style={styles.headline}>{content.headline}</Text>

      <View style={styles.factsContainer}>
        {content.facts.map((fact, index) => (
          <View key={index} style={styles.factRow}>
            <View style={styles.bullet} />
            <Text style={styles.fact}>{fact}</Text>
          </View>
        ))}
      </View>

      <ReactionButtons
        reactions={['Unexpected', 'Unsettling', 'Makes Sense']}
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
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: '#16171A',
    marginBottom: 12,
    lineHeight: 25,
  },
  factsContainer: {
    gap: 10,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginTop: 8,
    marginRight: 11,
  },
  fact: {
    flex: 1,
    fontSize: 15,
    color: '#5B5D63',
    lineHeight: 22,
  },
});

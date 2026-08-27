import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';

interface FastWeirdCardProps {
  content: {
    headline: string;
    facts: string[];
    rarity?: string;
    tags?: string[];
  };
}

export default function FastWeirdCard({ content }: FastWeirdCardProps) {
  return (
    <View style={cards.white}>
      <CardHeader
        icon="flash-outline"
        color="#6366f1"
        label="Wait... What?"
        badge={
          content.rarity && content.rarity !== 'common' ? (
            <Text style={styles.rarityText}>{content.rarity}</Text>
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
  rarityText: {
    ...type.micro,
  },
  headline: {
    ...type.title,
    marginBottom: 14,
  },
  factsContainer: {
    gap: 10,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.muted,
    marginTop: 10,
    marginRight: 11,
  },
  fact: {
    ...type.body,
    flex: 1,
  },
});

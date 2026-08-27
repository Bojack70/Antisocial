import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, type } from '../lib/theme';

interface IncidentCardProps {
  content: {
    hook: string;
    story: string[];
    rarity?: string;
    tags?: string[];
  };
}

// A story card, so it takes the dark surface — the narrative types are
// the ones that carry the feed's rhythm.
export default function IncidentCard({ content }: IncidentCardProps) {
  return (
    <View style={cards.dark}>
      <CardHeader icon="newspaper-outline" color="#f59e0b" label="Quietly Fascinating" tone="dark" />

      <Text style={styles.hook}>{content.hook}</Text>

      <View style={styles.storyContainer}>
        {content.story.map((line, index) => (
          <Text key={index} style={type.bodyOnDark}>
            {line}
          </Text>
        ))}
      </View>

      <ReactionButtons
        reactions={['Let It Pass', 'Unexpected', 'Makes Sense']}
        tags={content.tags}
        tone="dark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hook: {
    ...type.titleOnDark,
    marginBottom: 14,
  },
  storyContainer: {
    gap: 12,
  },
});

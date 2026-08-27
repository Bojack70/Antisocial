import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, type } from '../lib/theme';

interface AlmostNothingCardProps {
  content: {
    text: string;
  };
}

export default function AlmostNothingCard({ content }: AlmostNothingCardProps) {
  // PRD Reactions for this specific vibe
  const reactions = ['Let It Pass', 'Noted', 'Stayed With Me'];

  // First line is the nudge; the rest makes it land.
  const [firstLine, ...restLines] = content.text.split('\n');
  const rest = restLines.join('\n').trim();

  return (
    <View style={cards.mint}>
      <CardHeader icon="sunny-outline" color="#3F9A6C" label="Gentle Reminder" />
      <Text style={styles.text}>{firstLine}</Text>
      {rest.length > 0 && <Text style={styles.subText}>{rest}</Text>}
      <ReactionButtons reactions={reactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...type.title,
  },
  subText: {
    ...type.body,
    marginTop: 10,
  },
});

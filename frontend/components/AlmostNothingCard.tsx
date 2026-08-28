import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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

  // First line is the nudge; the rest makes it land. Staged reveal (spec
  // item 7): the rest waits behind a quiet tap, so the first line gets a
  // beat to itself. Single-line cards render exactly as before.
  const [firstLine, ...restLines] = content.text.split('\n');
  const rest = restLines.join('\n').trim();
  const [unfolded, setUnfolded] = useState(false);

  return (
    <View style={cards.mint}>
      <CardHeader icon="sunny-outline" color="#3F9A6C" label="Gentle Reminder" />
      <Text style={styles.text}>{firstLine}</Text>
      {rest.length > 0 && !unfolded && (
        <TouchableOpacity
          style={styles.unfoldRow}
          onPress={() => setUnfolded(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.unfoldText}>· · ·</Text>
        </TouchableOpacity>
      )}
      {rest.length > 0 && unfolded && <Text style={styles.subText}>{rest}</Text>}
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
  unfoldRow: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 16,
  },
  unfoldText: {
    ...type.body,
    color: '#3F9A6C',
    letterSpacing: 2,
  },
});

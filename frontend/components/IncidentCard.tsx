import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import { cards, colors, type, accents } from '../lib/theme';

interface IncidentCardProps {
  content: {
    hook: string;
    story: string[];
    rarity?: string;
    tags?: string[];
  };
}

// On the same light surface as every other card since the finalized
// design (2026-08-31) — the dark narrative surface was retired for
// uniformity.
//
// The story unfolds one line per tap. Committing to "what happened next?"
// is what turns a 10-second skim into a story actually followed — the
// reader earns each line instead of receiving all of them at once.
export default function IncidentCard({ content }: IncidentCardProps) {
  const [revealed, setRevealed] = useState(1);
  const total = content.story.length;
  const done = revealed >= total;

  return (
    <View style={cards.white}>
      <CardHeader icon="newspaper-outline" color={accents.curiosity} label="Quietly Fascinating" />

      <Text style={styles.hook}>{content.hook}</Text>

      <View style={styles.storyContainer}>
        {content.story.slice(0, revealed).map((line, index) => (
          <Text key={index} style={type.body}>
            {line}
          </Text>
        ))}
      </View>

      {!done && (
        <TouchableOpacity
          style={styles.nextRow}
          onPress={() => setRevealed(revealed + 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.nextText}>
            {revealed === 1 ? 'What happened next?' : 'And then?'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </TouchableOpacity>
      )}

      {/* Reactions wait for the whole story; reacting to half of one
          would be reacting to a cliffhanger, not an incident. */}
      {done && (
        <ReactionButtons
          reactions={['Let It Pass', 'Unexpected', 'Makes Sense']}
          tags={content.tags}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hook: {
    ...type.title,
    marginBottom: 14,
  },
  storyContainer: {
    gap: 12,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  nextText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.body,
  },
});

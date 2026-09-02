import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';

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
  const scale = cardScale(content.hook, content.story.slice(0, revealed));

  return (
    <View style={[cards.white, cards.fill]}>
      <View>
      <CardHeader icon="newspaper-outline" color={accents.curiosity} label="Quietly Fascinating" />

      <Text style={[styles.hook, scale.title]}>{content.hook}</Text>

      <View style={styles.storyContainer}>
        {content.story.slice(0, revealed).map((line, index) => (
          <Text key={index} style={[type.body, scale.body]}>
            {line}
          </Text>
        ))}
      </View>

      </View>

      {/* The foot holds whichever closing element the card is on: the
          reveal control while the story is unfinished, the chips once it
          is. Reactions wait for the whole story — reacting to half of one
          would be reacting to a cliffhanger, not an incident. */}
      {done ? (
        <CardFoot ruled>
          <ReactionButtons
            reactions={['Let It Pass', 'Unexpected', 'Makes Sense']}
            flush
          />
        </CardFoot>
      ) : (
        <CardFoot>
          <TouchableOpacity
            style={styles.nextRow}
            onPress={() => setRevealed(revealed + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.nextText}>
              {revealed === 1 ? 'What happened next?' : 'And then?'}
            </Text>
            <Ionicons name="chevron-down" size={15} color={colors.muted} />
          </TouchableOpacity>
        </CardFoot>
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
  // Pinned to the card's bottom edge now, which makes it the card's one
  // target — so it takes the full width and clears the 44px touch floor
  // (it was 37px inline).
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  nextText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.body,
  },
});

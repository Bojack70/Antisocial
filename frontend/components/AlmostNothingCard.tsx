import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import ReactionButtons from './ReactionButtons';
import CardArt from './CardArt';
import { cards, stageType, colors } from '../lib/theme';

interface AlmostNothingCardProps {
  content: {
    text: string;
  };
}

// TRIAL CARD — the only card on the swipe-mockup treatment so far.
//
// What changed against the rest of the feed: the card fills its page rather
// than hugging its text, the uppercase eyebrow is replaced by the mockup's
// two-line centred serif title, and everything inside is centred. The
// action that used to be a row of reaction pills is now the bottom-anchored
// pill button the reference has.
export default function AlmostNothingCard({ content }: AlmostNothingCardProps) {
  const reactions = ['Let It Pass', 'Noted', 'Stayed With Me'];

  // First line is the nudge; the rest makes it land. Staged reveal: the
  // rest waits behind a quiet tap, so the first line gets a beat to itself.
  const [firstLine, ...restLines] = content.text.split('\n');
  const rest = restLines.join('\n').trim();
  const [unfolded, setUnfolded] = useState(false);

  return (
    <View style={cards.stage}>
      <Text style={stageType.eyebrow}>Gentle Reminder:</Text>
      <Text style={stageType.headline}>{firstLine}</Text>

      <View style={styles.art}>
        <CardArt name="window" />
      </View>

      {rest.length > 0 && !unfolded && (
        <TouchableOpacity
          style={styles.unfoldRow}
          onPress={() => setUnfolded(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.unfoldText}>· · ·</Text>
        </TouchableOpacity>
      )}
      {rest.length > 0 && unfolded && <Text style={stageType.body}>{rest}</Text>}

      {/* The spacer is what pins the reactions to the bottom of the card
          however tall the text above happens to be. */}
      <View style={styles.spacer} />

      <View style={styles.reactions}>
        <ReactionButtons reactions={reactions} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    marginTop: 22,
    marginBottom: 20,
  },
  spacer: {
    flex: 1,
    minHeight: 8,
  },
  reactions: {
    alignItems: 'center',
  },
  unfoldRow: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  unfoldText: {
    fontSize: 15,
    letterSpacing: 5,
    color: colors.sage,
  },
});

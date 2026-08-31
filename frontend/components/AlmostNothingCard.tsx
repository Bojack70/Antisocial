import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Text from './AppText';
import { cards, stageType } from '../lib/theme';

interface AlmostNothingCardProps {
  content: {
    text: string;
  };
}

// Built to the swipe reference, and the only card on that treatment so far.
//
// Against the rest of the feed: no uppercase eyebrow and no reaction pills —
// the reference has neither, and the action now lives in the footer button.
// The illustration takes whatever height is left between the title and the
// body, so the card fills its page on a tall screen without a hole in it.
export default function AlmostNothingCard({ content }: AlmostNothingCardProps) {
  const [firstLine, ...restLines] = content.text.split('\n');
  const rest = restLines.join('\n').trim();

  return (
    <View style={cards.stage}>
      <Text style={stageType.eyebrow}>Gentle Reminder:</Text>
      <Text style={stageType.headline}>{firstLine}</Text>

      <View style={styles.artFrame}>
        <Image
          source={require('../assets/art/pause-woman.png')}
          style={styles.art}
          resizeMode="cover"
        />
      </View>

      {rest.length > 0 && <Text style={stageType.body}>{rest}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // Locked to the reference's landscape shape — bounded flex let the height
  // fill push it past square into a portrait the mock never shows. The
  // card's spare height falls below the body copy (cards.stage is
  // top-anchored, the way the reference keeps its title pinned to the top).
  artFrame: {
    width: '100%',
    aspectRatio: 1.25,
    marginTop: 22,
    marginBottom: 22,
    borderRadius: 14,
    overflow: 'hidden',
  },
  art: {
    width: '100%',
    height: '100%',
  },
});

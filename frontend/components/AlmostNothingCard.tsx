import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardAction from './CardAction';
import { useDeckAdvance } from './DeckContext';
import { cards, type, accents } from '../lib/theme';
import { recordReminderDone } from '../lib/weekLedger';

interface AlmostNothingCardProps {
  content: {
    text: string;
  };
}

// The finalized structure every card follows: icon + label header, then a
// left-aligned title — with the one privilege no other card keeps: an
// illustration. No tags and no reaction pills, deliberately; this card
// interrupts rather than informs, and asks for nothing back.
export default function AlmostNothingCard({ content }: AlmostNothingCardProps) {
  const [firstLine, ...restLines] = content.text.split('\n');
  const rest = restLines.join('\n').trim();
  const [done, setDone] = useState(false);
  const advance = useDeckAdvance();

  return (
    <View style={cards.white}>
      <CardHeader icon="sunny-outline" color={accents.calm} label="Gentle Reminder" />

      <Text style={styles.title}>{firstLine}</Text>

      <View style={styles.artFrame}>
        <Image
          source={require('../assets/art/pause-woman.png')}
          style={styles.art}
          resizeMode="cover"
        />
      </View>

      {rest.length > 0 && <Text style={styles.body}>{rest}</Text>}

      {/* Honor-system, like the Field Trip: the tap says the pause was
          actually taken, records it, and moves the deck on — the reminder
          is complete the moment it happened, so there is nothing to stay
          for. */}
      <CardAction
        label="Done. That’s it."
        done={done}
        doneLine="Noted."
        onPress={() => {
          if (done) return;
          setDone(true);
          recordReminderDone(); // depth action; fire-and-forget
          advance?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
  },
  // Locked landscape — flex-sized versions of this frame have twice drifted
  // portrait on tall screens.
  artFrame: {
    width: '100%',
    aspectRatio: 1.25,
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  art: {
    width: '100%',
    height: '100%',
  },
  body: {
    ...type.body,
    marginTop: 16,
  },
});

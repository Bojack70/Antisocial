import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import CardAction from './CardAction';
import { useDeckAdvance } from './DeckContext';
import { cards, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
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
  const scale = cardScale(content.text);

  return (
    <View style={[cards.white, cards.fill]}>
      {/* The art frame flexes, so this card's spare height goes INTO the
          illustration instead of falling out as a gap above the button. */}
      <View style={styles.top}>
      <CardHeader icon="sunny-outline" color={accents.calm} label="Gentle Reminder" />

      <Text style={[styles.title, scale.title]}>{firstLine}</Text>

      <View style={[styles.artFrame, cards.artFill]}>
        <Image
          source={require('../assets/art/pause-woman.png')}
          style={styles.art}
          resizeMode="cover"
        />
      </View>

      {rest.length > 0 && <Text style={[styles.body, scale.body]}>{rest}</Text>}

      {/* Honor-system, like the Field Trip: the tap says the pause was
          actually taken, records it, and moves the deck on — the reminder
          is complete the moment it happened, so there is nothing to stay
          for. */}
      </View>

      <CardFoot>
      <CardAction
        label="Done. That’s it."
        done={done}
        doneLine="Noted."
        flush
        onPress={() => {
          if (done) return;
          setDone(true);
          recordReminderDone(); // depth action; fire-and-forget
          advance?.();
        }}
      />
      </CardFoot>
    </View>
  );
}

const styles = StyleSheet.create({
  // Column, so the flexing art frame has an axis to grow along.
  top: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
  },
  title: {
    ...type.title,
  },
  // Locked landscape — flex-sized versions of this frame have twice drifted
  // portrait on tall screens.
  // No aspectRatio any more: it fights `cards.artFill`'s flex height (both
  // try to size the box, and the ratio wins, so the frame stops growing).
  // The 240–400 band does the job the ratio used to — it keeps the art from
  // ballooning portrait on a tall page, which is the failure the ratio was
  // added for in the first place.
  artFrame: {
    width: '100%',
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

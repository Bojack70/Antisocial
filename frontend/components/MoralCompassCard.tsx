import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardAction from './CardAction';
import { cards, type, accents } from '../lib/theme';
import { MoralCompassDefinition } from '../data/moralCompass';
import { recordGoodTurnDone } from '../lib/moralCompass';

interface MoralCompassCardProps {
  entry: MoralCompassDefinition;
}

const SCALE_LABEL: Record<MoralCompassDefinition['scale'], string> = {
  now: 'BEFORE THE NEXT CARD',
  today: 'TODAY',
  week: 'THIS WEEK',
};

// Moral Compass: one act pointed outward, at someone who isn't you. It
// rides mid-slate rather than at the end, because the Field Trip owns the
// exit ramp and two "go do something" cards back to back cancel out.
//
// Deliberately un-instrumented beyond a tally: no proof, no recipient in
// the app, no reason given for why you should. The card names the act and
// stops — a card headed MORAL COMPASS that also explains itself is the
// preaching users left other wellbeing apps over.
export default function MoralCompassCard({ entry }: MoralCompassCardProps) {
  const [done, setDone] = useState(false);

  const handleDone = () => {
    if (done) return;
    setDone(true);
    recordGoodTurnDone(); // fire-and-forget; nothing depends on the count
  };

  return (
    <View style={cards.tinted}>
      <CardHeader
        icon="navigate-outline"
        color={accents.calm}
        label="Moral Compass"
      />

      <Text style={styles.text}>{entry.text}</Text>
      {!!entry.note && <Text style={styles.note}>{entry.note}</Text>}

      {done ? (
        // No congratulation. The whole point of the card is that nobody
        // was watching, and the app is nobody.
        <Text style={styles.confirmation}>Nobody will ever know.</Text>
      ) : (
        <>
          <Text style={styles.scale}>{SCALE_LABEL[entry.scale]}</Text>
          <CardAction label={entry.cta ?? 'Done'} onPress={handleDone} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...type.title,
  },
  note: {
    ...type.body,
    marginTop: 10,
  },
  scale: {
    ...type.micro,
    marginTop: 16,
  },
  confirmation: {
    ...type.micro,
    marginTop: 16,
  },
});

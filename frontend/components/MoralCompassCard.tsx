import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardAction from './CardAction';
import CardFoot from './CardFoot';
import { cards, fonts, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
import { MoralCompassDefinition } from '../data/moralCompass';
import { recordGoodTurnDone } from '../lib/moralCompass';

interface MoralCompassCardProps {
  entry: MoralCompassDefinition;
}

const SCALE_LABEL: Record<MoralCompassDefinition['scale'], string> = {
  now: 'Before the next card',
  today: 'Today',
  week: 'This week',
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
  const scale = cardScale(entry.text, entry.note);

  const handleDone = () => {
    if (done) return;
    setDone(true);
    recordGoodTurnDone(); // fire-and-forget; nothing depends on the count
  };

  return (
    <View style={[cards.tinted, cards.fill]}>
      <View>
        <CardHeader
          icon="navigate-outline"
          color={accents.calm}
          label="Moral Compass"
        />

        {/* `regular` goes LAST: scale.title carries the bold family, so a
            weight set before it is silently overridden. */}
        <Text style={[styles.text, scale.title, styles.regular]}>{entry.text}</Text>
        {!!entry.note && <Text style={[styles.note, scale.body]}>{entry.note}</Text>}
      </View>

      {done ? (
        // No congratulation. The whole point of the card is that nobody
        // was watching, and the app is nobody.
        <CardFoot>
          <Text style={styles.confirmation}>Nobody will ever know.</Text>
        </CardFoot>
      ) : (
        <CardFoot meta={SCALE_LABEL[entry.scale]}>
          <CardAction label={entry.cta ?? 'Done'} onPress={handleDone} flush />
        </CardFoot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...type.title,
  },
  // The regular serif, not the bold one other cards use for a title (user
  // call, 2026-09-02). The act is an instruction, not a headline, and set
  // bold at the wall-label size it reads as an order rather than as
  // something quietly suggested. Same reasoning as Quiet Contradiction.
  regular: {
    fontFamily: fonts.serifRegular,
  },
  note: {
    ...type.body,
    marginTop: 10,
  },
  confirmation: {
    ...type.micro,
  },
});

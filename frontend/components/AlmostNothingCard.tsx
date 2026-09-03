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

// Each reminder gets its own illustration. Metro needs literal require paths,
// so this is a static map rather than a path built from the card — keyed on the
// reminder's opening line, which survives a repopulate where the content id
// does not.
//
// The keys below are the SIXTEEN reminders that exist in production (Atlas).
// The first cut of this map had eight, taken from the local dev Mongo in
// backend/.env, which holds a different and much smaller set — so on the live
// site half of all reminders fell through to the fallback and showed the same
// breathing woman the whole feature existed to replace. Any new key belongs
// here only after checking the production text, never the local one.
//
// Several reminders are the same subject in different words, and share a
// picture on purpose: a jaw is a jaw. The seen ledger keeps the pair roughly a
// fortnight apart in any case.
const ART: Record<string, number> = {
  'when did you last laugh?': require('../assets/art/reminder-laugh.jpg'),

  'check your posture.': require('../assets/art/reminder-posture.jpg'),
  'your shoulders are somewhere near your ears.': require('../assets/art/reminder-posture.jpg'),

  'unclench your jaw.': require('../assets/art/reminder-jaw.jpg'),
  'your jaw is probably clenched.': require('../assets/art/reminder-jaw.jpg'),

  'look at something far away.': require('../assets/art/reminder-far.jpg'),

  'drink some water.': require('../assets/art/reminder-water.jpg'),
  'when did you last drink water?': require('../assets/art/reminder-water.jpg'),

  'take one slow breath.': require('../assets/art/reminder-breath.jpg'),
  'notice your breathing for a second.': require('../assets/art/reminder-breath.jpg'),
  "you're holding your breath slightly.": require('../assets/art/reminder-breath.jpg'),

  'there is nothing to solve here.': require('../assets/art/reminder-nothing.jpg'),
  'a pause, on purpose.': require('../assets/art/reminder-pause.jpg'),

  // Still unillustrated, and deliberately so for the last two: they are body
  // sensations with no natural picture, and a forced one would be worse than
  // the fallback.
  //   'both feet on the floor.'
  //   'you just read that in your own voice.'
  //   'your tongue has nowhere comfortable to sit in your mouth.'
};

// A reminder written into the database before its art exists falls back rather
// than rendering an empty frame.
const FALLBACK = require('../assets/art/pause-woman.png');

function keyFor(firstLine: string) {
  return firstLine.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[’‘]/g, "'");
}

function artFor(firstLine: string) {
  const art = ART[keyFor(firstLine)];
  if (!art && __DEV__) {
    // Silence is how the first version of this map shipped half-wrong: every
    // unmapped reminder still rendered a perfectly nice picture, just the same
    // one every time. Say so out loud in development.
    console.warn(`[reminder art] no image for: "${firstLine.trim()}" — using fallback`);
  }
  return art ?? FALLBACK;
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
          source={artFor(firstLine)}
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

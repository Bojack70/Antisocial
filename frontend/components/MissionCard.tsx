import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardAction from './CardAction';
import CardFoot from './CardFoot';
import { cards, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
import { MissionDefinition } from '../data/missions';
import { recordMissionDone } from '../lib/missions';

interface MissionCardProps {
  mission: MissionDefinition;
}

// A Field Trip: the feed's exit ramp. It rides at the end of the session,
// so the last thing the museum hands you is a reason to leave it. Done is
// an honor-system tap — no proof required, no reward beyond the sentence.
export default function MissionCard({ mission }: MissionCardProps) {
  const [done, setDone] = useState(false);
  const scale = cardScale(mission.text);

  const handleDone = () => {
    if (done) return;
    setDone(true);
    recordMissionDone();
  };

  return (
    <View style={[cards.mint, cards.fill]}>
      <View>
        <CardHeader icon="compass-outline" color={accents.calm} label="Field Trip" />
        <Text style={[styles.text, scale.title]}>{mission.text}</Text>
      </View>

      {/* The duration is the foot's meta now — right-aligned above the
          button rather than stacked under the trip, so the bottom of every
          card reads the same way: the act on the left, the meta on the
          right. */}
      {done ? (
        <CardFoot>
          <Text style={styles.confirmation}>
            The museum will ask no further questions.
          </Text>
        </CardFoot>
      ) : (
        <CardFoot meta={mission.minutes === 2 ? 'Two minutes' : 'Five minutes'}>
          {/* The label names the specific trip where the data carries one
              ("Tree touched", "Bed made"); "Done" is the fallback. */}
          <CardAction label={mission.cta ?? 'Done'} onPress={handleDone} flush />
        </CardFoot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...type.title,
  },
  confirmation: {
    ...type.micro,
  },
});

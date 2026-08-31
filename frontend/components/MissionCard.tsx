import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardAction from './CardAction';
import { cards, type, accents } from '../lib/theme';
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

  const handleDone = () => {
    if (done) return;
    setDone(true);
    recordMissionDone();
  };

  return (
    <View style={cards.mint}>
      <CardHeader icon="compass-outline" color={accents.calm} label="Field Trip" />

      <Text style={styles.text}>{mission.text}</Text>

      {done ? (
        <Text style={styles.confirmation}>
          The museum will ask no further questions.
        </Text>
      ) : (
        <>
          <Text style={styles.duration}>
            {mission.minutes === 2 ? 'TWO MINUTES' : 'FIVE MINUTES'}
          </Text>
          {/* The label names the specific trip where the data carries one
              ("Tree touched", "Bed made"); "Done" is the fallback. */}
          <CardAction label={mission.cta ?? 'Done'} onPress={handleDone} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...type.title,
  },
  duration: {
    ...type.micro,
    marginTop: 16,
  },
  confirmation: {
    ...type.micro,
    marginTop: 16,
  },
});

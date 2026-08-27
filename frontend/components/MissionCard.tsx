import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';
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
      <CardHeader icon="compass-outline" color="#3F9A6C" label="Field Trip" />

      <Text style={styles.text}>{mission.text}</Text>

      {done ? (
        <Text style={styles.confirmation}>
          The museum will ask no further questions.
        </Text>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.duration}>
            {mission.minutes === 2 ? 'TWO MINUTES' : 'FIVE MINUTES'}
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...type.title,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  duration: {
    ...type.micro,
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.ink,
  },
  doneButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  confirmation: {
    ...type.micro,
    marginTop: 16,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import { cards, colors, type, accents } from '../lib/theme';
import { recordSkillDone } from '../lib/weekLedger';

interface TryThisCardProps {
  content: {
    title: string;
    hook: string;
    needs?: string;
    steps: string[];
    why?: string;
    duration?: number;
    rarity?: string;
    tags?: string[];
  };
}

// Wave 2, item 2: a real skill in two or three minutes, taught one step
// per tap, done with the hands right now. The card ends when the doing
// ends — no practice reminders, no comeback hooks. The why-line at the
// end is the retell payoff, same job as Fact-or-Myth's reveal.
export default function TryThisCard({ content }: TryThisCardProps) {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const total = content.steps.length;
  const allShown = revealed >= total;

  const minutes = content.duration
    ? `${Math.max(1, Math.round(content.duration / 60))} minute${content.duration > 90 ? 's' : ''}`
    : null;

  return (
    <View style={cards.white}>
      <CardHeader icon="hand-left-outline" color={accents.calm} label="Try This" />

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.hook}>{content.hook}</Text>

      <View style={styles.metaRow}>
        {!!content.needs && <Text style={styles.meta}>{content.needs}</Text>}
        {!!minutes && <Text style={styles.meta}>{minutes}</Text>}
      </View>

      {revealed > 0 && (
        <View style={styles.stepsContainer}>
          {content.steps.slice(0, revealed).map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {!allShown && (
        <TouchableOpacity
          style={styles.nextRow}
          onPress={() => setRevealed(revealed + 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.nextText}>
            {revealed === 0 ? 'Show me how' : 'Then what?'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </TouchableOpacity>
      )}

      {allShown && !done && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => {
            setDone(true);
            recordSkillDone(); // depth action; fire-and-forget
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>I did it</Text>
        </TouchableOpacity>
      )}

      {done && (
        <View style={styles.closing}>
          {!!content.why && <Text style={styles.why}>{content.why}</Text>}
          <Text style={styles.closingLine}>That’s yours now.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    marginBottom: 6,
  },
  hook: {
    ...type.body,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  meta: {
    ...type.micro,
  },
  stepsContainer: {
    gap: 10,
    marginTop: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.body,
  },
  stepText: {
    ...type.body,
    flex: 1,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  nextText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.body,
  },
  doneButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  doneButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  closing: {
    marginTop: 14,
  },
  why: {
    ...type.body,
  },
  closingLine: {
    ...type.micro,
    marginTop: 10,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import CardAction from './CardAction';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
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
    /** Activity-specific completion label ("Folded", "Knot tied");
        falls back to the type's default. */
    cta_label?: string;
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
  const scale = cardScale(content.title, content.hook, content.steps.slice(0, revealed), done ? content.why : '');

  return (
    <View style={[cards.white, cards.fill]}>
      <View>
      <CardHeader icon="hand-left-outline" color={accents.calm} label="Try This" />

      <Text style={[styles.title, scale.title]}>{content.title}</Text>
      <Text style={[styles.hook, scale.body]}>{content.hook}</Text>

      {/* Duration is deliberately not shown (user call, 2026-09-02): the
          data still carries it, but a countdown-flavored "2 minutes" reads
          as pressure on a card whose point is unhurried doing. `needs` has
          moved to the foot's meta slot. */}

      {revealed > 0 && (
        <View style={styles.stepsContainer}>
          {content.steps.slice(0, revealed).map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, scale.row]}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {done && !!content.why && (
        <Text style={[styles.why, scale.body]}>{content.why}</Text>
      )}
      </View>

      {/* The foot walks the card's own arc: reveal the next step, then the
          completion, then the closing line. `needs` rides on the right as
          the quiet meta — it used to sit under the hook, where it read as
          part of the pitch rather than as what to go and fetch. */}
      {!allShown ? (
        <CardFoot meta={content.needs}>
          <TouchableOpacity
            style={styles.nextRow}
            onPress={() => setRevealed(revealed + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.nextText}>
              {revealed === 0 ? 'Show me how' : 'Then what?'}
            </Text>
            <Ionicons name="chevron-down" size={15} color={colors.muted} />
          </TouchableOpacity>
        </CardFoot>
      ) : !done ? (
        <CardFoot>
          <CardAction
            label={content.cta_label ?? 'I did it'}
            flush
            onPress={() => {
              setDone(true);
              recordSkillDone(); // depth action; fire-and-forget
            }}
          />
        </CardFoot>
      ) : (
        <CardFoot>
          <Text style={styles.closingLine}>That’s yours now.</Text>
        </CardFoot>
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
  // Pinned to the card's bottom edge: full width, and over the 44px floor.
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  nextText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.body,
  },
  why: {
    ...type.body,
    marginTop: 14,
  },
  closingLine: {
    ...type.micro,
  },
});

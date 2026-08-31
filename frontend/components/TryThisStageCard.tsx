import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { cards, colors, stageType } from '../lib/theme';
import { recordSkillDone } from '../lib/weekLedger';

interface Props {
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

// PREVIEW — the Try This card on the stage treatment, so the template can
// be judged on a hands-on interactive card. TryThisCard (the shipped
// layout) is untouched; app/index.tsx picks this one only while the stage
// preview flag is on.
//
// The mechanics are identical to the shipped card — steps reveal one per
// tap, "I did it" records the skill and pays off with the why-line — only
// the clothes changed: stage type scale, centred header, the short rule
// where the Gentle Reminder keeps its illustration.
export default function TryThisStageCard({ content }: Props) {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const total = content.steps.length;
  const allShown = revealed >= total;

  const minutes = content.duration
    ? `${Math.max(1, Math.round(content.duration / 60))} minute${content.duration > 90 ? 's' : ''}`
    : null;
  const meta = [content.needs, minutes].filter(Boolean).join('  ·  ');

  return (
    <View style={cards.stage}>
      {/* The card is pinned between chrome and footer; a fully revealed
          five-step skill outgrows the page, so overflow scrolls inside. */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={stageType.eyebrow}>Try This</Text>
        <Text style={[stageType.headline, styles.title]}>{content.title}</Text>

        <View style={styles.rule} />

        <Text style={[stageType.body, styles.prose]}>{content.hook}</Text>

        {!!meta && <Text style={styles.meta}>{meta}</Text>}

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
            <Ionicons name="chevron-down" size={16} color={colors.body} />
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
            {!!content.why && (
              <Text style={[stageType.body, styles.prose]}>{content.why}</Text>
            )}
            <Text style={styles.closingLine}>That’s yours now.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // The skill's name is the line that matters here, so it keeps the full
  // stage headline (unlike Wait... What?, whose headline demotes to a
  // muted sub-heading under its eyebrow).
  title: {
    marginTop: 2,
  },
  // Stands in for the illustration band, same as the other artless stage
  // cards: a short centred rule with the art frame's breathing room.
  rule: {
    width: 44,
    height: 1,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: 22,
    marginBottom: 22,
  },
  // The hook reads as prose, left-aligned like the Wait... What? facts.
  prose: {
    textAlign: 'left',
  },
  meta: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  stepsContainer: {
    gap: 10,
    marginTop: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.surfaceTinted,
    borderRadius: 14,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
  },
  stepText: {
    fontSize: 18,
    lineHeight: 25,
    color: colors.ink,
    flex: 1,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  nextText: {
    fontSize: 17,
    color: colors.ink,
  },
  doneButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.ink,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.surface,
  },
  closing: {
    marginTop: 20,
    gap: 12,
  },
  closingLine: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
    textAlign: 'center',
  },
});

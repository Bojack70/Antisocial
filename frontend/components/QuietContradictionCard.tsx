import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import ReactionButtons from './ReactionButtons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, fonts, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';

interface QuietContradictionCardProps {
  content: {
    statement1: string;
    statement2: string;
    tags?: string[];
  };
}

export default function QuietContradictionCard({ content }: QuietContradictionCardProps) {
  const reactions = ['Unsettling', 'I’m Unsure', 'Noted', 'Stayed With Me'];
  const scale = cardScale(content.statement1, content.statement2);

  return (
    <View style={[cards.tinted, cards.fill]}>
      <View>
        <CardHeader icon="contrast-outline" color={accents.curiosity} label="Quiet Contradiction" />

        <Text style={[styles.statementText, scale.title, styles.regular]}>
          {content.statement1}
        </Text>

        {/* Subtle visual separator to indicate the gap/unresolved nature */}
        <View style={styles.separator} />

        <Text style={[styles.statementText, scale.title, styles.regular]}>
          {content.statement2}
        </Text>
      </View>

      <CardFoot ruled>
        <ReactionButtons reactions={reactions} flush />
      </CardFoot>
    </View>
  );
}

const styles = StyleSheet.create({
  statementText: {
    ...type.title,
  },
  // The two statements are set in the REGULAR serif, not the bold one every
  // other card's title uses (user call, 2026-09-02). This card is the only
  // one whose "title" is two halves of a held contradiction rather than a
  // headline — bold made each half assert itself, when the point is that
  // neither wins.
  regular: {
    fontFamily: fonts.serifRegular,
  },
  separator: {
    height: 1,
    width: 28,
    backgroundColor: colors.hairline,
    marginVertical: 18,
  },
});

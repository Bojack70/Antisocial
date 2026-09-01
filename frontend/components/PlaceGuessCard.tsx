import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import { cards, colors, type, accents } from '../lib/theme';
import { recordGuess } from '../lib/weekLedger';

interface PlaceGuessCardProps {
  content: {
    image_url: string;
    // The correct place, as displayed (e.g. "Setenil de las Bodegas, Spain").
    answer: string;
    decoys: string[];
    // The payoff: the place's story, specific and retellable.
    story: string;
    // Wikimedia Commons attribution — author + license, always shown after
    // the reveal. Free-image tools failed the commercial-use audit; Commons
    // photos with credit are the one imagery source that passed.
    credit: string;
    source_link?: string;
  };
}

// One photograph of somewhere real and improbable; the wrong options are
// places that could plausibly look like this. Same anatomy as Look Closer,
// but the subject is always a place and the reveal is its story.
export default function PlaceGuessCard({ content }: PlaceGuessCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [options] = useState(() =>
    [content.answer, ...content.decoys].sort(() => Math.random() - 0.5)
  );
  const answered = selected !== null;
  const isCorrect = selected === content.answer;

  // Without the photograph there is nothing to guess at; degrade to the
  // story with its credit rather than asking about an image that never
  // arrived (Look Closer's pattern).
  const degraded = imageFailed;

  return (
    <View style={cards.white}>
      <CardHeader icon="earth-outline" color={accents.curiosity} label="Where On Earth" />

      {!degraded && (
        <Image
          source={{ uri: content.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setImageFailed(true)}
        />
      )}

      {!degraded ? (
        <>
          <Text style={styles.prompt}>This is a real place. Which one?</Text>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => {
              const isSelected = selected === option;
              const isCorrectOption = answered && option === content.answer;
              const isWrongSelection = answered && isSelected && !isCorrect;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    isCorrectOption && styles.optionCardCorrect,
                    isWrongSelection && styles.optionCardWrong,
                  ]}
                  onPress={() => {
                    if (answered) return;
                    setSelected(option);
                    recordGuess(); // depth action; fire-and-forget
                  }}
                  disabled={answered}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (isSelected || isCorrectOption) && styles.optionTextBold,
                    ]}
                  >
                    {option}
                  </Text>
                  {isCorrectOption && <Ionicons name="checkmark" size={14} color={colors.ink} />}
                  {isWrongSelection && <Ionicons name="close" size={14} color={colors.muted} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : (
        <Text style={styles.prompt}>{content.answer}</Text>
      )}

      {(answered || degraded) && (
        <>
          <Text style={styles.story}>{content.story}</Text>
          <TouchableOpacity
            style={styles.creditRow}
            onPress={() => content.source_link && Linking.openURL(content.source_link)}
            disabled={!content.source_link}
            activeOpacity={0.7}
          >
            <Text style={styles.credit}>{content.credit}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#F4F4F5',
  },
  prompt: {
    ...type.title,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  optionCardSelected: {
    borderColor: colors.ink,
  },
  optionCardCorrect: {
    borderColor: colors.ink,
    backgroundColor: colors.surfaceTinted,
  },
  optionCardWrong: {
    borderColor: colors.line,
    backgroundColor: colors.surfaceTinted,
  },
  optionText: {
    ...type.body,
    flex: 1,
  },
  optionTextBold: {
    color: colors.ink,
  },
  story: {
    ...type.body,
    marginTop: 12,
  },
  creditRow: {
    marginTop: 10,
  },
  credit: {
    ...type.micro,
  },
});

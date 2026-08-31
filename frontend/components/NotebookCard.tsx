import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import CardAction from './CardAction';
import { cards, colors, type, accents } from '../lib/theme';
import { writeInNotebook } from '../lib/notebook';

interface NotebookCardProps {
  promptId: string;
  prompt: string;
}

// The writing card (Wave 2, item 1): one specific prompt, two or three
// honest lines, kept on this device and nowhere else. Writing is the
// deepest dwell action a card can ask for, so this card asks quietly and
// takes no for an answer — skipping it costs nothing and is never
// mentioned again. The Week in Review quotes the freshest entry back.
export default function NotebookCard({ promptId, prompt }: NotebookCardProps) {
  const [text, setText] = useState('');
  const [kept, setKept] = useState(false);
  const sessionKey = useRef(`nb-${Date.now()}`).current;

  const keep = () => {
    if (!text.trim()) return;
    writeInNotebook({ sessionKey, promptId, prompt, text: text.trim() });
    setKept(true);
  };

  return (
    <View style={cards.white}>
      <CardHeader icon="create-outline" color={accents.personal} label="The Notebook" />

      <Text style={styles.prompt}>{prompt}</Text>

      {!kept ? (
        <>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Two or three lines. They stay on this device."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={280}
            textAlignVertical="top"
          />
          {text.trim().length > 0 && (
            <CardAction label="Leave it in the book" onPress={keep} />
          )}
        </>
      ) : (
        <TouchableOpacity onPress={() => setKept(false)} activeOpacity={0.7}>
          <Text style={styles.keptText}>{text.trim()}</Text>
          <Text style={styles.keptLine}>Kept. Tap to change it.</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    ...type.title,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 74,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
    backgroundColor: colors.surfaceTinted,
  },
  keptText: {
    ...type.body,
    fontStyle: 'italic',
  },
  keptLine: {
    ...type.micro,
    marginTop: 10,
  },
});

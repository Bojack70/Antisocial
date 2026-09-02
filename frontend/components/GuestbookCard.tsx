import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { signGuestbook } from '../lib/guestbook';

export interface GuestbookCardItem {
  id: string;
  type: string;
  title: string;
}

interface GuestbookCardProps {
  // The content cards this session actually showed, in scroll order.
  items: GuestbookCardItem[];
}

// The closing card, just before the Field Trip: the retell test made
// mechanical. Naming the one card you'd actually retell deepens recall of
// that card and quietly scores every card in the session — the content
// bar turned into data. No streaks, no praise; the museum just keeps a
// guestbook.
export default function GuestbookCard({ items }: GuestbookCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [noteKept, setNoteKept] = useState(false);
  // One signature slot per rendered guestbook; changing your mind
  // replaces the entry rather than signing twice.
  const sessionKey = useRef(`gb-${Date.now()}`).current;

  const sign = (item: GuestbookCardItem, keptNote?: string) => {
    setSelectedId(item.id);
    signGuestbook({
      sessionKey,
      cardId: item.id,
      cardType: item.type,
      title: item.title,
      note: keptNote?.trim() || undefined,
    });
  };

  const selected = items.find((i) => i.id === selectedId);

  if (items.length === 0) return null;

  return (
    <View style={[cards.tinted, cards.fill]}>
      <View>
      <CardHeader icon="book-outline" color={accents.personal} label="The Guestbook" />

      <Text style={styles.title}>
        Which of today’s cards would you actually retell?
      </Text>
      <Text style={styles.subtitle}>Tap it. That’s the whole test.</Text>

      <View style={styles.list}>
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => sign(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.rowText, isSelected && styles.rowTextSelected]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={colors.ink} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      </View>

      {/* The list is the card, so it stays in the body; what pins to the
          bottom is the closing act — the line you may leave, then the
          signature itself. */}
      {selected && !noteKept && (
        <CardFoot>
        <View style={styles.noteBlock}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="One line, if you like."
            placeholderTextColor={colors.muted}
            maxLength={140}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (note.trim()) {
                sign(selected, note);
                setNoteKept(true);
              }
            }}
          />
          {note.trim().length > 0 && (
            <TouchableOpacity
              style={styles.keepButton}
              onPress={() => {
                sign(selected, note);
                setNoteKept(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.keepButtonText}>Leave it in the book</Text>
            </TouchableOpacity>
          )}
        </View>
        </CardFoot>
      )}

      {selected && noteKept && (
        <CardFoot>
          <Text style={styles.signedLine}>Signed. The book remembers.</Text>
        </CardFoot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    marginBottom: 4,
  },
  subtitle: {
    ...type.body,
    color: colors.muted,
    marginBottom: 14,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  rowSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  rowText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.body,
    flex: 1,
  },
  rowTextSelected: {
    color: colors.ink,
  },
  noteBlock: {
    marginTop: 14,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  keepButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  keepButtonText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.body,
  },
  signedLine: {
    ...type.micro,
    marginTop: 12,
  },
});

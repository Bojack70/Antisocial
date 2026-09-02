import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type, accents } from '../lib/theme';
import { cardScale } from '../lib/typeScale';

interface Props {
  content: {
    /** A frame from INSIDE the video, not the thumbnail. See the note below. */
    frame_url: string;
    /** The real title — the answer. */
    answer: string;
    /** Two real titles from other videos in the corpus. */
    decoys: string[];
    channel_title: string;
    duration: number;
    video_url?: string;
  };
}

// PROTOTYPE — gallery only, not in the feed. A guess card built from the
// video pool: one frame from inside a clip, three real titles, then the
// reveal and the offer to watch it.
//
// It exists because the two problems solve each other. look_closer is the
// thinnest pool in the app (10 items, every one a NASA space photograph)
// and video is the deepest (296 items, barely used). This turns the surplus
// into the scarce thing, with no new content sourcing.
//
// THE ONE RULE THAT MAKES OR BREAKS IT: the picture must come from a
// storyboard frame (i.ytimg.com/vi/<id>/hq2.jpg), never from thumbnail_url.
// YouTube thumbnails are clickbait — the title is burned into the artwork,
// so a thumbnail-based card prints the answer on the picture. Same trap
// populate_look_closer.py already refuses ("labels answer the guess for
// you"). Frames are raw and undesigned; thumbnails are advertising.
//
// The decoys are other videos' real titles, so the wrong answers are always
// plausible and nobody has to write them.
export default function BeforeYouWatchCard({ content }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const answered = selected !== null;
  const correct = selected === content.answer;

  // Options are shuffled once, on first render, so re-renders don't move
  // the answer around under the reader's thumb.
  const [options] = useState(() => {
    const all = [content.answer, ...content.decoys];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  });

  const mins = Math.floor(content.duration / 60);
  const secs = content.duration % 60;
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  const scale = cardScale(content.answer, options);

  return (
    <View style={[cards.white, cards.fill]}>
      <View style={styles.top}>
      <CardHeader icon="film-outline" color={accents.play} label="Before You Watch" />

      {!failed && (
        <Image
          source={{ uri: content.frame_url }}
          style={styles.frame}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      )}

      <Text style={[styles.prompt, scale.title]}>
        {failed ? content.answer : 'One frame. What is it about?'}
      </Text>
      </View>

      {/* Unanswered, the option list is the foot — the frame takes the
          height above it. Answered, the clip you just earned takes the
          same slot. */}
      {!failed && !answered && (
        <CardFoot>
        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = selected === option;
            const isAnswer = answered && option === content.answer;
            const isWrong = answered && isSelected && !correct;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  isAnswer && styles.optionCorrect,
                  isWrong && styles.optionWrong,
                ]}
                onPress={() => !answered && setSelected(option)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, scale.row, (isSelected || isAnswer) && styles.optionBold]}>
                  {option}
                </Text>
                {isAnswer && <Ionicons name="checkmark" size={14} color={colors.ink} />}
                {isWrong && <Ionicons name="close" size={14} color={colors.muted} />}
              </TouchableOpacity>
            );
          })}
        </View>
        </CardFoot>
      )}

      {(answered || failed) && (
        <CardFoot meta={content.channel_title}>
          {/* The reward for guessing is the clip itself — the card earns the
              watch rather than opening with it. */}
          <TouchableOpacity style={styles.watch} activeOpacity={0.8}>
            <Ionicons name="play" size={14} color={colors.surface} />
            <Text style={styles.watchText}>Watch it · {clock}</Text>
          </TouchableOpacity>
        </CardFoot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
  },
  // 16:9 — the frames are letterboxed video stills, so anything else
  // crops them or pads them.
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: colors.surfaceTinted,
  },
  prompt: {
    ...type.title,
    marginBottom: 12,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  optionSelected: { borderColor: colors.ink },
  optionCorrect: { borderColor: colors.ink, backgroundColor: colors.surfaceTinted },
  optionWrong: { borderColor: colors.line, opacity: 0.6 },
  optionText: { ...type.body, color: colors.ink, flex: 1, paddingRight: 8 },
  optionBold: { fontWeight: '600' },
  credit: {
    ...type.micro,
    marginTop: 16,
  },
  watch: {
    backgroundColor: colors.ink,
    paddingVertical: 13,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  watchText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.surface,
  },
});

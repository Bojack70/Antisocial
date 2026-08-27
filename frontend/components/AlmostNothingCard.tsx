import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import ReactionButtons from './ReactionButtons';
import { ShareContext } from './ShareableCard';

interface AlmostNothingCardProps {
  content: {
    text: string;
  };
}

export default function AlmostNothingCard({ content }: AlmostNothingCardProps) {
  // PRD Reactions for this specific vibe
  const reactions = ['Let It Pass', 'Noted', 'Stayed With Me'];
  const onShare = useContext(ShareContext);

  // First line is the nudge; the rest makes it land.
  const [firstLine, ...restLines] = content.text.split('\n');
  const rest = restLines.join('\n').trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="sunny-outline" size={15} color="#3F9A6C" />
        </View>
        <Text style={styles.label}>Gentle Reminder</Text>
        {onShare && (
          <TouchableOpacity
            onPress={onShare}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-outline" size={16} color="#9BC4AA" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.text}>{firstLine}</Text>
      {rest.length > 0 && <Text style={styles.subText}>{rest}</Text>}
      <ReactionButtons reactions={reactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E9F6EE',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8EEDF',
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D8EEDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#3F9A6C',
    fontWeight: '700',
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: '#16171A',
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 25,
  },
  subText: {
    fontSize: 15,
    color: '#3A6B52',
    lineHeight: 22,
    marginTop: 6,
  },
});

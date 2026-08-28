import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';
import { GameDefinition } from '../data/games';

interface GameCardProps {
  game: GameDefinition;
  // Session anchor (spec item 2): the invitation names a bounded arc with
  // a natural end, and the game opens in anchor mode — where the end panel
  // treats leaving as the primary action, museum-style.
  anchor?: boolean;
}

// A game as an ordinary feed card: same anatomy as every other card, so a
// game arrives in the scroll the way a fact does rather than hiding behind
// a button in the header.
export default function GameCard({ game, anchor = false }: GameCardProps) {
  const router = useRouter();
  const [stat, setStat] = useState<number>(0);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(game.statKey).then((v) => {
      if (active && v) setStat(parseInt(v, 10) || 0);
    });
    return () => {
      active = false;
    };
  }, [game.statKey]);

  return (
    <View style={cards.tinted}>
      <CardHeader icon={game.icon} color={game.color} label={game.label} />

      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.description}>
        {anchor ? game.arcDescription : game.description}
      </Text>

      <TouchableOpacity
        style={styles.cta}
        onPress={() =>
          router.push((anchor ? `${game.route}?anchor=1` : game.route) as any)
        }
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>{anchor ? game.arcCta : game.cta}</Text>
        <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
      </TouchableOpacity>

      {stat > 0 && <Text style={styles.stat}>{game.statLabel(stat)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    marginBottom: 8,
  },
  description: {
    ...type.body,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  stat: {
    ...type.micro,
    marginTop: 12,
    textAlign: 'center',
  },
});

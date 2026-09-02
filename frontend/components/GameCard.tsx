import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CardHeader from './CardHeader';
import CardFoot from './CardFoot';
import { cards, colors, type } from '../lib/theme';
import { cardScale } from '../lib/typeScale';
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
  const scale = cardScale(game.title, anchor ? game.arcDescription : game.description);

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
    <View style={[cards.tinted, cards.fill]}>
      <View>
        <CardHeader icon={game.icon} color={game.color} label={game.label} />

        <Text style={[styles.title, scale.title]}>{game.title}</Text>
        <Text style={[styles.description, scale.body]}>
          {anchor ? game.arcDescription : game.description}
        </Text>
      </View>

      {/* The card already had its own CTA — it just moves to the foot, and
          the personal best rides the meta slot instead of trailing under
          the button. */}
      <CardFoot meta={stat > 0 ? game.statLabel(stat) : undefined}>
      <TouchableOpacity
        style={styles.cta}
        onPress={() =>
          router.push((anchor ? `${game.route}?anchor=1` : game.route) as any)
        }
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>{anchor ? game.arcCta : game.cta}</Text>
        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
      </TouchableOpacity>
      </CardFoot>
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
  // The card's foot now, so it matches CardAction's shape and clears the
  // 44px touch floor.
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
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

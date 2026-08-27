import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CardHeader from './CardHeader';
import { GameDefinition } from '../data/games';

interface GameCardProps {
  game: GameDefinition;
}

// A game as an ordinary feed card: same anatomy as every other card, so a
// game arrives in the scroll the way a fact does rather than hiding behind
// a button in the header.
export default function GameCard({ game }: GameCardProps) {
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
    <View style={styles.card}>
      <CardHeader icon={game.icon} color={game.color} label={game.label} />

      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.description}>{game.description}</Text>

      <TouchableOpacity
        style={[styles.cta, { backgroundColor: game.tint }]}
        onPress={() => router.push(game.route as any)}
        activeOpacity={0.8}
      >
        <Text style={[styles.ctaText, { color: game.color }]}>{game.cta}</Text>
        <Ionicons name="arrow-forward" size={15} color={game.color} />
      </TouchableOpacity>

      {stat > 0 && <Text style={styles.stat}>{game.statLabel(stat)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECE9',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: '#16171A',
    marginBottom: 8,
    lineHeight: 25,
  },
  description: {
    fontSize: 15,
    color: '#5B5D63',
    lineHeight: 22,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 999,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stat: {
    marginTop: 10,
    fontSize: 12,
    color: '#8C8E92',
    textAlign: 'center',
  },
});

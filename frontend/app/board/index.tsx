import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BOARD_SIZE = 36;
const COLS = 6;

// Shortcuts jump you forward, rabbit holes pull you back.
// Every jump reveals a fact — the game stays a museum.
const JUMPS: Record<number, { to: number; fact: string }> = {
  4: { to: 15, fact: 'Shortcut — the fax machine was patented 33 years before the telephone.' },
  9: { to: 21, fact: 'Shortcut — Oxford was teaching students before the Aztec Empire existed.' },
  17: { to: 28, fact: 'Shortcut — there are more trees on Earth than stars in the Milky Way.' },
  26: { to: 34, fact: 'Shortcut — woolly mammoths were still alive when the Great Pyramid was built.' },
  12: { to: 3, fact: 'Rabbit hole — in 1919, a 50-foot wave of molasses flooded Boston at 35 mph.' },
  19: { to: 7, fact: 'Rabbit hole — in 1932 Australia went to war with emus. The emus won.' },
  24: { to: 16, fact: 'Rabbit hole — Victor Lustig sold the Eiffel Tower to scrap dealers. Twice.' },
  31: { to: 13, fact: 'Rabbit hole — Kolmanskop, a diamond town, was swallowed whole by the desert.' },
  35: { to: 22, fact: 'Rabbit hole — one whale sings at 52 hertz, a frequency no other whale uses.' },
};

type Turn = 'player' | 'rival' | 'over';

export default function BoardGame() {
  const router = useRouter();
  const [playerPos, setPlayerPos] = useState(0);
  const [rivalPos, setRivalPos] = useState(0);
  const [turn, setTurn] = useState<Turn>('player');
  const [dice, setDice] = useState<number | null>(null);
  const [message, setMessage] = useState('Roll to enter the museum. First to tile 36 wins.');
  const [winner, setWinner] = useState<'you' | 'time' | null>(null);
  const [wins, setWins] = useState(0);
  const rivalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('board_wins').then((v) => {
      if (v) setWins(parseInt(v, 10) || 0);
    });
    return () => {
      if (rivalTimer.current) clearTimeout(rivalTimer.current);
    };
  }, []);

  const applyMove = (from: number, roll: number): { pos: number; fact: string | null } => {
    let pos = Math.min(from + roll, BOARD_SIZE);
    const jump = JUMPS[pos];
    if (jump && pos < BOARD_SIZE) {
      return { pos: jump.to, fact: jump.fact };
    }
    return { pos, fact: null };
  };

  const finishGame = (who: 'you' | 'time') => {
    setWinner(who);
    setTurn('over');
    if (who === 'you') {
      const newWins = wins + 1;
      setWins(newWins);
      AsyncStorage.setItem('board_wins', String(newWins)).catch(() => {});
    }
  };

  const rollPlayer = () => {
    if (turn !== 'player') return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setDice(roll);
    const { pos, fact } = applyMove(playerPos, roll);
    setPlayerPos(pos);

    if (pos >= BOARD_SIZE) {
      setMessage('You reached the last room.');
      finishGame('you');
      return;
    }
    setMessage(fact ?? `You rolled a ${roll}.`);
    setTurn('rival');
    rivalTimer.current = setTimeout(rollRival(pos), 1100);
  };

  const rollRival = (currentPlayerPos: number) => () => {
    setRivalPos((prev) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDice(roll);
      const { pos, fact } = applyMove(prev, roll);
      if (pos >= BOARD_SIZE) {
        setMessage('Time got there first. It usually does.');
        finishGame('time');
        return pos;
      }
      setMessage(fact ? `Time hit one too. ${fact}` : `Time rolled a ${roll}. Your move.`);
      setTurn('player');
      return pos;
    });
  };

  const resetGame = () => {
    if (rivalTimer.current) clearTimeout(rivalTimer.current);
    setPlayerPos(0);
    setRivalPos(0);
    setDice(null);
    setWinner(null);
    setMessage('Roll to enter the museum. First to tile 36 wins.');
    setTurn('player');
  };

  // Board rows, top row first. Tiles snake: row 0 (bottom) runs left-to-right.
  const rows: number[][] = [];
  for (let r = Math.ceil(BOARD_SIZE / COLS) - 1; r >= 0; r--) {
    const tiles: number[] = [];
    for (let c = 0; c < COLS; c++) {
      tiles.push(r * COLS + (r % 2 === 0 ? c + 1 : COLS - c));
    }
    rows.push(tiles);
  }

  const renderTile = (tile: number) => {
    const jump = JUMPS[tile];
    const isShortcut = jump && jump.to > tile;
    const isHole = jump && jump.to < tile;
    const hasPlayer = playerPos === tile;
    const hasRival = rivalPos === tile;
    return (
      <View
        key={tile}
        style={[
          styles.tile,
          isShortcut && styles.tileShortcut,
          isHole && styles.tileHole,
          tile === BOARD_SIZE && styles.tileFinish,
        ]}
      >
        <Text style={styles.tileNumber}>{tile}</Text>
        {isShortcut && <Ionicons name="arrow-up" size={11} color="#10b981" />}
        {isHole && <Ionicons name="arrow-down" size={11} color="#ef4444" />}
        <View style={styles.tokenRow}>
          {hasPlayer && <View style={styles.playerToken} />}
          {hasRival && <View style={styles.rivalToken} />}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#3A3B3E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shortcuts & Rabbit Holes</Text>
          <Text style={styles.headerSubtitle}>You vs Time</Text>
        </View>
        <View style={styles.winsPill}>
          <Ionicons name="trophy-outline" size={13} color="#6B6D76" />
          <Text style={styles.winsText}>{wins}</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.board}>
          {rows.map((tiles, i) => (
            <View key={i} style={styles.boardRow}>
              {tiles.map(renderTile)}
            </View>
          ))}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.playerToken} />
            <Text style={styles.legendText}>You</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.rivalToken} />
            <Text style={styles.legendText}>Time</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="arrow-up" size={12} color="#10b981" />
            <Text style={styles.legendText}>Shortcut</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="arrow-down" size={12} color="#ef4444" />
            <Text style={styles.legendText}>Rabbit hole</Text>
          </View>
        </View>

        <View style={styles.messagePanel}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {turn !== 'over' ? (
          <TouchableOpacity
            style={[styles.rollButton, turn === 'rival' && styles.rollButtonDisabled]}
            onPress={rollPlayer}
            disabled={turn !== 'player'}
            activeOpacity={0.8}
          >
            <Ionicons name="dice-outline" size={18} color="#FFFFFF" />
            <Text style={styles.rollButtonText}>
              {turn === 'player'
                ? dice === null
                  ? 'Roll'
                  : `Roll  ·  last was ${dice}`
                : 'Time is thinking…'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.gameoverPanel}>
            <Text style={styles.gameoverTitle}>
              {winner === 'you' ? 'You beat Time.' : 'Time wins this one.'}
            </Text>
            <TouchableOpacity style={styles.rollButton} onPress={resetGame} activeOpacity={0.8}>
              <Text style={styles.rollButtonText}>Run it back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.ghostButtonText}>Back to the game room</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECE9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16171A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8C8E92',
    marginTop: 1,
  },
  winsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECE9',
    minWidth: 46,
    justifyContent: 'center',
  },
  winsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16171A',
  },
  playArea: {
    flex: 1,
    padding: 16,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  board: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECECE9',
    padding: 8,
    gap: 6,
  },
  boardRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#F5F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  tileShortcut: {
    backgroundColor: '#10b98112',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  tileHole: {
    backgroundColor: '#ef444410',
    borderWidth: 1,
    borderColor: '#ef444435',
  },
  tileFinish: {
    backgroundColor: '#16171A',
  },
  tileNumber: {
    fontSize: 10,
    color: '#8C8E92',
    fontWeight: '600',
  },
  tokenRow: {
    flexDirection: 'row',
    gap: 3,
    minHeight: 10,
    alignItems: 'center',
  },
  playerToken: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  rivalToken: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8C8E92',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B6D76',
  },
  messagePanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECE9',
    padding: 14,
    marginTop: 12,
    minHeight: 64,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#3A3B3E',
    lineHeight: 20,
    textAlign: 'center',
  },
  rollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: '#16171A',
  },
  rollButtonDisabled: {
    backgroundColor: '#8C8E92',
  },
  rollButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  gameoverPanel: {
    marginTop: 14,
  },
  gameoverTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#16171A',
    textAlign: 'center',
    marginBottom: 4,
  },
  ghostButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DDDDDA',
  },
  ghostButtonText: {
    color: '#6B6D76',
    fontSize: 14,
  },
});

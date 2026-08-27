import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GAMES } from '../../data/games';

export default function PlayHub() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#3A3B3E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>The Game Room</Text>
          <Text style={styles.headerSubtitle}>Small games, oddly compelling</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.list}>
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => router.push(game.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBadge, { backgroundColor: game.tint }]}>
              <Ionicons name={game.icon} size={22} color={game.color} />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8C8E92" />
          </TouchableOpacity>
        ))}
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
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16171A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8C8E92',
    marginTop: 1,
  },
  list: {
    padding: 16,
    gap: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ECECE9',
    padding: 18,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16171A',
  },
  gameDesc: {
    fontSize: 13,
    color: '#5B5D63',
    marginTop: 3,
    lineHeight: 18,
  },
});

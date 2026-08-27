import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => router.push('/timeline')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBadge, { backgroundColor: '#EEF0FE' }]}>
            <Ionicons name="hourglass-outline" size={22} color="#6366f1" />
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>The Timeline</Text>
            <Text style={styles.gameDesc}>
              Which came first? Chain correct answers into a streak. The year gaps
              shrink as you go.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C8E92" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => router.push('/board')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBadge, { backgroundColor: '#FDEFF6' }]}>
            <Ionicons name="dice-outline" size={22} color="#ec4899" />
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>Shortcuts & Rabbit Holes</Text>
            <Text style={styles.gameDesc}>
              Race Time across the board. Shortcuts jump you ahead, rabbit holes
              pull you under — every one hides a fact.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8C8E92" />
        </TouchableOpacity>
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
    fontWeight: '600',
    color: '#16171A',
  },
  gameDesc: {
    fontSize: 13,
    color: '#5B5D63',
    marginTop: 3,
    lineHeight: 18,
  },
});

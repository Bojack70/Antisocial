import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SCREENS = [
  {
    id: 1,
    content: [
      'This is not a social app.',
      'There’s nothing to post.',
    ],
    button: 'Continue',
  },
  {
    id: 2,
    content: [
      'This is a place for wandering.',
    ],
    button: 'Continue',
  },
  {
    id: 3,
    content: [
      'Some things will not explain themselves.',
    ],
    button: 'Continue',
  },
  {
    id: 4,
    content: [
      'We do not send notifications.',
    ],
    button: 'Continue',
  },
  {
    id: 5,
    content: [
      'If you use this app for more than three hours in a day, you will be logged out.',
    ],
    button: 'Continue',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = async () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Last screen - complete onboarding
      try {
        await AsyncStorage.setItem('onboarding_complete', 'true');
        await AsyncStorage.setItem('daily_usage_start', new Date().toISOString());
        await AsyncStorage.setItem('daily_usage_minutes', '0');
        
        // Navigate to main feed
        router.replace('/');
      } catch (error) {
        console.error('Error saving onboarding:', error);
      }
    }
  };

  const screen = SCREENS[currentScreen];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Content */}
      <View style={styles.contentContainer}>
        
        <View style={styles.textContainer}>
          {screen.content.map((line, index) => (
            <Text key={index} style={styles.contentText}>
              {line}
            </Text>
          ))}
        </View>

      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{screen.button}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  textContainer: {
    gap: 12,
  },
  contentText: {
    fontSize: 24,
    lineHeight: 36,
    color: '#f9fafb',
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
  },
});

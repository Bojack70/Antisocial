import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SCREENS = [
  {
    id: 1,
    title: 'Expectations',
    content: [
      'This is not a social app.',
      'There\'s nothing to post.',
      'No one is watching.',
    ],
    button: 'Continue',
  },
  {
    id: 2,
    title: 'Purpose',
    content: [
      'This is a place for wandering.',
      'Not learning.',
      'Not performing.',
    ],
    button: 'Okay',
  },
  {
    id: 3,
    title: 'Ambiguity',
    content: [
      'Some things will not explain themselves.',
      'Some will disappear after you see them.',
    ],
    button: 'That\'s fine',
  },
  {
    id: 4,
    title: 'Notifications',
    content: [
      'We don\'t send notifications.',
      'You will never hear from us unless it\'s absolutely necessary.',
      'Or the end of the world.',
    ],
    subtext: '(No toggle. This is a statement, not a setting.)',
    button: 'Understood',
  },
  {
    id: 5,
    title: 'Time Boundaries',
    content: [
      'This app has limits.',
      'If you use it for more than three hours in a day,',
      'we will log you out.',
    ],
    subtext: 'Not as punishment.\nAs a boundary.',
    button: 'That makes sense',
  },
  {
    id: 6,
    title: 'Mode Selection',
    content: [
      'You can leave whenever you want.',
      'Or stay for a short drift.',
    ],
    hasToggle: true,
    toggleLabel: 'Short Drift mode (3–5 minutes)',
    button: 'Enter',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [shortDriftEnabled, setShortDriftEnabled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if onboarding is already complete
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      console.log('Onboarding status check:', onboardingComplete);
      
      if (onboardingComplete === 'true') {
        console.log('Onboarding already complete, redirecting to feed...');
        router.replace('/');
      } else {
        console.log('Showing onboarding screens...');
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setIsChecking(false);
    }
  };

  const handleNext = async () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Last screen - complete onboarding
      try {
        await AsyncStorage.setItem('onboarding_complete', 'true');
        await AsyncStorage.setItem('short_drift_mode', shortDriftEnabled.toString());
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

  if (isChecking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.checkingContainer}>
          <Text style={styles.checkingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {SCREENS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentScreen && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{screen.title}</Text>
        
        <View style={styles.textContainer}>
          {screen.content.map((line, index) => (
            <Text key={index} style={styles.contentText}>
              {line}
            </Text>
          ))}
        </View>

        {screen.subtext && (
          <Text style={styles.subtext}>{screen.subtext}</Text>
        )}

        {screen.hasToggle && (
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setShortDriftEnabled(!shortDriftEnabled)}
            activeOpacity={0.7}
          >
            <View style={styles.toggleRow}>
              <View
                style={[
                  styles.toggleCircle,
                  shortDriftEnabled && styles.toggleCircleActive,
                ]}
              >
                {shortDriftEnabled && (
                  <Ionicons name="checkmark" size={16} color="#0a0a0a" />
                )}
              </View>
              <Text style={styles.toggleLabel}>{screen.toggleLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
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
  checkingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#262626',
  },
  progressDotActive: {
    backgroundColor: '#f9fafb',
    width: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 32,
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
  subtext: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    marginTop: 24,
    fontStyle: 'italic',
  },
  toggleContainer: {
    marginTop: 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4b5563',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircleActive: {
    backgroundColor: '#f9fafb',
    borderColor: '#f9fafb',
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
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

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// It's good practice to have a dedicated header, similar to ChatHeader
// We can create this later if needed: import { SummaryHeader } from '../components/summary/SummaryHeader';

// Updated Placeholder data
const summaryData = {
  currentGoal: {
    description: 'Go to the gym',
    nextCheckIn: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Example: 12 hours from now
  },
  consistency: [
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
  ],
  aiInsights: [
    "You're doing great on weekdays!",
    'Consider breaking down larger goals.',
    'Remember to celebrate small wins!',
  ],
  missedGoals: {
    count: 2,
    topReason: 'Too tired',
  },
};

// Placeholder for navigation
const navigateToChat = () => {
  console.log('Navigate to chat screen for reflection');
};

const handleReportGoal = () => {
  console.log('Goal reported!');
  // Add logic to handle goal reporting, e.g., update state, call API
  alert('Goal reported successfully!');
};

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!summaryData.currentGoal || !summaryData.currentGoal.nextCheckIn) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const checkInTime = new Date(summaryData.currentGoal.nextCheckIn).getTime();
      const difference = checkInTime - now;

      if (difference <= 0) {
        setTimeRemaining('Check-in time!');
        // Here you might trigger an automatic check-in process or notification
        return null; // Stop interval if time is up
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    };

    const initialTime = calculateTimeRemaining();
    if (initialTime) setTimeRemaining(initialTime);

    const intervalId = setInterval(() => {
      const newTime = calculateTimeRemaining();
      if (newTime) {
        setTimeRemaining(newTime);
      } else {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [summaryData.currentGoal?.nextCheckIn]);

  const renderGoalCheckInSection = () => {
    if (!summaryData.currentGoal) {
      return (
        <TouchableOpacity onPress={() => console.log('Set New Goal Pressed')}>
          <ThemedText style={[styles.sectionText, styles.buttonText]}>Set a new goal</ThemedText>
        </TouchableOpacity>
      );
    }

    return (
      <>
        <ThemedText style={styles.goalDescriptionText}>
          Time to: {summaryData.currentGoal.description}
        </ThemedText>
        <ThemedView style={styles.countdownCirclePlaceholder}>
          <ThemedText style={styles.countdownText}>{timeRemaining}</ThemedText>
        </ThemedView>
        <ThemedText style={styles.smallText}>Next check-in</ThemedText>
        <TouchableOpacity style={styles.reportButton} onPress={handleReportGoal}>
          <ThemedText style={styles.reportButtonText}>I Did It!</ThemedText>
        </TouchableOpacity>
      </>
    );
  };

  const renderConsistencyTracker = () => {
    return (
      <ThemedView style={styles.consistencyTracker}>
        {summaryData.consistency.map((active, index) => (
          <ThemedView
            key={index}
            style={[
              styles.consistencyDay,
              {
                backgroundColor: active
                  ? styles.consistencyDayActive.backgroundColor
                  : styles.consistencyDayInactive.backgroundColor,
              },
            ]}
          />
        ))}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#F9FAFB', '#F3F4F6']} // Updated to neutral grays
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={[styles.content, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, marginTop: 20 }}
      >
        {/* Current Goal & Check-in Section */}
        <ThemedView style={[styles.sectionContainer, styles.goalSectionContainer]}>
          <ThemedText style={styles.sectionTitle}>Current Goal</ThemedText>
          {renderGoalCheckInSection()}
        </ThemedView>

        {/* Consistency Tracker Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Your Consistency</ThemedText>
          {renderConsistencyTracker()}
          <ThemedText style={styles.smallText}>Last 35 days</ThemedText>
        </ThemedView>

        {/* AI Insights Section - Now includes Missed Goals */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>AI Insights & Tips</ThemedText>
          {summaryData.missedGoals && summaryData.missedGoals.count > 0 && (
            <ThemedText style={[styles.insightText, styles.missedGoalText]}>
              {`❌ You missed ${summaryData.missedGoals.count} goal${
                summaryData.missedGoals.count > 1 ? 's' : ''
              }. Top reason: '${summaryData.missedGoals.topReason}'`}
            </ThemedText>
          )}
          {summaryData.aiInsights.map((insight, index) => (
            <ThemedText key={index} style={styles.insightText}>
              • {insight}
            </ThemedText>
          ))}
          <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
            <ThemedText style={styles.chatButtonText}>Talk to AI & Reflect</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // To allow gradient to show through
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937', // Darkest gray
    textAlign: 'center',
    marginVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24, // Increased for more whitespace
  },
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly more opaque white cards
    borderRadius: 12, // Standardized border radius
    padding: 16, // Standardized padding
    marginBottom: 24, // Standardized margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Subtle shadow
    shadowOpacity: 0.05, // More subtle shadow
    shadowRadius: 10, // Softened shadow
    elevation: 2, // Adjusted elevation for Android
  },
  goalSectionContainer: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151', // Dark gray
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: '#4B5563', // Medium-dark gray
    lineHeight: 22,
  },
  buttonText: {
    // For "Set a new goal"
    color: '#4A5568', // Muted primary action color (dark slate gray)
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  goalDescriptionText: {
    fontSize: 16,
    color: '#374151', // Dark gray
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'normal', // Less emphasis
  },
  countdownCirclePlaceholder: {
    width: 120, // Reduced size
    height: 120,
    borderRadius: 60, // Half of width/height
    backgroundColor: '#F3F4F6', // Very light gray, neutral
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
  },
  countdownText: {
    fontSize: 28, // Slightly reduced but still prominent
    color: '#1F2937', // Darkest gray for clarity
    fontWeight: '600', // Strong but not overly bold
  },
  reportButton: {
    backgroundColor: '#4A5568', // Dark slate gray for primary action
    borderRadius: 8, // Standardized radius
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  reportButtonText: {
    color: '#FFFFFF', // White text on dark button
    fontSize: 15,
    fontWeight: '600',
  },
  consistencyTracker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  consistencyDay: {
    width: 16, // Smaller, more refined
    height: 16,
    borderRadius: 3, // Subtle rounding
    margin: 3, // Consistent spacing
  },
  consistencyDayActive: {
    // Style for active day background color
    backgroundColor: '#6B7280', // Mid-gray for active state
  },
  consistencyDayInactive: {
    // Style for inactive day background color
    backgroundColor: '#E5E7EB', // Light gray for inactive state
  },
  smallText: {
    fontSize: 12,
    color: '#6B7280', // Mid-gray for less emphasis
    textAlign: 'center',
    marginTop: 8, // Standardized margin
  },
  insightText: {
    fontSize: 14, // Clean and readable
    color: '#4B5563', // Medium-dark gray
    marginBottom: 8,
    lineHeight: 20, // Good readability
  },
  missedGoalText: {
    fontWeight: '600', // Clear emphasis
    color: '#EF4444', // Tailwind red-500, for warnings
    marginBottom: 12,
  },
  chatButton: {
    backgroundColor: '#4A5568', // Consistent with reportButton
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20, // More space before final action
  },
  chatButtonText: {
    color: '#FFFFFF', // Consistent with reportButtonText
    fontSize: 15,
    fontWeight: '600',
  },
});

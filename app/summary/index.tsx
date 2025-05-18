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
            style={[styles.consistencyDay, { backgroundColor: active ? '#7666F9' : '#E0E0E0' }]}
          />
        ))}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['rgba(243, 231, 255, 1)', 'rgba(228, 208, 255, 1)', 'rgba(255, 231, 249, 1)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* <SummaryHeader topInset={insets.top} /> */}
      {/* Placeholder for Header, can add later if needed */}
      <ThemedView
        style={{ paddingTop: insets.top, paddingHorizontal: 15, backgroundColor: 'transparent' }}
      >
        <ThemedText style={styles.headerTitle}>Your Summary</ThemedText>
      </ThemedView>

      <ScrollView
        style={[styles.content, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
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
    backgroundColor: 'transparent', // Ensure gradient shows
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10, // Added some vertical margin
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white cards
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goalSectionContainer: {
    // Specific styles for the goal section for centering
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center', // Center section titles as well for consistency
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  buttonText: {
    // Reused for "Set a new goal"
    color: '#7666F9',
    fontWeight: 'bold',
    fontSize: 18, // Made it a bit larger
    textAlign: 'center',
    padding: 10,
  },
  goalDescriptionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  countdownCirclePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(118, 102, 249, 0.1)', // Light purple tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, // Reduced margin slightly
    borderWidth: 2,
    borderColor: '#7666F9',
  },
  countdownText: {
    fontSize: 30, // Larger font for countdown time
    color: '#7666F9',
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#7666F9',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 15, // Added margin top
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consistencyTracker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the tracker items
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  consistencyDay: {
    width: 20,
    height: 20,
    borderRadius: 4,
    margin: 2,
  },
  smallText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center', // Centered this text as well
    marginTop: 3,
  },
  insightText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8, // Increased margin slightly for better spacing
    lineHeight: 20,
  },
  missedGoalText: {
    // Style for the missed goals text to make it stand out
    fontWeight: 'bold',
    color: '#D32F2F', // A reddish color for emphasis
    marginBottom: 10, // Add some space before the other insights
  },
  chatButton: {
    backgroundColor: '#7666F9',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 15,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

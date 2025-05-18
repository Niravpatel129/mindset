import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo and Ionicons
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// It's good practice to define your name and image source outside the component,
// or pass them as props if they are dynamic.
const userName = 'Max';
// Placeholder image URL - replace with your actual image source

export default function TopSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.dailyReflectionText}>Daily reflection</Text>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello, {userName} 👋</Text>
      </View>
      <Text style={styles.mainQuestionText}>
        How do you feel about
        <br />
        your current emotions?
      </Text>

      <TouchableOpacity style={styles.reflectionButton}>
        <Text style={styles.reflectionButtonText}>Your reflection..</Text>
        <Ionicons name='arrow-forward' size={14} color='#241712' />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5e6e2', // A light pinkish beige, adjust as needed
    paddingHorizontal: 20,
    paddingTop: 40, // Added more top padding
    paddingBottom: 30, // Added bottom padding
    // flex: 1, // Removed flex: 1 as it might take too much space if not constrained by parent
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  dailyReflectionText: {
    fontSize: 16,
    color: '#A0A0A0', // A light gray color
    marginBottom: 20, // Space below "Daily reflection"
    fontFamily: 'System', // Added system font
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically align items in the row
  },
  greetingText: {
    fontSize: 36, // Large text size
    fontWeight: 'thin',
    color: '#333333', // Dark gray / black
    fontFamily: 'System', // Added system font
  },
  profileImage: {
    width: 40, // Adjust size as needed
    height: 40,
    borderRadius: 20, // Make it circular
  },
  mainQuestionText: {
    fontSize: 36, // Large text size
    fontWeight: 'thin',
    color: '#333333', // Dark gray / black
    lineHeight: 44, // Adjust line height for better readability
    fontFamily: 'System', // Added system font
  },
  reflectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eeded6', // Light beige background
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25, // Rounded corners
    marginTop: 20, // Space above the button
  },
  reflectionButtonText: {
    fontSize: 14,
    color: '#9f8f87', // Dark gray text
    fontFamily: 'System',
  },
});

import BottomSection from '@/components/Summary/BottomSection';
import MiddleSection from '@/components/Summary/MiddleSection';
import TopSection from '@/components/Summary/TopSection';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function SummaryScreen() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <TopSection />
      <MiddleSection />
      <BottomSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f4fa',
  },
  contentContainer: {
    flexGrow: 1, // Ensures content area can grow and enables scrolling if content overflows
  },
});

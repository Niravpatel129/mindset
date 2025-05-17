import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from 'universal-gradient-text';

interface ChatHeaderProps {
  topInset: number;
}

export function ChatHeader({ topInset }: ChatHeaderProps) {
  return (
    <>
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 10,
            paddingBottom: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <GradientText colors={['#7666F9', '#C776F9']} style={styles.title}>
            Mindset
          </GradientText>
        </View>
      </View>
      <ThemedText style={styles.stats}>12,048 Users Accomplished their Goal today</ThemedText>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  stats: {
    fontSize: 16,
    color: '#7666F9',
    backgroundClip: 'text',
    textAlign: 'center',
    marginTop: 10,
  },
});

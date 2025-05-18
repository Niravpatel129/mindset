import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MiddleSection() {
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text style={styles.title}>Your progress</Text>
          <Text style={styles.progress}>89%</Text>
        </View>
        <View>
          <Text
            style={{
              color: '#b4b4b4',
              fontSize: 16,
              fontWeight: 100,
              letterSpacing: -0.5,
            }}
          >
            Of the weekly
            <br />
            plan completed
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 16,
    letterSpacing: -0.5,
    fontWeight: 'bold',
    color: '#333333',
  },
  progress: {
    fontSize: 60,
    fontWeight: 400,
    letterSpacing: 0.5,
  },
});

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FloatingOrb({ index }: { index: number }) {
  const animation = withRepeat(
    withSequence(
      withTiming(-20, { duration: 2000 + index * 500, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 2000 + index * 500, easing: Easing.inOut(Easing.ease) }),
    ),
    -1,
    true,
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animation }],
  }));

  return (
    <Animated.View style={[styles.orb, animStyle]}>
      <LinearGradient
        colors={[
          index === 0 ? '#E4D0FF' : index === 1 ? '#FFE7F9' : '#D0E6FF',
          index === 0 ? '#FFE7F9' : index === 1 ? '#D0E6FF' : '#E4D0FF',
        ]}
        style={styles.orbGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isRecording ? 1.1 : 1) }],
  }));

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#F3E7FF', '#E4D0FF', '#FFE7F9']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            paddingBottom: 10,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <ThemedText style={styles.title}>Mindset</ThemedText>
      </View>

      {/* Stats */}
      <ThemedText style={styles.stats}>2048 Users Accomplished their Goal today</ThemedText>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Floating Orbs */}
        <View style={styles.orbsContainer}>
          {[0].map((index) => (
            <FloatingOrb key={index} index={index} />
          ))}
        </View>

        {/* Welcome Message */}
        {showWelcome && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.welcomeContainer}>
            <ThemedText style={styles.welcomeText}>
              Hello Nehal! {'\n'}Did you feel you accomplished your goal today?
            </ThemedText>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
          <AnimatedPressable
            style={[styles.micButton, micStyle]}
            onPress={() => setIsRecording(!isRecording)}
          >
            <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={32} color='#333' />
          </AnimatedPressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  stats: {
    fontSize: 16,
    color: '#7666F9',
    backgroundClip: 'text',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    lineHeight: 40,
  },
  orbsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 200,
    marginTop: 40,
  },
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  welcomeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginTop: 40,
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

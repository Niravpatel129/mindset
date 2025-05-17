import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Individual wave line component
function WaveLine({ delay }: { delay: number }) {
  const animation = useSharedValue(1);

  useEffect(() => {
    animation.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1.5, { duration: 500, easing: Easing.ease })),
        withTiming(1, { duration: 500, easing: Easing.ease }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(animation);
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: animation.value }],
  }));

  return <Animated.View style={[styles.waveLine, animatedStyle]} />;
}

export function VoiceWave() {
  return (
    <View style={styles.waveContainer}>
      {[0, 1, 2, 3, 4].map((index) => (
        <WaveLine key={index} delay={index * 100} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginBottom: 8,
    gap: 3,
  },
  waveLine: {
    width: 3,
    height: 20,
    backgroundColor: '#7666F9',
    borderRadius: 2,
  },
});

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type OrbState = 'idle' | 'listening' | 'processing';

interface FloatingOrbProps {
  index: number;
  state: OrbState;
}

export function FloatingOrb({ index, state }: FloatingOrbProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Cancel any ongoing animations
    cancelAnimation(scale);
    cancelAnimation(translateY);
    cancelAnimation(rotation);

    switch (state) {
      case 'listening':
        // Energetic pulsing animation
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.9, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(10, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
        rotation.value = 0;
        break;

      case 'processing':
        // Smooth circular motion
        scale.value = withTiming(1.05, { duration: 500 });
        translateY.value = withSpring(0);
        rotation.value = withRepeat(
          withTiming(2 * Math.PI, {
            duration: 2000,
            easing: Easing.linear,
          }),
          -1,
          true,
        );
        break;

      default: // idle
        // Gentle floating motion
        scale.value = withTiming(1, { duration: 500 });
        translateY.value = withRepeat(
          withSequence(
            withTiming(-20, { duration: 2000 + index * 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 2000 + index * 500, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
        rotation.value = withTiming(0, { duration: 500 });
        break;
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(translateY);
      cancelAnimation(rotation);
    };
  }, [state, index]);

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
      ],
    };
  });

  // Get colors based on state
  const getGradientColors = (): [string, string] => {
    switch (state) {
      case 'listening':
        return [index === 0 ? '#FFB6E1' : '#FFE7F9', index === 0 ? '#FF69B4' : '#FF1493'];
      case 'processing':
        return [index === 0 ? '#7666F9' : '#836FFF', index === 0 ? '#4B0082' : '#483D8B'];
      default: // idle
        return [index === 0 ? '#E4D0FF' : '#FFE7F9', index === 0 ? '#FFE7F9' : '#D0E6FF'];
    }
  };

  return (
    <Animated.View style={[styles.orb, animStyle]}>
      <LinearGradient
        colors={getGradientColors()}
        style={[
          styles.orbGradient,
          state === 'listening' && styles.orbGradientListening,
          state === 'processing' && styles.orbGradientProcessing,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  orbGradientListening: {
    opacity: 0.9,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  orbGradientProcessing: {
    opacity: 0.95,
    shadowColor: '#7666F9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
});

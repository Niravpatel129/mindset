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
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Cancel any ongoing animations
    cancelAnimation(scale);
    cancelAnimation(translateY);
    cancelAnimation(translateX);
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
            withTiming(-10 - index * 5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(10 + index * 5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
        translateX.value = withRepeat(
          withSequence(
            withTiming(5 + index * 2, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            withTiming(-5 - index * 2, { duration: 700, easing: Easing.inOut(Easing.ease) }),
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
        translateX.value = withSpring(index % 2 === 0 ? 5 : -5);
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
            withTiming(-15 - index * 5, {
              duration: 2000 + index * 500,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(5 + index * 2, {
              duration: 2000 + index * 500,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        );
        translateX.value = withRepeat(
          withSequence(
            withTiming(10 + index * 3, {
              duration: 2500 + index * 600,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(-10 - index * 3, {
              duration: 2500 + index * 600,
              easing: Easing.inOut(Easing.ease),
            }),
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
      cancelAnimation(translateX);
      cancelAnimation(rotation);
    };
  }, [state, index]);

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
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
        if (index === 0) {
          return ['#FFB6E1', '#FF69B4']; // Pinkish for main orb
        } else if (index === 1) {
          return ['#FFDAB9', '#FFA07A']; // Peach/Light Salmon for second orb
        }
        return ['#FFE7F9', '#FF1493']; // Original fallback (Hotter Pink for third orb)
      case 'processing':
        if (index === 0) {
          return ['#7666F9', '#4B0082']; // Purple for main orb
        } else if (index === 1) {
          return ['#ADD8E6', '#87CEFA']; // Light Blue for second orb
        }
        return ['#836FFF', '#483D8B']; // Original fallback (Darker Purple/Blue for third orb)
      default: // idle
        if (index === 0) {
          return ['#E4D0FF', '#FFE7F9']; // Light Lavender/Pink for main orb
        } else if (index === 1) {
          return ['#E0FFFF', '#AFEEEE']; // Light Cyan/Pale Turquoise for second orb
        }
        return ['#FFE7F9', '#D0E6FF']; // Original fallback (Light Pink/Blue for third orb)
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
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'absolute',
    opacity: 0.85,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
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

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const NUM_STARS = 50;

type Star = {
  top: number;
  left: number;
  size: number;
  delay: number;
};

function generateStars(): Star[] {
  return Array.from({ length: NUM_STARS }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3000,
  }));
}

export function StarryBackground() {
  const stars = generateStars();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      {stars.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
            },
            useAnimatedStyle(() => ({
              opacity: opacity.value,
            })),
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a1a',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
});

export default StarryBackground;

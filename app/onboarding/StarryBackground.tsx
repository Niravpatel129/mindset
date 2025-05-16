import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUMBER_OF_STARS = 100;

type Star = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
};

export function StarryBackground() {
  // Use useMemo to ensure star positions remain consistent across re-renders
  const stars = useMemo(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < NUMBER_OF_STARS; i++) {
      generatedStars.push({
        id: i,
        left: Math.random() * SCREEN_WIDTH,
        top: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * 2 + 1, // Stars between 1-3px
        opacity: Math.random() * 0.5 + 0.2, // Opacity between 0.2-0.7
      });
    }
    return generatedStars;
  }, []); // Empty dependency array ensures stars don't regenerate

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default StarryBackground;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#050508', // Darker background color
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
});

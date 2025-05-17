import { ThemedText } from '@/components/ThemedText';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FadingTextProps {
  text: string;
}

export function FadingText({ text }: FadingTextProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-100, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
    opacity.value = withTiming(0, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.fadingTextContainer, animatedStyle]}>
      <ThemedText numberOfLines={2} style={styles.fadingText}>
        {text}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fadingTextContainer: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fadingText: {
    fontSize: 16,
    color: '#7666F9',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

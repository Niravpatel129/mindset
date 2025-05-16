import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { OnboardingQuestions } from './OnboardingQuestions';

export default function OnboardingScreen() {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [visibleWordIndex, setVisibleWordIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [sentenceComplete, setSentenceComplete] = useState(false);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const blurValue = useSharedValue(15);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sentences = [
    'Welcome to Mindset',
    'Your journey to mental clarity begins here',
    'Focus on what matters most',
    'Take a deep breath and let&apos;s begin',
  ];

  const currentSentence = sentences[currentSentenceIndex];
  const words = currentSentence ? currentSentence.split(' ') : [];

  // Auto-animate words in the current sentence
  useEffect(() => {
    // Reset when switching to a new sentence
    setVisibleWordIndex(-1);
    setSentenceComplete(false);
    setShowTapToContinue(false);

    // Start the word animation sequence
    const animateWords = () => {
      const wordInterval = setInterval(() => {
        setVisibleWordIndex((prev) => {
          const nextIndex = prev + 1;

          // If we've animated all words, clear interval and mark sentence as complete
          if (nextIndex >= words.length - 1) {
            clearInterval(wordInterval);
            setSentenceComplete(true);
            // Add delay before showing tap to continue
            setTimeout(() => {
              setShowTapToContinue(true);
            }, 1000);
            return words.length - 1;
          }

          return nextIndex;
        });
      }, 300); // Time between words appearing - reduced from 600ms to 300ms for faster word appearance

      return wordInterval;
    };

    // Small delay before starting the animation
    timerRef.current = setTimeout(() => {
      const interval = animateWords();
      timerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
    }, 200);

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSentenceIndex, words.length]);

  // Animate the blur effect for each new word
  useEffect(() => {
    if (visibleWordIndex >= 0) {
      blurValue.value = 15;
      blurValue.value = withTiming(0, { duration: 400 });
    }
  }, [visibleWordIndex]);

  const handleTap = () => {
    // Only allow tapping when the current sentence animation is complete
    if (!sentenceComplete) return;

    // Move to next sentence
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    } else {
      // All sentences complete
      setIsComplete(true);
      // Add a small delay before showing questions
      setTimeout(() => {
        setShowQuestions(true);
      }, 500);
    }
  };

  const animatedBlurStyle = useAnimatedStyle(() => {
    return {
      filter: `blur(${blurValue.value}px)`,
      opacity: withTiming(1, { duration: 800 }),
    };
  });

  return (
    <ThemedView style={styles.container}>
      {!isComplete ? (
        <TouchableOpacity style={styles.content} onPress={handleTap} activeOpacity={0.9}>
          <View style={styles.textContainer}>
            {/* Render all words with their final positions */}
            {words.map((word, index) => (
              <View key={`${currentSentenceIndex}-${index}`} style={styles.wordContainer}>
                {index <= visibleWordIndex ? (
                  <Animated.View
                    entering={FadeIn.duration(300)} // Reduced from 500ms to 300ms for faster word fade-in
                    style={[index === visibleWordIndex ? animatedBlurStyle : null]}
                  >
                    <ThemedText style={styles.word} type='title'>
                      {word}
                    </ThemedText>
                  </Animated.View>
                ) : (
                  // Invisible placeholder to maintain layout
                  <View style={styles.invisiblePlaceholder}>
                    <ThemedText style={[styles.word, { opacity: 0 }]} type='title'>
                      {word}
                    </ThemedText>
                  </View>
                )}
                {/* Add space between words */}
                <ThemedText style={styles.word}> </ThemedText>
              </View>
            ))}
          </View>

          {sentenceComplete && showTapToContinue && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.tapToContinueContainer}>
              <ThemedText style={styles.tapToContinue}>tap to continue</ThemedText>
            </Animated.View>
          )}
        </TouchableOpacity>
      ) : showQuestions ? (
        <OnboardingQuestions />
      ) : (
        <Animated.View entering={FadeIn.duration(500)} style={styles.completeContainer}>
          <ThemedText type='title' style={styles.completeText}>
            Let&apos;s Get Started
          </ThemedText>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '90%',
  },
  wordContainer: {
    flexDirection: 'row',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  word: {
    fontSize: 28,
  },
  invisiblePlaceholder: {
    // Ensure placeholder takes up the same space as the animated text
    position: 'relative',
  },
  tapToContinueContainer: {
    position: 'absolute',
    bottom: 50,
  },
  tapToContinue: {
    opacity: 0.6,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 32,
  },
});

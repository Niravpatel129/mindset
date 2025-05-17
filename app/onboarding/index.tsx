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
    'Your personal accountability partner',
    "Together, we'll track your daily goals",
    'No judgment, just honest check-ins',
    "Let's make progress, one day at a time",
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
            return words.length - 1;
          }

          return nextIndex;
        });
      }, 450); // Time between words appearing - adjusted for more natural pacing

      return wordInterval;
    };

    // Small delay before starting the animation
    timerRef.current = setTimeout(() => {
      const interval = animateWords();
      timerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
    }, 600);

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSentenceIndex, words.length]);

  // Handle showing tap to continue after sentence is complete
  useEffect(() => {
    if (sentenceComplete) {
      const tapTimer = setTimeout(() => {
        setShowTapToContinue(true);
      }, 2000);

      return () => clearTimeout(tapTimer);
    }
  }, [sentenceComplete]);

  // Animate the blur effect for each new word
  useEffect(() => {
    if (visibleWordIndex >= 0) {
      blurValue.value = 15;
      blurValue.value = withTiming(0, { duration: 600 }); // Slower blur transition
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
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 40,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  wordContainer: {
    flexDirection: 'row',
    marginHorizontal: 3,
    marginVertical: 4,
  },
  word: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  invisiblePlaceholder: {
    position: 'relative',
  },
  tapToContinueContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  tapToContinue: {
    opacity: 0.6,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completeText: {
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 44,
  },
});

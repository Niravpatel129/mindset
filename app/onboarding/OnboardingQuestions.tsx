import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { StarryBackground } from '../components/StarryBackground';
import { BodyIcon, MindIcon, SpiritIcon } from './FocusAreaIcons';

const { width } = Dimensions.get('window');

type FocusArea = {
  id: 'mind' | 'body' | 'spirit';
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
};

const focusAreas: FocusArea[] = [
  {
    id: 'mind',
    title: 'Mind',
    description:
      "I'll be here every day to support your mental well-being journey. Together, we'll work on simple goals for peace of mind, emotional balance, and inner calm. Like a trusted friend, I'll celebrate your wins and help you through tough days.",
    icon: MindIcon,
    color: '#0a7ea4',
  },
  {
    id: 'body',
    title: 'Body',
    description:
      "Each day, I'll check in on your physical wellness goals. Whether it's gentle movement, mindful breathing, or just taking a moment to stretch - I'll be here to encourage you and keep you going, one day at a time.",
    icon: BodyIcon,
    color: '#2ecc71',
  },
  {
    id: 'spirit',
    title: 'Spirit',
    description:
      "I'll be your daily companion in nurturing your spirit. Through simple practices like gratitude and mindfulness, we'll strengthen your sense of purpose. I'll be here every day to listen and support your inner growth.",
    icon: SpiritIcon,
    color: '#9b59b6',
  },
];

type Question = {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'number' | 'focus-area';
};

const questions: Question[] = [
  {
    id: 'name',
    question: 'Hi! I&apos;ll be your daily wellness companion. What&apos;s your name?',
    placeholder: 'Share your name',
    type: 'text',
  },
  {
    id: 'age',
    question: 'It&apos;s nice to meet you! And your age?',
    placeholder: 'Your age',
    type: 'number',
  },
  {
    id: 'focus',
    question:
      'I&apos;ll check in with you every day about all areas of wellness, but which one would you like to focus on most right now?',
    placeholder: 'Choose your focus',
    type: 'focus-area',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DuoButton({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      mass: 0.6,
      damping: 8,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      mass: 0.6,
      damping: 8,
      stiffness: 200,
    });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.baseButton,
        !disabled && styles.buttonEnabled,
        disabled && styles.buttonDisabled,
        animatedStyle,
      ]}
    >
      <View style={styles.buttonInner}>{children}</View>
    </AnimatedPressable>
  );
}

export function OnboardingQuestions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isComplete) {
      translateY.value = withSequence(
        withDelay(
          300,
          withSpring(0, {
            mass: 1,
            damping: 12,
            stiffness: 100,
          }),
        ),
      );
      opacity.value = withDelay(300, withSpring(1));
    }
  }, [isComplete]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
      console.log('Completed answers:', answers);
    }
  };

  const canProceed = answers[currentQuestion?.id]?.trim().length > 0;
  const selectedFocusArea = focusAreas.find((area) => area.id === answers.focus);

  const handleStartJourney = async () => {
    try {
      const onboardingData = {
        name: answers.name,
        age: answers.age,
        focusArea: answers.focus,
        completedOnboarding: true,
      };

      await AsyncStorage.setItem('@mindset_onboarding', JSON.stringify(onboardingData));
      router.replace('/(tabs)' as any);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      router.replace('/(tabs)' as any);
    }
  };

  const renderFocusAreaSelection = () => (
    <ScrollView
      style={styles.focusAreaScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.focusAreaScrollContent}
    >
      {focusAreas.map((area) => {
        const Icon = area.icon;
        const isSelected = answers.focus === area.id;
        return (
          <TouchableOpacity
            key={area.id}
            style={[styles.focusAreaCard, isSelected && styles.focusAreaCardSelected]}
            onPress={() => handleAnswer(area.id)}
          >
            <Icon size={60} color={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'} />
            <ThemedText
              type='defaultSemiBold'
              style={[styles.focusAreaTitle, isSelected && styles.focusAreaTitleSelected]}
            >
              {area.title}
            </ThemedText>
            <ThemedText
              style={[
                styles.focusAreaDescription,
                isSelected && styles.focusAreaDescriptionSelected,
              ]}
            >
              {area.description}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  if (isComplete) {
    return (
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.container, styles.completeContainer]}
      >
        <StarryBackground />
        <Animated.View style={[styles.chatContainer, floatingStyle]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>AI</ThemedText>
            </View>
          </View>
          <View style={styles.messageContainer}>
            <View style={styles.messageHeader}>
              <ThemedText style={styles.aiName}>Mindset AI Coach</ThemedText>
              <View style={styles.onlineIndicator} />
            </View>
            <ThemedText style={styles.welcomeText}>Great to meet you, {answers.name}!</ThemedText>
            <ThemedText style={styles.subtitle}>
              I&apos;ll pop by each day to see how you&apos;re doing with your {answers.focus}{' '}
              practice, and we can talk about your other wellness goals too. Remember, small steps
              each day lead to big changes over time. Ready to begin?
            </ThemedText>
          </View>
        </Animated.View>
        <DuoButton onPress={handleStartJourney}>
          <ThemedText style={styles.buttonText}>Start My Journey</ThemedText>
        </DuoButton>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={SlideInRight.duration(500)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.container}
    >
      <StarryBackground />
      <ThemedText type='title' style={styles.questionText}>
        {currentQuestion.question}
      </ThemedText>

      {currentQuestion.type === 'focus-area' ? (
        renderFocusAreaSelection()
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor='rgba(255,255,255,0.5)'
            value={answers[currentQuestion.id] || ''}
            onChangeText={handleAnswer}
            keyboardType={currentQuestion.type === 'number' ? 'number-pad' : 'default'}
            autoFocus
          />
        </View>
      )}

      <View style={styles.bottomContainer}>
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            {currentQuestionIndex + 1} of {questions.length}
          </ThemedText>
        </View>

        <DuoButton onPress={handleNext} disabled={!canProceed}>
          <ThemedText style={styles.buttonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
          </ThemedText>
        </DuoButton>
      </View>
    </Animated.View>
  );
}

export default OnboardingQuestions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    backgroundColor: 'transparent',
  },
  completeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    fontSize: 18,
    marginBottom: 20,
    minHeight: 50,
    textAlign: 'center',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#7666F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 4,
    borderBottomColor: '#5B4DC7',
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 8px rgba(118, 102, 249, 0.5)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  buttonEnabled: {
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 8px rgba(118, 102, 249, 0.5)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  chatContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(118, 102, 249, 0.1)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(118, 102, 249, 0.2)',
    backdropFilter: 'blur(20px)',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(118, 102, 249, 0.2)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
      },
    }),
  },
  avatarContainer: {
    position: 'absolute',
    top: -24,
    left: 20,
    zIndex: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7666F9',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(118, 102, 249, 0.3)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  messageContainer: {
    marginTop: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    textAlign: 'left',
  },
  focusAreaScroll: {
    width: '100%',
    maxHeight: 500,
  },
  focusAreaScrollContent: {
    alignItems: 'center',
    gap: 15,
  },
  focusAreaCard: {
    padding: 25,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#7666F9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  focusAreaCardSelected: {
    backgroundColor: 'rgba(118, 102, 249, 0.15)',
    borderColor: '#7666F9',
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.3,
  },
  focusAreaTitle: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  focusAreaTitleSelected: {
    color: '#fff',
  },
  focusAreaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    textAlign: 'center',
  },
  focusAreaDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  focusAreaButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(118, 102, 249, 0.2)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  selectedFocusArea: {
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(118, 102, 249, 0.3)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 4,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 4px rgba(76, 175, 80, 0.5)',
      },
      default: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  completionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(118, 102, 249, 0.15)',
      },
      default: {
        shadowColor: '#7666F9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 7,
      },
    }),
  },
  completionCardSelected: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(118, 102, 249, 0.3)',
      },
      default: {
        shadowOpacity: 0.3,
        elevation: 8,
      },
    }),
  },
  completionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  baseButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: '100%',
  },
});

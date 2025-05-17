import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FloatingOrb({
  index,
  state,
}: {
  index: number;
  state: 'idle' | 'listening' | 'processing';
}) {
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

// Voice Wave component
function VoiceWave() {
  return (
    <View style={styles.waveContainer}>
      {[0, 1, 2, 3, 4].map((index) => (
        <WaveLine key={index} delay={index * 100} />
      ))}
    </View>
  );
}

// FadingText component for speech transcription
function FadingText({ text }: { text: string }) {
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

// Voice recognition implementations for different platforms
const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const recognitionRef = useRef<any>(null);

  const onWeb = Platform.OS === 'web';

  useEffect(() => {
    if (onWeb) {
      // Initialize Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        console.log('🎤 Initializing Web Speech API');
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        // Add error handler
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        // Add end handler
        recognitionRef.current.onend = () => {
          console.log('🎤 Web Speech recognition ended');
        };
      } else {
        console.error('Web Speech API not supported in this browser');
      }
    } else {
      // Initialize native voice recognition
      const initNativeVoice = async () => {
        try {
          console.log('🎤 Initializing Native Voice API');
          const Voice = (await import('@react-native-voice/voice')).default;
          recognitionRef.current = Voice;

          Voice.onSpeechError = (e: any) => {
            console.error('Native Voice error:', e);
          };

          Voice.onSpeechEnd = () => {
            console.log('🎤 Native Voice recognition ended');
          };
        } catch (e) {
          console.error('Failed to initialize voice recognition:', e);
        }
      };
      initNativeVoice();
    }

    return () => {
      console.log('🎤 Cleaning up voice recognition');
      if (recognitionRef.current) {
        if (onWeb) {
          recognitionRef.current.stop();
        } else {
          recognitionRef.current.destroy().then(recognitionRef.current.removeAllListeners);
        }
      }
    };
  }, [onWeb]);

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        throw new Error('Voice recognition not initialized');
      }

      setTranscribedText('');
      console.log('🎤 Starting recording...');

      if (onWeb) {
        // Web implementation
        recognitionRef.current.onresult = (event: any) => {
          const results = event.results;
          const lastResult = results[results.length - 1];
          const transcript = lastResult[0].transcript.trim();
          console.log('🗣️ (Web) Interim result:', transcript);

          if (lastResult.isFinal) {
            setTranscribedText(transcript);
            console.log('🗣️ (Web) Final result:', transcript);
          }
        };

        recognitionRef.current.start();
      } else {
        // Native implementation
        await recognitionRef.current.start('en-US');
        recognitionRef.current.onSpeechResults = (e: { value?: string[] }) => {
          const text = (e.value?.[0] || '').trim();
          setTranscribedText(text);
          console.log('🗣️ (Native) User said:', text);
        };
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('🎤 Stopping recording...');
      if (!recognitionRef.current) return false;

      if (onWeb) {
        recognitionRef.current.stop();
      } else {
        await recognitionRef.current.stop();
      }
      setIsRecording(false);
      console.log('🎤 Recording stopped successfully');
      return true;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      return false;
    }
  };

  return {
    isRecording,
    transcribedText,
    startRecording,
    stopRecording,
  };
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [aiMessage, setAiMessage] = useState(
    'Hello Nehal!\nDid you feel you accomplished your goal today?',
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Add pulse animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const { isRecording, transcribedText, startRecording, stopRecording } = useVoiceRecognition();
  const recordingStartTime = useRef<number | null>(null);

  // Add useEffect to control pulse animation
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = 1;
      pulseOpacity.value = 0.8;
      pulseScale.value = withRepeat(
        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0);
    }
  }, [isRecording]);

  // Add pulse animation style
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleMicPress = async () => {
    if (!isRecording) {
      setShowTranscription(false);
      recordingStartTime.current = Date.now();
      await startRecording();
    } else {
      setIsProcessing(true);
      if (await stopRecording()) {
        const duration = Date.now() - (recordingStartTime.current || 0);
        console.log(`Recording duration: ${duration}ms`);
        setShowTranscription(true);
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAiMessage("Why weren't you able to meet your goal today?");
      }
      setIsProcessing(false);
    }
  };

  const BUBBLE_BG_COLOR = 'rgba(255, 255, 255, 1)'; // Fully opaque white

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isRecording ? 1.1 : 1) }],
  }));

  // Determine the current state for the orb
  const orbState = isProcessing ? 'processing' : isRecording ? 'listening' : 'idle';

  return (
    <ThemedView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://www.transparenttextures.com/patterns/diamond-upholstery.png' }}
        style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
        resizeMode='repeat'
        onLoad={() => {
          console.log('Texture image loaded');
          setImageLoaded(true);
        }}
        onError={(error) => console.error('Failed to load texture:', error)}
      >
        <LinearGradient
          colors={[
            'rgba(243, 231, 255, 0.9)',
            'rgba(228, 208, 255, 0.9)',
            'rgba(255, 231, 249, 0.9)',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {!imageLoaded && (
          <View style={StyleSheet.absoluteFill}>
            <ThemedText>Loading texture...</ThemedText>
          </View>
        )}
      </ImageBackground>

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
      <ThemedText style={styles.stats}>12,048 Users Accomplished their Goal today</ThemedText>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Floating Orbs */}
        <View style={styles.orbsContainer}>
          {[0].map((index) => (
            <FloatingOrb key={index} index={index} state={orbState} />
          ))}
        </View>

        {/* AI Message */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.welcomeContainer, { backgroundColor: BUBBLE_BG_COLOR, borderRadius: 9 }]}
        >
          <View style={[styles.messageContent, { backgroundColor: BUBBLE_BG_COLOR }]}>
            <ThemedText style={styles.welcomeText}>{aiMessage}</ThemedText>
          </View>
          <View style={[styles.chevronUp, { backgroundColor: BUBBLE_BG_COLOR }]} />
        </Animated.View>

        {/* Transcribed Text Animation */}
        {showTranscription && transcribedText ? <FadingText text={transcribedText} /> : null}

        {/* Listening/Processing Animation */}
        {isRecording || isProcessing ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.listeningContainer}
          >
            {isRecording ? (
              <>
                <VoiceWave />
                <ThemedText style={styles.listeningText}>Listening...</ThemedText>
              </>
            ) : (
              <ThemedText style={styles.listeningText}>Processing...</ThemedText>
            )}
          </Animated.View>
        ) : null}

        {/* Bottom Controls */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.micButtonContainer}>
            <Animated.View style={[styles.micButtonPulse, pulseStyle]} />
            <AnimatedPressable
              style={[styles.micButton, micStyle]}
              onPress={handleMicPress}
              disabled={isProcessing}
            >
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={32}
                color={isProcessing ? '#999' : '#333'}
              />
            </AnimatedPressable>
          </View>
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
    marginTop: 40,
    alignSelf: 'center',
    position: 'relative',
  },
  messageContent: {
    borderRadius: 20,
    padding: 20,
  },
  chevronUp: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 20,
    height: 20,
    transform: [{ rotate: '45deg' }],
  },
  welcomeText: {
    fontSize: 24,
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
  micButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7666F9',
    opacity: 0,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
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
  listeningContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  listeningText: {
    fontSize: 18,
    color: '#7666F9',
    fontWeight: '600',
    marginTop: 8,
  },
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

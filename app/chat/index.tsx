import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatControls } from '../components/chat/ChatControls';
import { ChatHeader } from '../components/chat/ChatHeader';
import { FadingText } from '../components/chat/FadingText';
import { FloatingOrb } from '../components/chat/FloatingOrb';
import { VoiceWave } from '../components/chat/VoiceWave';
import { newRequest } from '../utils/newRequest';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [initialState, setInitialState] = useState<any>(null);
  const [aiMessage, setAiMessage] = useState(
    'Hello Nehal!\nDid you feel you accomplished your goal today?',
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isRecording, transcribedText, startRecording, stopRecording } = useVoiceRecognition();
  const recordingStartTime = useRef<number | null>(null);

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await newRequest.get('/chat/initial-state');
        const initialStateData = response.data;

        setInitialState(initialStateData);
        if (initialStateData && initialStateData.userTask) {
          setAiMessage(`Hello Nehal!
${initialStateData.userTask}`);
        }
      } catch (error) {
        console.error('Failed to fetch initial state:', error);
        setAiMessage("Hello Nehal! I couldn't load your initial task. Please try again.");
      }
    };

    fetchInitialState();
  }, []);

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
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAiMessage("Why weren't you able to meet your goal today?");
      }
      setIsProcessing(false);
    }
  };

  const orbState = isProcessing ? 'processing' : isRecording ? 'listening' : 'idle';

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['rgba(243, 231, 255, 1)', 'rgba(228, 208, 255, 1)', 'rgba(255, 231, 249, 1)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ChatHeader topInset={insets.top} />

      <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
        <ThemedView style={[styles.orbsContainer, { backgroundColor: 'transparent' }]}>
          {[0, 1, 2].map((index) => (
            <FloatingOrb key={index} index={index} state={orbState} />
          ))}
        </ThemedView>

        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.welcomeContainer, { backgroundColor: 'transparent', borderRadius: 9 }]}
        >
          <ThemedView style={[styles.messageContent, { backgroundColor: 'transparent' }]}>
            <ThemedText style={styles.welcomeText}>{aiMessage}</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.chevronUp, { backgroundColor: 'transparent' }]} />
        </Animated.View>

        {showTranscription && transcribedText ? <FadingText text={transcribedText} /> : null}

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

        <ChatControls
          isRecording={isRecording}
          isProcessing={isProcessing}
          onMicPress={handleMicPress}
          bottomInset={insets.bottom}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  orbsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginTop: 40,
    position: 'relative',
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
});

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatControls } from '../components/chat/ChatControls';
import { ChatHeader } from '../components/chat/ChatHeader';
import { FadingText } from '../components/chat/FadingText';
import { FloatingOrb } from '../components/chat/FloatingOrb';
import { VoiceWave } from '../components/chat/VoiceWave';
import { newRequest } from '../utils/newRequest';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);

  const { isRecording, transcribedText, startRecording, stopRecording } = useVoiceRecognition();
  const recordingStartTime = useRef<number | null>(null);

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await newRequest.get('/chat/initial-state');
        const initialStateData = response.data;

        setAiMessage(initialStateData.message);
        setChatHistory([
          { role: 'assistant', content: initialStateData.message, timestamp: Date.now() },
        ]);
      } catch (error) {
        // alert the user that the initial state is not available
        Alert.alert('Initial state is not available');

        console.error('Failed to fetch initial state:', error);
      }
    };

    fetchInitialState();
  }, []);

  const addMessageToHistory = (role: 'assistant' | 'user', content: string) => {
    const newMessage: ChatMessage = { role, content, timestamp: Date.now() };
    setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    if (role === 'assistant') {
      setAiMessage(content);
    }
  };

  const handleMicPress = async () => {
    if (!isRecording) {
      setShowTranscription(false);
      recordingStartTime.current = Date.now();
      await startRecording();
    } else {
      setIsProcessing(true);
      const recordingResult = await stopRecording();

      if (recordingResult && recordingResult.success) {
        const duration = Date.now() - (recordingStartTime.current || 0);
        console.log(`Recording duration: ${duration}ms`);
        setShowTranscription(true);

        const userMessageContent = recordingResult.text;

        if (userMessageContent && userMessageContent.trim().length > 0) {
          const userMessageEntry: ChatMessage = {
            role: 'user',
            content: userMessageContent,
            timestamp: Date.now(),
          };
          const updatedHistory = [...chatHistory, userMessageEntry];
          setChatHistory(updatedHistory);

          console.log('User message from recordingResult:', userMessageContent);
          try {
            console.log('Sending to backend:', {
              currentUserMessage: userMessageEntry,
              chatHistory: updatedHistory,
            });
            const response = await newRequest.post('/chat/user-response', {
              currentUserMessage: userMessageEntry,
              chatHistory: updatedHistory,
            });

            const aiMessageArray = response.data.aiMessage;
            const nextAiMessageText =
              Array.isArray(aiMessageArray) && aiMessageArray.length > 0
                ? aiMessageArray[0]
                : 'I received your message. How can I help further?';
            addMessageToHistory('assistant', nextAiMessageText);

            if (
              response.data.collectedInformation &&
              response.data.collectedInformation.nextGoalProvided
            ) {
              Alert.alert('Next goal has been provided!');
            }
          } catch (error) {
            console.error('Failed to send user response to backend:', error);
            addMessageToHistory('assistant', "I couldn't process your response. Please try again.");
          }
        } else {
          console.warn(
            'Transcribed text from stopRecording is empty or only whitespace. Not sending to backend.',
          );
          addMessageToHistory('assistant', "I didn't catch that. Could you please try again?");
        }
      } else {
        console.error('stopRecording failed or returned no text:', recordingResult);
        addMessageToHistory(
          'assistant',
          'There was an issue stopping the recording or nothing was transcribed. Please try again.',
        );
      }
      setIsProcessing(false);
    }
  };

  const orbState = isProcessing ? 'processing' : isRecording ? 'listening' : 'idle';

  const currentMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
  const previousMessage = chatHistory.length > 1 ? chatHistory[chatHistory.length - 2] : null;

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
          {previousMessage && (
            <ThemedView
              style={[
                styles.messageContent,
                styles.previousMessageContainer,
                { backgroundColor: 'transparent' },
              ]}
            >
              <ThemedText style={[styles.welcomeText, styles.previousMessageText]}>
                {previousMessage.content}
              </ThemedText>
            </ThemedView>
          )}
          {currentMessage && (
            <ThemedView style={styles.currentMessageWrapper}>
              <ThemedView style={[styles.messageContent, { backgroundColor: 'transparent' }]}>
                <ThemedText style={styles.welcomeText}>{currentMessage.content}</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.chevronUp, { backgroundColor: 'transparent' }]} />
            </ThemedView>
          )}
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
  previousMessageContainer: {
    opacity: 0.6,
    transform: [{ perspective: 800 }, { rotateX: '30deg' }, { scale: 0.9 }, { translateY: -40 }],
  },
  previousMessageText: {
    fontSize: 18,
  },
  currentMessageWrapper: {
    position: 'relative',
    marginTop: 5,
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

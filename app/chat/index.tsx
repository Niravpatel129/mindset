import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatControls } from '../components/chat/ChatControls';
import { ChatHeader } from '../components/chat/ChatHeader';
import { FadingText } from '../components/chat/FadingText';
import { FloatingOrb } from '../components/chat/FloatingOrb';
import { VoiceWave } from '../components/chat/VoiceWave';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [aiMessage, setAiMessage] = useState(
    'Hello Nehal!\nDid you feel you accomplished your goal today?',
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isRecording, transcribedText, startRecording, stopRecording } = useVoiceRecognition();
  const recordingStartTime = useRef<number | null>(null);

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
          <ThemedView style={StyleSheet.absoluteFill}>
            <ThemedText>Loading texture...</ThemedText>
          </ThemedView>
        )}
      </ImageBackground>

      <ChatHeader topInset={insets.top} />

      {/* Main Content */}
      <ThemedView style={styles.content}>
        {/* Floating Orbs */}
        <ThemedView style={styles.orbsContainer}>
          {[0].map((index) => (
            <FloatingOrb key={index} index={index} state={orbState} />
          ))}
        </ThemedView>

        {/* AI Message */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[
            styles.welcomeContainer,
            { backgroundColor: 'rgba(255, 255, 255, 1)', borderRadius: 9 },
          ]}
        >
          <ThemedView
            style={[styles.messageContent, { backgroundColor: 'rgba(255, 255, 255, 1)' }]}
          >
            <ThemedText style={styles.welcomeText}>{aiMessage}</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.chevronUp, { backgroundColor: 'rgba(255, 255, 255, 1)' }]} />
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 200,
    marginTop: 40,
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

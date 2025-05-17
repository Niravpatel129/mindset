import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export const useVoiceRecognition = () => {
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

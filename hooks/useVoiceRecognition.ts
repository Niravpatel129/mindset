import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const recognitionRef = useRef<any>(null);
  const onWeb = Platform.OS === 'web';

  // Refs to handle asynchronous stop on web
  const stopPromiseResolveRef = useRef<
    ((value: { success: boolean; text: string | null }) => void) | null
  >(null);
  const stopPromiseRejectRef = useRef<((reason?: any) => void) | null>(null);
  const finalTranscriptHolderRef = useRef<string>('');

  useEffect(() => {
    if (onWeb) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        console.log('🎤 Initializing Web Speech API');
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // We want it to stop after a pause or when stop is called
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            const completeFinalTranscript = (
              finalTranscriptHolderRef.current + finalTranscript
            ).trim();
            console.log('🗣️ (Web) Final result segment:', finalTranscript);
            setTranscribedText(completeFinalTranscript);
            finalTranscriptHolderRef.current = completeFinalTranscript; // Accumulate final transcript
            // If stop was called, resolve promise here too, as onend might be delayed or not have the very last segment
            if (stopPromiseResolveRef.current) {
              // stopPromiseResolveRef.current({ success: true, text: finalTranscriptHolderRef.current });
              // stopPromiseResolveRef.current = null; // Ensure it's only called once
              // stopPromiseRejectRef.current = null;
              // setIsRecording(false); // onend will handle this
            }
          } else if (interimTranscript) {
            console.log('🗣️ (Web) Interim result:', interimTranscript);
            // Optionally update state with interim results if needed for UI
            // setTranscribedText(finalTranscriptHolderRef.current + interimTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          console.log(
            '🎤 Web Speech recognition ended. Final transcript collected:',
            finalTranscriptHolderRef.current,
          );
          setIsRecording(false);
          if (stopPromiseResolveRef.current) {
            stopPromiseResolveRef.current({
              success: true,
              text: finalTranscriptHolderRef.current || null,
            });
          }
          stopPromiseResolveRef.current = null;
          stopPromiseRejectRef.current = null;
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (stopPromiseRejectRef.current) {
            stopPromiseRejectRef.current({ success: false, text: null, error: event.error });
          }
          stopPromiseResolveRef.current = null;
          stopPromiseRejectRef.current = null;
          finalTranscriptHolderRef.current = ''; // Reset on error
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
            setIsRecording(false); // Ensure recording state is updated
          };

          Voice.onSpeechEnd = () => {
            console.log('🎤 Native Voice recognition ended');
            setIsRecording(false); // Ensure recording state is updated
          };
          Voice.onSpeechResults = (e: { value?: string[] }) => {
            const text = (e.value?.[0] || '').trim();
            setTranscribedText(text);
            console.log('🗣️ (Native) User said:', text);
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
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } else {
          recognitionRef.current.destroy().then(recognitionRef.current.removeAllListeners);
        }
      }
      // Clear any pending promises on unmount
      if (stopPromiseRejectRef.current) {
        stopPromiseRejectRef.current({ success: false, text: null, error: 'Component unmounted' });
      }
      stopPromiseResolveRef.current = null;
      stopPromiseRejectRef.current = null;
    };
  }, [onWeb]);

  const startRecording = async () => {
    if (!recognitionRef.current) {
      console.error('Voice recognition not initialized');
      return;
    }
    setTranscribedText(''); // Clear previous transcription
    if (onWeb) {
      finalTranscriptHolderRef.current = ''; // Reset final transcript holder for web
      try {
        console.log('🎤 Starting Web recording...');
        await recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start web recording:', error);
        setIsRecording(false);
      }
    } else {
      // Native implementation
      try {
        console.log('🎤 Starting Native recording...');
        await recognitionRef.current.start('en-US');
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start native recording:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async (): Promise<{ success: boolean; text: string | null }> => {
    if (!recognitionRef.current) {
      console.error('Voice recognition not initialized during stop');
      return { success: false, text: null };
    }

    console.log('🎤 Attempting to stop recording...');
    if (onWeb) {
      return new Promise((resolve, reject) => {
        stopPromiseResolveRef.current = resolve;
        stopPromiseRejectRef.current = reject;
        // finalTranscriptHolderRef.current should be up-to-date via onresult
        // onend will fire after recognition.stop() and resolve the promise.
        try {
          recognitionRef.current.stop(); // Request stop, onend will handle the rest
          console.log('🎤 Web Speech API stop() called.');
          // Note: setIsRecording(false) will be called in onend or onerror
        } catch (e) {
          console.error('Error calling recognition.stop()', e);
          // If stop itself fails, reject immediately
          reject({ success: false, text: null, error: e });
          setIsRecording(false);
          stopPromiseResolveRef.current = null;
          stopPromiseRejectRef.current = null;
        }
      });
    } else {
      // Native implementation
      try {
        await recognitionRef.current.stop();
        setIsRecording(false); // Moved here to ensure it's after actual stop
        console.log('🎤 Native recording stopped successfully');
        return { success: true, text: transcribedText }; // Native already populates transcribedText
      } catch (error) {
        console.error('Failed to stop native recording:', error);
        setIsRecording(false);
        return { success: false, text: null };
      }
    }
  };

  return {
    isRecording,
    transcribedText,
    startRecording,
    stopRecording,
  };
};

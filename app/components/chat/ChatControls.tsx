import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChatControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onMicPress: () => void;
  bottomInset: number;
}

export function ChatControls({
  isRecording,
  isProcessing,
  onMicPress,
  bottomInset,
}: ChatControlsProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = 1;
      pulseOpacity.value = 0.8;
      pulseScale.value = withRepeat(withTiming(1.5, { duration: 1500 }), -1, false);
      pulseOpacity.value = withRepeat(withTiming(0, { duration: 1500 }), -1, false);
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0);
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isRecording ? 1.1 : 1) }],
  }));

  return (
    <View style={[styles.controls, { paddingBottom: bottomInset + 20 }]}>
      <View style={styles.micButtonContainer}>
        <Animated.View style={[styles.micButtonPulse, pulseStyle]} />
        <AnimatedPressable
          style={[styles.micButton, micStyle]}
          onPress={onMicPress}
          disabled={isProcessing}
        >
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={32} color={'red'} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

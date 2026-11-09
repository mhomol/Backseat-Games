import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useState } from 'react';
import { applyAudioMode, invalidateAudioMode } from '@/services/feedback';

type UseSignGameSpeechOptions = {
  onTranscript: (text: string) => void;
  enabled: boolean;
};

function restorePlaybackAfterSpeech(): void {
  invalidateAudioMode();
  try {
    ExpoSpeechRecognitionModule.setCategoryIOS({
      category: 'playback',
      categoryOptions: ['mixWithOthers'],
      mode: 'default',
    });
  } catch {
    // Native module unavailable in Expo Go.
  }
  void applyAudioMode(true);
}

/** Push-to-talk speech-to-text for Sign Game word entry (TestFlight / dev builds). */
export function useSignGameSpeech({ onTranscript, enabled }: UseSignGameSpeechOptions) {
  const [listening, setListening] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setAvailable(false);
      return;
    }
    try {
      setAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setAvailable(false);
    }
  }, [enabled]);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    restorePlaybackAfterSpeech();
  });
  useSpeechRecognitionEvent('result', (event) => {
    const first = event.results[0] as { transcript?: string; confidence?: number } | undefined;
    const text = first?.transcript?.trim();
    if (!text) {
      return;
    }
    if (typeof first?.confidence === 'number' && first.confidence < 0.45) {
      return;
    }
    onTranscript(text);
  });

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Native module unavailable in Expo Go.
    }
    setListening(false);
    restorePlaybackAfterSpeech();
  }, []);

  const toggleListening = useCallback(async () => {
    if (!enabled || !available) {
      return;
    }

    if (listening) {
      stopListening();
      return;
    }

    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        iosCategory: {
          category: 'playAndRecord',
          categoryOptions: ['defaultToSpeaker', 'allowBluetooth', 'mixWithOthers'],
          mode: 'default',
        },
      });
    } catch {
      setAvailable(false);
      setListening(false);
    }
  }, [available, enabled, listening, stopListening]);

  useEffect(() => {
    if (!enabled) {
      stopListening();
    }
  }, [enabled, stopListening]);

  return {
    listening,
    available: enabled && available,
    toggleListening,
    stopListening,
  };
}

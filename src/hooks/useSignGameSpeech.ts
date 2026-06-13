import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useState } from 'react';

type UseSignGameSpeechOptions = {
  onTranscript: (text: string) => void;
  enabled: boolean;
};

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
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript?.trim();
    if (text) {
      onTranscript(text);
    }
  });

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Native module unavailable in Expo Go.
    }
    setListening(false);
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

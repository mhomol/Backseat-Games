import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

export function useSignGameAudio() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);
  const player = useAudioPlayer(lastRecordingUri);

  useEffect(() => {
    void (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = useCallback(async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    await recorder.stop();
    const uri = recorder.uri;
    if (uri) {
      setLastRecordingUri(uri);
    }
    return uri ?? undefined;
  }, [recorder]);

  const playRecording = useCallback(async () => {
    if (lastRecordingUri) {
      player.seekTo(0);
      player.play();
    }
  }, [lastRecordingUri, player]);

  return {
    isRecording: recorderState.isRecording,
    lastRecordingUri,
    startRecording,
    stopRecording,
    playRecording,
    setLastRecordingUri,
  };
}

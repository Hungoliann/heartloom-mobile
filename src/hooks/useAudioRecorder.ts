import { useState, useMemo, useCallback } from "react";
import {
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";

interface AudioRecorderState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  recordingUri: string | null;
  meteringLevel: number;
  meteringDb: number | null;
  seconds: number;
  isRecording: boolean;
  isPaused: boolean;
  permissionDenied: boolean;
  lastError: string | null;
}

export function useAudioRecorder(): AudioRecorderState {
  const options = useMemo(
    () => ({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true }),
    []
  );
  const recorder = useExpoAudioRecorder(options);
  const state = useAudioRecorderState(recorder, 50);

  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [wasStarted, setWasStarted] = useState(false);

  const meteringDb =
    typeof state.metering === "number" && !Number.isNaN(state.metering)
      ? state.metering
      : null;
  const meteringLevel =
    meteringDb !== null ? Math.max(0, Math.min(1, (meteringDb + 60) / 60)) : 0;
  const seconds = Math.floor((state.durationMillis ?? 0) / 1000);

  const startRecording = useCallback(async () => {
    try {
      setLastError(null);
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setPermissionDenied(true);
        setLastError("permission denied");
        return;
      }
      setPermissionDenied(false);
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setWasStarted(true);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stop();
      setRecordingUri(recorder.uri ?? null);
      setWasStarted(false);
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    } catch (e) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
  }, [recorder]);

  const pauseRecording = useCallback(async () => {
    try {
      recorder.pause();
    } catch (e) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
  }, [recorder]);

  const resumeRecording = useCallback(async () => {
    try {
      recorder.record();
    } catch (e) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
  }, [recorder]);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordingUri,
    meteringLevel,
    meteringDb,
    seconds,
    isRecording: state.isRecording,
    isPaused: wasStarted && !state.isRecording && seconds > 0,
    permissionDenied,
    lastError,
  };
}

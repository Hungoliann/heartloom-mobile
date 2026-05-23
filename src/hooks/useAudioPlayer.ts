import { useMemo } from "react";
import {
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

interface AudioPlayerState {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  progress: number;
}

export function useAudioPlayer(uri: string | null): AudioPlayerState {
  const source = useMemo(() => (uri ? { uri } : null), [uri]);
  const player = useExpoAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  async function play() {
    if (!status.isLoaded) return;
    if (status.didJustFinish || status.currentTime >= status.duration) {
      await player.seekTo(0);
    }
    player.play();
  }

  async function pause() {
    player.pause();
  }

  const positionMs = Math.floor((status.currentTime ?? 0) * 1000);
  const durationMs = Math.floor((status.duration ?? 0) * 1000);
  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return {
    play,
    pause,
    isPlaying: status.playing,
    positionMs,
    durationMs,
    progress,
  };
}

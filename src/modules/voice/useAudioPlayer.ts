import { useEffect, useRef, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

type PlayerState = {
  isLoaded: boolean;
  isPlaying: boolean;
  durationMs: number;
  positionMs: number;
  error?: string;
};

export function useAudioPlayer(uri?: string) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<PlayerState>({
    isLoaded: false, 
    isPlaying: false, 
    durationMs: 0, 
    positionMs: 0,
  });

  // carga
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!uri) return;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      });

      const sound = new Audio.Sound();
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((s: AVPlaybackStatus) => {
        if (!mounted) return;
        if (!s.isLoaded) {
          setState((p) => ({ 
            ...p, 
            isLoaded: false, 
            isPlaying: false, 
            error: (s as any).error 
          }));
          return;
        }
        setState({
          isLoaded: true,
          isPlaying: s.isPlaying,
          durationMs: s.durationMillis ?? 0,
          positionMs: s.positionMillis ?? 0,
          error: undefined,
        });
      });

      try {
        await sound.loadAsync({ uri }, { progressUpdateIntervalMillis: 250 });
      } catch (e: any) {
        setState((p) => ({ ...p, error: e?.message ?? "Load error" }));
      }
    }

    load();

    return () => {
      mounted = false;
      (async () => {
        try { 
          await soundRef.current?.unloadAsync(); 
        } catch {}
        soundRef.current = null;
      })();
    };
  }, [uri]);

  const play = async () => state.isLoaded && (await soundRef.current?.playAsync());
  const pause = async () => state.isLoaded && (await soundRef.current?.pauseAsync());
  const seek = async (ms: number) => state.isLoaded && (await soundRef.current?.setPositionAsync(ms));

  return { ...state, play, pause, seek };
}

// helpers
export const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
};

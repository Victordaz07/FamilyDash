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
      if (!uri) {
        setState(p => ({ ...p, isLoaded: false, isPlaying: false, error: "No audio URI" }));
        return;
      }
      
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      try {
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          {
            progressUpdateIntervalMillis: 250,
            shouldPlay: false,
          },
          (s: AVPlaybackStatus) => {
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
              isPlaying: s.isPlaying || false,
              durationMs: s.durationMillis ?? 0,
              positionMs: s.positionMillis ?? 0,
              error: undefined,
            });
          }
        );
        
        soundRef.current = newSound;
      } catch (e: any) {
        console.error('🎵 Load error:', e);
        setState((p) => ({ ...p, error: e?.message ?? "Load error" }));
      }
    }

    load();

    return () => {
      mounted = false;
      (async () => {
        try { 
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
          }
        } catch {}
        soundRef.current = null;
      })();
    };
  }, [uri]);

  const play = async () => {
    if (state.isLoaded && soundRef.current) {
      try {
        await soundRef.current.playAsync();
      } catch (error) {
        console.error('🎵 Play error:', error);
      }
    }
  };
  
  const pause = async () => {
    if (state.isLoaded && soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
      } catch (error) {
        console.error('🎵 Pause error:', error);
      }
    }
  };
  
  const seek = async (ms: number) => {
    if (state.isLoaded && soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(ms);
      } catch (error) {
        console.error('🎵 Seek error:', error);
      }
    }
  };

  return { ...state, play, pause, seek };
}

// helpers
export const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
};

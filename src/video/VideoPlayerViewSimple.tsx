/**
 * VideoPlayerViewSimple - Simplified version without caching to avoid getInfoAsync issues
 * Use this as a fallback when caching causes problems
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { VideoFallback } from "./VideoFallback";
import { 
  categorizeVideoError, 
  isProbablyStream, 
  isSupportedFormat, 
  sanitizeUri, 
  VideoErrorKind, 
  withTimeout,
  isProblematicVideo,
  getProblematicVideoMessage
} from "./videoSupport";

type Props = {
  uri: string;
  thumbnailUri?: string;
  visible?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  style?: any;
  onReady?: () => void;
  onError?: (error: { kind: VideoErrorKind; raw?: any }) => void;
  stallTimeoutMs?: number;
  maxRetries?: number;
};

type Phase = "idle" | "preparing" | "ready" | "playing" | "buffering" | "error" | "fallback";

export const VideoPlayerViewSimple: React.FC<Props> = ({
  uri,
  thumbnailUri,
  visible = true,
  autoPlay = true,
  loop = false,
  muted = true,
  style,
  onReady,
  onError,
  stallTimeoutMs = 12000,
  maxRetries = 2
}) => {
  const cleanUri = useMemo(() => sanitizeUri(uri), [uri]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const retriesRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  // 1) Validación temprana
  useEffect(() => {
    if (!cleanUri || isProbablyStream(cleanUri)) {
      setPhase("fallback");
      setErrorMsg("Formato/stream no soportado en este dispositivo.");
      return;
    }
    if (!isSupportedFormat(cleanUri)) {
      setPhase("fallback");
      setErrorMsg("Formato de video no compatible (usa .mp4/.mov).");
      return;
    }
    
    // Detectar videos problemáticos (HEVC/H.265, HDR, etc.)
    if (isProblematicVideo(cleanUri)) {
      setPhase("fallback");
      // Mensaje especial para emulador Android
      const isAndroidEmulator = Platform.OS === 'android' && (global as any).__DEV__;
      if (isAndroidEmulator) {
        setErrorMsg("En emulador Android HEVC/H.265 no está soportado. Prueba en un dispositivo real o usa MP4 (H.264 + AAC).");
      } else {
        setErrorMsg(getProblematicVideoMessage(cleanUri));
      }
      return;
    }
    
    setPhase("idle");
    setSourceUri(null);
    retriesRef.current = 0;
  }, [cleanUri]);

  // 2) Preparar recurso (sin caché)
  const prepareSource = async () => {
    try {
      setPhase("preparing");
      // Use URI directly without caching
      setSourceUri(cleanUri);
    } catch (e: any) {
      const kind = categorizeVideoError(e);
      setErrorMsg(kind === "timeout" ? "Timeout al preparar el video." : "No se pudo preparar el video.");
      setPhase("fallback");
      onError?.({ kind, raw: e });
    }
  };

  useEffect(() => {
    if (!visible) return;
    if (phase === "idle") prepareSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, phase, cleanUri]);

  // 3) Instanciar player cuando tengo sourceUri
  const player = useVideoPlayer(sourceUri ?? undefined, (p) => {
    p.loop = loop;
    p.muted = muted;
  });

  // 4) Listeners + timeout de stall
  useEffect(() => {
    unmountedRef.current = false;
    if (!player || !sourceUri || !visible) return;

    const startStallTimeout = () => {
      clearStallTimeout();
      timeoutRef.current = setTimeout(() => {
        handleError(new Error("timeout"));
      }, stallTimeoutMs);
    };
    const clearStallTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    setPhase("preparing");
    startStallTimeout();

    const sub = player.addListener("statusChange", (evt: any) => {
      if (unmountedRef.current) return;
      const status = evt?.status || evt?.state || "";
      
      console.log('Video status changed:', status);
      
      switch (status) {
        case "readyToPlay":
          clearStallTimeout();
          setPhase("ready");
          onReady?.();
          if (autoPlay) {
            try { player.play(); } catch {}
          }
          break;
        case "playing":
          clearStallTimeout();
          setPhase("playing");
          break;
        case "buffering":
          setPhase("buffering");
          startStallTimeout();
          break;
        case "ended":
          clearStallTimeout();
          setPhase(loop ? "playing" : "ready");
          break;
        case "error":
          clearStallTimeout();
          handleError(evt?.error || new Error("video error"));
          break;
      }
    });

    const unsubError = player.addListener?.("error", (e: any) => {
      if (unmountedRef.current) return;
      clearStallTimeout();
      handleError(e);
    });

    return () => {
      unmountedRef.current = true;
      clearStallTimeout();
      try { sub?.remove?.(); } catch {}
      try { unsubError?.remove?.(); } catch {}
      try { player.pause?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, sourceUri, visible]);

  const handleError = (raw: any) => {
    const kind = categorizeVideoError(raw);
    console.error('Video error:', { kind, raw, uri: cleanUri });

    if (kind === "codec") {
      setPhase("fallback");
      // Mensaje más específico para videos HEVC/H.265
      const errorMsg = raw?.message?.toLowerCase() || '';
      if (errorMsg.includes('hevc') || errorMsg.includes('h.265') || errorMsg.includes('bt2020') || errorMsg.includes('hlg')) {
        setErrorMsg("Este video usa HEVC/H.265 o un perfil no soportado por tu dispositivo. Sube/usa MP4 (H.264 + AAC) para mejor compatibilidad.");
      } else {
        setErrorMsg("El dispositivo no soporta el códec de este video. Usa 'Abrir externo' para reproducirlo en otra aplicación.");
      }
      onError?.({ kind, raw });
      return;
    }

    if (kind === "network" || kind === "timeout" || kind === "unknown") {
      if (retriesRef.current < maxRetries) {
        const attempt = ++retriesRef.current;
        const backoff = 800 * attempt;
        setPhase("preparing");
        setTimeout(() => {
          setSourceUri(null);
          prepareSource();
        }, backoff);
        return;
      }
    }

    setPhase("fallback");
    setErrorMsg(
      kind === "not_found"
        ? "El video no existe (404)."
        : kind === "unauthorized"
        ? "No tienes permiso para este video."
        : "No se pudo reproducir el video."
    );
    onError?.({ kind, raw });
  };

  // 5) Render
  if (!visible) {
    return (
      <View style={[styles.box, style]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (phase === "preparing" || phase === "idle" || (!sourceUri && phase !== "fallback")) {
    return (
      <View style={[styles.box, style]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (phase === "fallback" || !sourceUri) {
    return (
      <View style={[styles.box, style]}>
        <VideoFallback
          uri={cleanUri}
          thumbnailUri={thumbnailUri}
          message={errorMsg}
          onRetry={() => {
            retriesRef.current = 0;
            setSourceUri(null);
            setPhase("idle");
            prepareSource();
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.box, style]}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        allowsFullscreen
        allowsPictureInPicture={Platform.OS === "ios"}
        nativeControls={false}
        contentFit="contain"
      />
      {(phase === "buffering" || phase === "ready") && <ActivityIndicator style={styles.loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  box: { width: "100%", height: 220, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  loading: { position: "absolute", top: 8, right: 8 }
});

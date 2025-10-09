/**
 * VideoPlayerView - Robust video player component with error handling, caching, and fallback
 * Handles MediaCodecVideoRenderer errors and provides graceful degradation
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { getCachedOrDownloadSimple } from "./VideoCacheSimple";
import { VideoFallback } from "./VideoFallback";
import { 
  categorizeVideoError, 
  isProbablyStream, 
  isSupportedFormat, 
  sanitizeUri, 
  VideoErrorKind, 
  withTimeout 
} from "./videoSupport";

type Props = {
  uri: string;
  thumbnailUri?: string;
  visible?: boolean;       // Usa onViewableItemsChanged para listas
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  style?: any;
  onReady?: () => void;
  onError?: (error: { kind: VideoErrorKind; raw?: any }) => void;
  useCache?: boolean;      // cachea solo si remoto
  stallTimeoutMs?: number; // timeout para "cuelgues"
  maxRetries?: number;     // reintentos máximo
};

type Phase = "idle" | "preparing" | "ready" | "playing" | "buffering" | "error" | "fallback";

export const VideoPlayerView: React.FC<Props> = ({
  uri,
  thumbnailUri,
  visible = true,
  autoPlay = true,
  loop = false,
  muted = true,
  style,
  onReady,
  onError,
  useCache = true,
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
    setPhase("idle");
    setSourceUri(null);
    retriesRef.current = 0;
  }, [cleanUri]);

  // 2) Preparar recurso (opcional caché)
  const prepareSource = async () => {
    try {
      setPhase("preparing");
      if (useCache && cleanUri.startsWith("http")) {
        const local = await withTimeout(getCachedOrDownloadSimple(cleanUri), 15000);
        if (unmountedRef.current) return;
        setSourceUri(local);
      } else {
        setSourceUri(cleanUri);
      }
    } catch (e: any) {
      const kind = categorizeVideoError(e);
      setErrorMsg(kind === "timeout" ? "Timeout al preparar el video." : "No se pudo preparar el video.");
      setPhase("fallback");
      onError?.({ kind, raw: e });
    }
  };

  useEffect(() => {
    if (!visible) return; // Lazy mount
    if (phase === "idle") prepareSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, phase, cleanUri]);

  // 3) Instanciar player cuando tengo sourceUri
  const player = useVideoPlayer(sourceUri ?? undefined, (p) => {
    p.loop = loop;
    p.muted = muted;
    // No iniciamos play inmediato hasta ready, para evitar race en Android
  });

  // 4) Listeners + timeout de stall
  useEffect(() => {
    unmountedRef.current = false;
    if (!player || !sourceUri || !visible) return;

    // Timeout si se cuelga cargando/bufferizando
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
      // Posibles status: 'readyToPlay', 'playing', 'paused', 'buffering', 'ended', 'error'
      const status = evt?.status || evt?.state || "";
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

    // Seguridad adicional: algunas APIs emiten onError separado
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

    // Estrategia de recuperación:
    // - codec: no reintentar, ir a fallback directo
    // - network/timeout: reintentar hasta maxRetries con backoff
    // - not_found/unauthorized: sin retry
    // - unknown: 1 retry
    if (kind === "codec") {
      setPhase("fallback");
      setErrorMsg("El dispositivo no soporta el códec de este video.");
      onError?.({ kind, raw });
      return;
    }

    if (kind === "network" || kind === "timeout" || kind === "unknown") {
      if (retriesRef.current < maxRetries) {
        const attempt = ++retriesRef.current;
        const backoff = 800 * attempt; // 0.8s, 1.6s, ...
        setPhase("preparing");
        setTimeout(() => {
          // Fuerza re-create del source (si cache falla, volver a remoto)
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
    // Lazy: cuando no es visible, no montes el VideoView (ahorra memoria)
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
        nativeControls={false}              // ponlo true si quieres controles nativos
        contentFit="contain"                // evita fallos por scaling
      />
      {(phase === "buffering" || phase === "ready") && <ActivityIndicator style={styles.loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  box: { width: "100%", height: 220, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  loading: { position: "absolute", top: 8, right: 8 }
});

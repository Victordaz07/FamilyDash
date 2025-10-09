/**
 * Video support utilities for React Native with Expo
 * Handles format validation, error categorization, and compatibility checks
 */

import { Platform } from "react-native";

const SUPPORTED_EXTENSIONS = ["mp4", "m4v", "mov"]; // H.264/AAC más estables en Android
const MAYBE_OK_EXTENSIONS = ["webm"]; // puede fallar según dispositivo (VP8/9 no siempre)
const STREAM_EXTENSIONS = ["m3u8", "dash", "mpd"]; // evita si no usas streaming

export const getExtension = (uri: string): string => {
  try {
    const clean = uri.split("?")[0].split("#")[0];
    const ext = clean.substring(clean.lastIndexOf(".") + 1).toLowerCase();
    return ext || "";
  } catch {
    return "";
  }
};

export const isProbablyStream = (uri: string): boolean => {
  const ext = getExtension(uri);
  return STREAM_EXTENSIONS.includes(ext) || uri.includes(".m3u8") || uri.includes("playlist.mpd");
};

export const sanitizeUri = (uri: string): string => {
  if (uri.startsWith("http://")) return uri.replace("http://", "https://");
  return uri;
};

// Android es más estricto con códecs (HW decoders). Preferimos MP4/H.264/AAC.
export const isSupportedFormat = (uri: string): boolean => {
  const ext = getExtension(uri);
  if (!ext) return false;
  if (Platform.OS === "android") {
    return SUPPORTED_EXTENSIONS.includes(ext);
  }
  // iOS es más flexible, permitimos MP4/MOV y toleramos WEBM con cautela.
  return SUPPORTED_EXTENSIONS.includes(ext) || MAYBE_OK_EXTENSIONS.includes(ext);
};

export type VideoErrorKind = "codec" | "network" | "timeout" | "not_found" | "unauthorized" | "unknown";

export const categorizeVideoError = (err: any): VideoErrorKind => {
  const msg = (typeof err === "string" ? err : err?.message || "").toLowerCase();

  // Detect HEVC/H.265 specific errors
  if (msg.includes("hevc") || msg.includes("h.265") || msg.includes("h265")) {
    return "codec";
  }
  
  // Detect advanced color format errors
  if (msg.includes("bt2020") || msg.includes("hlg") || msg.includes("hdr") || msg.includes("10bit")) {
    return "codec";
  }
  
  // Detect MediaCodec errors
  if (msg.includes("mediacodec") || msg.includes("decoder init") || msg.includes("renderer")) {
    return "codec";
  }
  
  if (msg.includes("404") || msg.includes("not found")) return "not_found";
  if (msg.includes("403") || msg.includes("401") || msg.includes("unauthorized")) return "unauthorized";
  if (msg.includes("timeout") || msg.includes("timed out")) return "timeout";
  if (msg.includes("network") || msg.includes("failed to connect") || msg.includes("ssl")) return "network";
  return "unknown";
};

// Detectar si un video puede ser problemático en Android
export const isProblematicVideo = (uri: string): boolean => {
  const ext = getExtension(uri);
  
  // Videos HEVC/H.265 son problemáticos en Android
  if (ext === 'hevc' || ext === 'h265') {
    return true;
  }
  
  // URLs que sugieren videos de alta calidad/HDR
  const lowerUri = uri.toLowerCase();
  if (lowerUri.includes('hdr') || lowerUri.includes('4k') || lowerUri.includes('uhd')) {
    return true;
  }
  
  return false;
};

// Obtener mensaje específico para videos problemáticos
export const getProblematicVideoMessage = (uri: string): string => {
  const ext = getExtension(uri);
  
  if (ext === 'hevc' || ext === 'h265') {
    return 'Este video usa HEVC/H.265 que no es compatible con este dispositivo. Usa "Abrir externo" para reproducirlo.';
  }
  
  const lowerUri = uri.toLowerCase();
  if (lowerUri.includes('hdr') || lowerUri.includes('4k')) {
    return 'Este video de alta calidad no es compatible con este dispositivo. Usa "Abrir externo" para reproducirlo.';
  }
  
  return 'Este video no es compatible con este dispositivo. Usa "Abrir externo" para reproducirlo.';
};

// Promesa con timeout duro, útil para HEAD o validaciones previas.
export const withTimeout = async <T,>(p: Promise<T>, ms = 10000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((val) => {
      clearTimeout(id);
      resolve(val);
    }).catch((err) => {
      clearTimeout(id);
      reject(err);
    });
  });
};

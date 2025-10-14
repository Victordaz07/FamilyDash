/**
 * VideoFallback - UI component for when video playback fails
 * Shows thumbnail, error message, and action buttons
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

type Props = {
  uri: string;
  thumbnailUri?: string;
  onRetry?: () => void;
  message?: string;
};

export const VideoFallback: React.FC<Props> = ({ uri, thumbnailUri, onRetry, message }) => {
  const isHEVCError = message?.toLowerCase().includes('hevc') || message?.toLowerCase().includes('h.265');
  const isCodecError = message?.toLowerCase().includes('codec');

  return (
    <View style={styles.container}>
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="videocam-off" size={48} color="#666" />
        </View>
      )}

      <Text style={styles.msg}>{message || "No pudimos reproducir el video."}</Text>

      {isHEVCError && (
        <Text style={styles.helpText}>
          💡 Los videos HEVC/H.265 requieren aplicaciones especializadas como VLC o MX Player.
        </Text>
      )}

      {isCodecError && !isHEVCError && (
        <Text style={styles.helpText}>
          💡 Intenta reproducir el video en otra aplicación como VLC o el reproductor nativo del dispositivo.
        </Text>
      )}

      <View style={styles.row}>
        {onRetry && !isCodecError && (
          <TouchableOpacity style={styles.btn} onPress={onRetry}>
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={() => Linking.openURL(uri)}>
          <Text style={styles.btnText}>Abrir externo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, alignItems: "center" },
  thumb: { width: "100%", height: 200, borderRadius: 12, backgroundColor: "#000" },
  thumbPlaceholder: { backgroundColor: "#1f1f1f", justifyContent: "center", alignItems: "center" },
  msg: { marginTop: 10, textAlign: "center", color: "#777", fontSize: 14, lineHeight: 20 },
  helpText: { 
    marginTop: 8, 
    textAlign: "center", 
    color: "#999", 
    fontSize: 12, 
    fontStyle: "italic",
    paddingHorizontal: 16,
    lineHeight: 16
  },
  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#333", borderRadius: 8 },
  primaryBtn: { backgroundColor: "#007AFF" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 14 }
});





import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, mmss } from "./useAudioPlayer";
import type { VoiceNote } from "@/services/voice.service";

interface VoiceMessageCardProps {
  note: VoiceNote;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function VoiceMessageCard({
  note, 
  showActions = true, 
  onEdit, 
  onDelete,
}: VoiceMessageCardProps) {
  const { 
    isLoaded, 
    isPlaying, 
    durationMs, 
    positionMs, 
    error, 
    play, 
    pause, 
    seek 
  } = useAudioPlayer(note.url);

  const progress = useMemo(() => {
    if (!durationMs) return 0;
    return Math.min(1, positionMs / durationMs);
  }, [positionMs, durationMs]);

  // console.log('🎵 VoiceMessageCard state:', { isLoaded, isPlaying, durationMs, positionMs, error });

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="mic" size={18} color="#7c3aed" />
        <Text style={styles.title}>
          Voice message ({mmss(note.durationMs || durationMs || 0)})
        </Text>
        <View style={{ flex: 1 }} />
        {showActions && (
          <>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progress, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isPlaying ? pause : play}
          style={[styles.playBtn, isPlaying && { backgroundColor: "#f3f4f6" }]}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#7c3aed" />
          <Text style={styles.playTxt}>{isPlaying ? "Pause" : "Play"}</Text>
        </TouchableOpacity>

        <Text style={styles.time}>
          {mmss(positionMs)} / {mmss(durationMs || note.durationMs || 0)}
        </Text>
      </View>

      {!!error && (
        <Text style={styles.error}>Playback error: {String(error)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 14, 
    padding: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    marginBottom: 6 
  },
  title: { 
    fontWeight: "800", 
    color: "#111827" 
  },
  iconBtn: { 
    padding: 6 
  },
  progressWrap: { 
    height: 6, 
    backgroundColor: "#e5e7eb", 
    borderRadius: 6, 
    overflow: "hidden" 
  },
  progress: { 
    height: 6, 
    backgroundColor: "#7c3aed" 
  },
  controls: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 8, 
    gap: 10 
  },
  playBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    backgroundColor: "#eef2ff", 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10 
  },
  playTxt: { 
    color: "#111827", 
    fontWeight: "800" 
  },
  time: { 
    marginLeft: "auto", 
    color: "#6b7280", 
    fontWeight: "700" 
  },
  error: { 
    color: "#b91c1c", 
    marginTop: 8, 
    fontWeight: "700" 
  },
});





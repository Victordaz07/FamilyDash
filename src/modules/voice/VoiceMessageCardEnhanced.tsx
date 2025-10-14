import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, mmss } from "./useAudioPlayer";
import type { VoiceNote, VoiceNoteReaction } from "@/services/voice.service";

interface VoiceMessageCardEnhancedProps {
  note: VoiceNote;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  currentUserId?: string;
  onAddReaction?: (noteId: string, emoji: string) => void;
  onRemoveReaction?: (noteId: string) => void;
}

const EMOTIONAL_EMOJIS = [
  { emoji: "❤️", label: "Amor" },
  { emoji: "🤗", label: "Abrazo" },
  { emoji: "😊", label: "Sonrisa" },
  { emoji: "😢", label: "Tristeza" },
  { emoji: "😌", label: "Tranquilidad" },
  { emoji: "🙏", label: "Oración" },
  { emoji: "💪", label: "Fuerza" },
  { emoji: "🌈", label: "Esperanza" },
  { emoji: "🦋", label: "Transformación" },
  { emoji: "🌱", label: "Crecimiento" },
];

export default function VoiceMessageCardEnhanced({
  note, 
  showActions = true, 
  onEdit, 
  onDelete,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: VoiceMessageCardEnhancedProps) {
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const progress = useMemo(() => {
    if (!durationMs) return 0;
    return Math.min(1, positionMs / durationMs);
  }, [positionMs, durationMs]);

  const userReaction = useMemo(() => {
    if (!currentUserId || !note.reactions) return null;
    return note.reactions.find(r => r.userId === currentUserId);
  }, [currentUserId, note.reactions]);

  const reactionCounts = useMemo(() => {
    if (!note.reactions) return {};
    return note.reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [note.reactions]);

  const handleEmojiPress = (emoji: string) => {
    if (userReaction) {
      // Remove existing reaction
      onRemoveReaction?.(note.id!);
    } else {
      // Add new reaction
      onAddReaction?.(note.id!, emoji);
    }
    setShowEmojiPicker(false);
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Ahora";
    
    const now = new Date();
    const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} días`;
  };

  return (
    <View style={styles.card}>
      {/* Header with author info */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {note.userRole === 'parent' ? '👨‍👩‍👧‍👦' : '👤'}
            </Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>
              {note.userDisplayName || 'Miembro de la familia'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(note.createdAt)} • {mmss(note.durationMs || durationMs || 0)}
            </Text>
          </View>
        </View>
        
        {showActions && (
          <View style={styles.headerActions}>
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
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={[styles.progress, { width: `${progress*100}%` }]} />
      </View>

      {/* Audio controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isPlaying ? pause : play}
          style={[styles.playBtn, isPlaying && { backgroundColor: "#f3f4f6" }]}
          disabled={!isLoaded}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#7c3aed" />
          <Text style={styles.playTxt}>{isPlaying ? "Pausar" : "Escuchar"}</Text>
        </TouchableOpacity>

        <Text style={styles.time}>
          {mmss(positionMs)} / {mmss(durationMs || note.durationMs || 0)}
        </Text>
      </View>

      {/* Error message */}
      {!!error && (
        <Text style={styles.error}>Error de reproducción: {String(error)}</Text>
      )}

      {/* Reactions */}
      <View style={styles.reactionsContainer}>
        <TouchableOpacity 
          style={styles.reactionBtn}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Ionicons 
            name={userReaction ? "heart" : "heart-outline"} 
            size={16} 
            color={userReaction ? "#ef4444" : "#64748b"} 
          />
          <Text style={styles.reactionBtnText}>
            {userReaction ? userReaction.emoji : "Reaccionar"}
          </Text>
        </TouchableOpacity>

        {/* Display existing reactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <View style={styles.reactionsDisplay}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <View key={emoji} style={styles.reactionBadge}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emojiPicker}>
            <Text style={styles.emojiPickerTitle}>¿Cómo te sientes?</Text>
            <View style={styles.emojiGrid}>
              {EMOTIONAL_EMOJIS.map(({ emoji, label }) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    userReaction?.emoji === emoji && styles.emojiOptionSelected
                  ]}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                  <Text style={styles.emojiLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setShowEmojiPicker(false)}
            >
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 16, 
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 20,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: { 
    fontWeight: "600", 
    color: "#111827",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: { 
    padding: 8,
    marginLeft: 4,
  },
  progressWrap: { 
    height: 6, 
    backgroundColor: "#e5e7eb", 
    borderRadius: 6, 
    overflow: "hidden",
    marginBottom: 12,
  },
  progress: { 
    height: 6, 
    backgroundColor: "#7c3aed" 
  },
  controls: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12,
    gap: 10 
  },
  playBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    backgroundColor: "#eef2ff", 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  playTxt: { 
    color: "#7c3aed", 
    fontWeight: "600",
    fontSize: 14,
  },
  time: { 
    marginLeft: "auto", 
    color: "#6b7280", 
    fontWeight: "500",
    fontSize: 12,
  },
  error: { 
    color: "#ef4444", 
    marginTop: 8, 
    fontWeight: "500",
    fontSize: 12,
    textAlign: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reactionBtnText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  reactionsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    marginLeft: 4,
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPicker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: '90%',
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emojiOption: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#7c3aed',
  },
  emojiText: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});





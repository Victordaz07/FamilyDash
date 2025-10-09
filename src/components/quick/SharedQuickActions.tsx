/**
 * SharedQuickActions - Unified Quick Actions component
 * Same UI/UX for both Task and SafeRoom contexts with strict separation
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AudioNoteModal } from "../audio/AudioNoteModal";
import { uploadAudioAndCreateDoc } from "../../services/storage/audioStorage";
import { EntryCtx } from "../../types/entries";

// Props with discriminated union to ensure context separation
type Props =
  | {
      mode: "task";
      familyId: string;
      userId: string;
      taskId: string;
      onAddNewTask?: () => void;
      onAddPhotoTask?: () => void;
      onAddVideoTask?: () => void;
      onOpenShoppingList?: () => void;
    }
  | {
      mode: "safe";
      familyId: string;
      userId: string;
      safeRoomId: string;
      onAddTextSafe?: () => void;
    };

export const SharedQuickActions: React.FC<Props> = (props) => {
  const [openVoice, setOpenVoice] = useState(false);

  // Create context object based on mode - TypeScript ensures correct fields
  const getCtx = (): EntryCtx =>
    props.mode === "task"
      ? { 
          context: "task", 
          familyId: props.familyId, 
          userId: props.userId, 
          taskId: props.taskId 
        }
      : { 
          context: "safe", 
          familyId: props.familyId, 
          userId: props.userId, 
          safeRoomId: props.safeRoomId 
        };

  const handleSaveVoice = async (localUri: string) => {
    try {
      const ctx = getCtx();
      console.log(`🎵 Saving voice note for ${ctx.context} context:`, {
        taskId: ctx.context === "task" ? ctx.taskId : undefined,
        safeRoomId: ctx.context === "safe" ? ctx.safeRoomId : undefined,
      });
      
      await uploadAudioAndCreateDoc(localUri, ctx);
      setOpenVoice(false);
      
      // Show success message
      console.log(`✅ Voice note saved successfully for ${ctx.context}`);
      
    } catch (error) {
      console.error("❌ Error saving voice note:", error);
      // Error is handled by the modal
      throw error;
    }
  };

  const getVoiceTitle = () => {
    return props.mode === "task" 
      ? "Add voice note to task" 
      : "Safe Room — Voice note";
  };

  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>Quick Actions</Text>

      {/* Single Row - All buttons */}
      <View style={styles.row}>
        {props.mode === "task" ? (
          <>
            <ActionButton 
              label="New Task" 
              color="#16a34a" 
              icon="➕" 
              onPress={props.onAddNewTask} 
            />
            <ActionButton 
              label="Photo" 
              color="#6366f1" 
              icon="📷" 
              onPress={props.onAddPhotoTask} 
            />
            <ActionButton 
              label="Video" 
              color="#7c3aed" 
              icon="🎬" 
              onPress={props.onAddVideoTask} 
            />
            <ActionButton 
              label="Shopping" 
              color="#ef4444" 
              icon="🛒" 
              onPress={props.onOpenShoppingList} 
            />
            <ActionButton 
              label="Audio" 
              color="#f59e0b" 
              icon="🎙️" 
              onPress={() => setOpenVoice(true)} 
            />
          </>
        ) : (
          <>
            <ActionButton 
              label="Text" 
              color="#06b6d4" 
              icon="💬" 
              onPress={props.onAddTextSafe} 
            />
            <ActionButton 
              label="Voice" 
              color="#7c3aed" 
              icon="🎙️" 
              onPress={() => setOpenVoice(true)} 
            />
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
          </>
        )}
      </View>

      {/* Audio Note Modal - Same for both contexts */}
      <AudioNoteModal
        visible={openVoice}
        onClose={() => setOpenVoice(false)}
        title={getVoiceTitle()}
        onSaved={handleSaveVoice}
      />
    </View>
  );
};

interface ActionButtonProps {
  label: string;
  color: string;
  icon?: string;
  onPress?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, color, icon, onPress }) => (
  <TouchableOpacity 
    style={[styles.btn, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.icon}>{icon ?? "•"}</Text>
    <Text style={styles.btnText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sheet: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  title: { 
    fontWeight: "800", 
    fontSize: 18, 
    marginBottom: 12, 
    textAlign: "center",
    color: "#1F2937"
  },
  row: { 
    flexDirection: "row", 
    gap: 8, 
    marginBottom: 0 
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: { 
    fontSize: 18,
    marginBottom: 4
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 12
  },
  placeholder: {
    flex: 1,
    // Invisible placeholder to maintain layout
  },
});

/**
 * VoiceComposer with direct file upload to Firebase Storage
 * Alternative implementation that avoids ArrayBuffer/Blob conversion issues
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { mmss } from "./useAudioPlayer";
import { saveVoiceNote } from "@/services/voice.service";

interface VoiceComposerProps {
  familyId: string;
  context: "task" | "safe";
  parentId: string;
  userId: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function VoiceComposer({
  familyId,
  context,
  parentId,
  userId,
  onSaved,
  onCancel,
}: VoiceComposerProps) {
  const recRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.requestPermissionsAsync();
    };
    setupAudio();
    return () => stopTimer();
  }, []);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(async () => {
      try {
        const s = await recRef.current?.getStatusAsync();
        if (s && s.isRecording) {
          setDuration(s.durationMillis ?? 0);
        }
      } catch {}
    }, 200);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const start = async () => {
    try {
      // Request permissions first
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record voice notes. Please enable it in your device settings.'
        );
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and start recording
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recRef.current = rec;
      setIsRecording(true);
      setDuration(0);
      startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert(
        'Recording Error',
        `Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const stop = async () => {
    if (!recRef.current) return;
    
    try {
      setIsLoading(true);
      await recRef.current.stopAndUnloadAsync();
      stopTimer();
      setIsRecording(false);
      
      const uri = recRef.current.getURI()!;
      
      // Direct upload without conversion - let Firebase handle the file
      await saveVoiceNote({ 
        familyId, 
        context, 
        parentId, 
        userId, 
        fileUri: uri, 
        durationMs: duration 
      });
      
      onSaved?.();
    } catch (e) {
      console.error('Error saving voice note:', e);
      Alert.alert(
        'Save Error',
        `Failed to save voice note: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
      try {
        // await recRef.current?.unloadAsync();
      } catch {}
      recRef.current = null;
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Record a voice note</Text>

      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity onPress={start} style={[styles.btn, styles.rec]}>
            <Ionicons name="mic" size={18} color="#fff" />
            <Text style={styles.btnTxt}>Record</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stop} style={[styles.btn, styles.stop]}>
            <Ionicons name="stop" size={18} color="#fff" />
            <Text style={styles.btnTxt}>Stop & Save</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timer}>{mmss(duration)}</Text>
        <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.ghost]}>
          <Text style={styles.ghostTxt}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#fff", borderRadius: 14, padding: 12, elevation: 2 },
  title: { fontWeight: "800", color: "#111827", marginBottom: 6 },
  controls: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  rec: { backgroundColor: "#7c3aed" }, 
  stop: { backgroundColor: "#16a34a" },
  btnTxt: { color: "#fff", fontWeight: "800" },
  ghost: { backgroundColor: "#eef2ff" }, 
  ghostTxt: { color: "#111827", fontWeight: "800" },
  timer: { marginLeft: "auto", fontWeight: "800", color: "#111827" },
  loadingContainer: { marginTop: 8, alignItems: 'center' },
  loadingText: { color: '#666', fontSize: 12 },
});





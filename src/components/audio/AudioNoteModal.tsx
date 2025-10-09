/**
 * AudioNoteModal - Modal for recording and saving audio notes
 * Used by both Task and SafeRoom contexts
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface AudioNoteModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSaved: (localUri: string) => Promise<void>;
}

export const AudioNoteModal: React.FC<AudioNoteModalProps> = ({
  visible,
  onClose,
  title,
  onSaved
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission to record audio');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
      
      // Update duration every second
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Stop recording after 60 seconds max
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
        clearInterval(interval);
      }, 60000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Playback Error', 'Failed to play recording');
    }
  };

  const stopPlaying = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const saveRecording = async () => {
    if (!recordingUri) {
      Alert.alert('No Recording', 'Please record something first');
      return;
    }

    try {
      setIsLoading(true);
      await onSaved(recordingUri);
      
      // Clean up
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      setRecordingUri(null);
      setIsPlaying(false);
      setDuration(0);
      onClose();
      
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert('Save Error', 'Failed to save recording');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRecording = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setRecordingUri(null);
    setIsPlaying(false);
    setDuration(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Recording Status */}
          <View style={styles.statusContainer}>
            {isRecording ? (
              <View style={styles.recordingContainer}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording... {formatTime(duration)}</Text>
              </View>
            ) : recordingUri ? (
              <Text style={styles.readyText}>Recording ready ({formatTime(duration)})</Text>
            ) : (
              <Text style={styles.readyText}>Tap to start recording</Text>
            )}
          </View>

          {/* Main Button */}
          <TouchableOpacity
            style={[
              styles.mainButton,
              { backgroundColor: isRecording ? '#EF4444' : recordingUri ? '#10B981' : '#FF6B9D' }
            ]}
            onPress={isRecording ? stopRecording : recordingUri ? (isPlaying ? stopPlaying : playRecording) : startRecording}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <Ionicons
                name={
                  isRecording ? 'stop' :
                  recordingUri ? (isPlaying ? 'pause' : 'play') :
                  'mic'
                }
                size={48}
                color="white"
              />
            )}
          </TouchableOpacity>

          {/* Action Buttons */}
          {recordingUri && !isRecording && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={cancelRecording}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={saveRecording}
                disabled={isLoading}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  statusContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  readyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  mainButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

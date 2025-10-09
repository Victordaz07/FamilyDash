/**
 * AudioNotePlayer - Compact audio player for displaying audio notes
 * Used in both Task and SafeRoom contexts
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface AudioNotePlayerProps {
  uri: string;
  label?: string;
  duration?: string;
  compact?: boolean;
}

export const AudioNotePlayer: React.FC<AudioNotePlayerProps> = ({
  uri,
  label = "Voice note",
  duration,
  compact = false
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const playAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        return;
      }

      setIsLoading(true);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setPlaybackPosition(status.positionMillis || 0);
            setPlaybackDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
              if (sound) {
                sound.setPositionAsync(0);
              }
            }
          }
        }
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPlaybackPosition(0);
        setPlaybackDuration(0);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={playAudio}
        activeOpacity={0.8}
      >
        <View style={[styles.compactButton, { backgroundColor: isPlaying ? '#10B981' : '#FF6B9D' }]}>
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={16} 
              color="white" 
            />
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLabel}>{label}</Text>
          {duration && (
            <Text style={styles.compactDuration}>{duration}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: isPlaying ? '#10B981' : '#FF6B9D' }]}
        onPress={playAudio}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color="white" 
          />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        
        {/* Progress Bar */}
        {playbackDuration > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(playbackPosition / playbackDuration) * 100}%`
                  }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(playbackPosition)}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(playbackDuration)}
              </Text>
            </View>
          </View>
        )}

        {/* Duration from metadata */}
        {duration && !playbackDuration && (
          <Text style={styles.duration}>Duration: {duration}</Text>
        )}
      </View>

      {sound && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopAudio}
          activeOpacity={0.8}
        >
          <Ionicons name="stop" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  stopButton: {
    padding: 8,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  compactDuration: {
    fontSize: 10,
    color: '#6B7280',
  },
});

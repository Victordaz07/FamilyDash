import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface VideoPlayerProps {
  uri: string;
  duration?: number;
  onDelete?: () => void;
  showControls?: boolean;
}

export default function VideoPlayer({ 
  uri, 
  duration, 
  onDelete, 
  showControls = true 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<Video>(null);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleSeek = async (position: number) => {
    if (!videoRef.current || !isLoaded) return;
    
    const seekPosition = (position / 100) * videoDuration;
    await videoRef.current.setPositionAsync(seekPosition);
    setPosition(seekPosition);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsLoaded(true);
      setPosition(status.positionMillis || 0);
      setVideoDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying || false);
    }
  };

  const progress = videoDuration > 0 ? (position / videoDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
        
        {showControls && (
          <View style={styles.overlay}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={40} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showControls && (
        <View style={styles.controls}>
          <Text style={styles.timeText}>
            {formatTime(position)}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${progress}%` }]} />
            </View>
            <TouchableOpacity
              style={[styles.seekThumb, { left: `${progress}%` }]}
              onPress={() => {}} // Could add seek functionality here
            />
          </View>
          
          <Text style={styles.timeText}>
            {formatTime(videoDuration || (duration || 0) * 1000)}
          </Text>
        </View>
      )}

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    minWidth: 40,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 12,
    position: 'relative',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progress: {
    height: 4,
    backgroundColor: '#EC4899',
    borderRadius: 2,
  },
  seekThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EC4899',
    marginLeft: -8,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});





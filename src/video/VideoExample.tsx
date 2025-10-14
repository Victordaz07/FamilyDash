/**
 * Example usage of the robust video solution
 * This file demonstrates how to use VideoPlayerView in different scenarios
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { VideoPlayerView } from './VideoPlayerView';
import { VideoErrorBoundary } from './VideoErrorBoundary';

export const VideoExample: React.FC = () => {
  const [visibleVideo, setVisibleVideo] = useState<string | null>(null);

  // Example video URLs (replace with your actual URLs)
  const exampleVideos = [
    {
      id: '1',
      uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Big Buck Bunny (MP4)',
      thumbnailUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
    },
    {
      id: '2',
      uri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      title: 'Sample Video (MP4)',
      thumbnailUri: undefined
    },
    {
      id: '3',
      uri: 'https://example.com/unsupported.avi', // This will show fallback
      title: 'Unsupported Format (AVI)',
      thumbnailUri: undefined
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Video Examples</Text>
      
      {exampleVideos.map((video) => (
        <View key={video.id} style={styles.videoContainer}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          
          <VideoErrorBoundary
            fallback={
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>Error loading video</Text>
              </View>
            }
            onError={(error, errorInfo) => {
              console.warn('Video Error Boundary caught:', error, errorInfo);
            }}
          >
            <VideoPlayerView
              uri={video.uri}
              thumbnailUri={video.thumbnailUri}
              visible={visibleVideo === video.id}
              autoPlay={false}
              loop={false}
              muted={true}
              useCache={true}
              stallTimeoutMs={15000}
              maxRetries={3}
              onError={(error) => {
                console.warn('Video error:', error);
              }}
              onReady={() => {
                console.log(`Video ${video.id} is ready to play`);
              }}
              style={styles.videoPlayer}
            />
          </VideoErrorBoundary>
          
          <Text style={styles.controls}>
            Visible: {visibleVideo === video.id ? 'Yes' : 'No'}
            {' | '}
            <Text 
              style={styles.toggleButton}
              onPress={() => setVisibleVideo(
                visibleVideo === video.id ? null : video.id
              )}
            >
              {visibleVideo === video.id ? 'Hide' : 'Show'}
            </Text>
          </Text>
        </View>
      ))}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Features Demonstrated:</Text>
        <Text style={styles.infoText}>• Lazy loading (only visible videos are mounted)</Text>
        <Text style={styles.infoText}>• Error boundary protection</Text>
        <Text style={styles.infoText}>• Automatic fallback for unsupported formats</Text>
        <Text style={styles.infoText}>• Caching for remote videos</Text>
        <Text style={styles.infoText}>• Retry logic with exponential backoff</Text>
        <Text style={styles.infoText}>• Thumbnail fallback when available</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  videoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  videoPlayer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controls: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  toggleButton: {
    color: '#007AFF',
    fontWeight: '600',
  },
  fallbackContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#666',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});





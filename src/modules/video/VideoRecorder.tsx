import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

interface VideoRecorderProps {
  onVideoRecorded: (uri: string, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export default function VideoRecorder({ 
  onVideoRecorded, 
  onCancel, 
  maxDuration = 60 
}: VideoRecorderProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('🎥 Requesting camera permissions...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('🎥 Camera permission status:', status);
      
      console.log('🎥 Requesting microphone permissions...');
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      console.log('🎥 Microphone permission status:', audioStatus.status);
      
      if (status === 'granted' && audioStatus.status === 'granted') {
        console.log('🎥 All permissions granted');
        setHasPermission(true);
      } else {
        console.log('🎥 Permissions denied');
        setHasPermission(false);
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos acceso a la cámara y micrófono para grabar videos.\n\nPor favor, ve a Configuración y permite el acceso a la cámara y micrófono.'
        );
      }
    } catch (error) {
      console.error('🎥 Error requesting permissions:', error);
      setHasPermission(false);
      Alert.alert('Error', 'Error al solicitar permisos');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      console.log('🎥 Camera ref not available');
      return;
    }

    try {
      console.log('🎥 Starting video recording...');
      setIsRecording(true);
      setRecordingDuration(0);
      startTimer();
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: maxDuration * 1000,
        quality: '720p',
      });

      console.log('🎥 Video recording completed:', video);
      if (video) {
        const duration = recordingDuration || 1; // Fallback to 1 second
        console.log('🎥 Calling onVideoRecorded with:', { uri: video.uri, duration });
        onVideoRecorded(video.uri, duration);
      }
    } catch (error) {
      console.error('🎥 Error recording video:', error);
      Alert.alert('Error', `No se pudo grabar el video: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsRecording(false);
      stopTimer();
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      stopTimer();
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permisos...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No se tienen permisos para acceder a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        mode="video"
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatTime(recordingDuration)}
            </Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Grabando</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={[styles.recordButton, isRecording && styles.recordingButton]} 
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <View style={[styles.recordButtonInner, isRecording && styles.recordingButtonInner]} />
          </TouchableOpacity>
          
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Toca para detener' : 'Toca para grabar'}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    marginHorizontal: 20,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 6,
  },
  recordingText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderColor: 'red',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
  },
  recordingButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

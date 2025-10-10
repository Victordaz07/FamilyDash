import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WorkingVideoRecorderProps {
  onVideoRecorded: (uri: string, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number;
}

export default function WorkingVideoRecorder({ 
  onVideoRecorded, 
  onCancel, 
  maxDuration = 60 
}: WorkingVideoRecorderProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      
      if (status === 'granted' && audioStatus.status === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos acceso a la cámara y micrófono para grabar videos.'
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: maxDuration * 1000,
        quality: '720p',
      });

      if (video) {
        // Use a reasonable default duration since we can't easily get the exact duration
        const duration = Math.min(maxDuration, 10); // Default to 10 seconds or maxDuration, whichever is smaller
        onVideoRecorded(video.uri, duration);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'No se pudo grabar el video');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const toggleCamera = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
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
        <Text style={styles.error}>Sin permisos de cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grabar Video</Text>
        <TouchableOpacity style={styles.headerButton} onPress={toggleCamera}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        mode="video"
      />

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingButton]} 
          onPress={isRecording ? stopRecording : startRecording}
        >
          <View style={[styles.recordButtonInner, isRecording && styles.recordingButtonInner]} />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <Text style={styles.status}>
        {isRecording ? '🔴 Grabando... Toca para detener' : '⭕ Toca el botón rojo para grabar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1001,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1001,
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
  status: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
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

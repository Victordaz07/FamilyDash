/**
 * Audio Permission Handler
 * Handles microphone permissions for voice recording
 */

import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';

interface AudioPermissionHandlerProps {
  children: React.ReactNode;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function AudioPermissionHandler({
  children,
  onPermissionGranted,
  onPermissionDenied,
}: AudioPermissionHandlerProps) {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        onPermissionGranted?.();
      } else if (status === 'denied') {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      setPermissionStatus('denied');
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        onPermissionGranted?.();
        return true;
      } else {
        onPermissionDenied?.();
        showPermissionDeniedAlert();
        return false;
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request microphone permission. Please check your device settings.'
      );
      return false;
    }
  };

  const showPermissionDeniedAlert = () => {
    const message = Platform.OS === 'ios' 
      ? 'Microphone permission is required to record voice notes. Please go to Settings > Privacy & Security > Microphone and enable FamilyDash.'
      : 'Microphone permission is required to record voice notes. Please go to Settings > Apps > FamilyDash > Permissions and enable Microphone.';
    
    Alert.alert(
      'Permission Required',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => {
          // Note: In a real app, you might want to use Linking.openSettings()
          console.log('User should go to settings');
        }}
      ]
    );
  };

  // Expose permission methods through context or props
  React.useImperativeHandle(React.useRef(), () => ({
    requestPermissions,
    checkPermissions,
    permissionStatus,
  }));

  return <>{children}</>;
}

// Hook to use audio permissions
export function useAudioPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      setPermissionStatus('denied');
      return 'denied';
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissionStatus,
    requestPermissions,
    checkPermissions,
    hasPermission: permissionStatus === 'granted',
  };
}

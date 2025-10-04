/**
 * Notification Toast Component
 * Quick, non-intrusive notification display
 */

import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ui';

interface NotificationToastProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showIcon?: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
}

export const NotificationToast: FC<NotificationToastProps> = ({
  visible,
  title,
  message,
  type = 'info',
  duration = 3000,
  showIcon = true,
  onPress,
  onDismiss,
}) => {
  const theme = useTheme();
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));
  
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          background: ['#10B981', '#059669'],
          icon: '#ffffff',
          iconName: 'checkmark-circle',
        };
      case 'error':
        return {
          background: ['#EF4444', '#DC2626'],
          icon: '#ffffff',
          iconName: 'close-circle',
        };
      case 'warning':
        return {
          background: ['#F59E0B', '#D97706'],
          icon: '#ffffff',
          iconName: 'warning',
        };
      case 'info':
      default:
        return {
          background: ['#3B82F6', '#2563EB'],
          icon: '#ffffff',
          iconName: 'information-circle',
        };
    }
  };

  const colors = getTypeColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          width: screenWidth - 40,
          left: 20,
        },
      ]}
    >
      <LinearGradient
        colors={colors.background}
        style={styles.toastContainer}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          activeOpacity={onPress ? 0.8 : 1}
        >
          <View style={styles.leftSection}>
            {showIcon && (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={colors.iconName as any}
                  size={20}
                  color={colors.icon}
                />
              </View>
            )}
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideToast}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

interface NotificationToastManagerProps {
  position?: 'top' | 'bottom';
}

export const NotificationToastManager: FC<NotificationToastManagerProps> = ({
  position = 'top',
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  // Add notification to queue
  const addNotification = (notification: any) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  // Remove notification from queue
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Get current notification to show
  const currentNotification = notifications[0];

  return (
    <View style={[
      styles.managerContainer,
      position === 'top' ? styles.topPosition : styles.bottomPosition
    ]}>
      {currentNotification && (
        <NotificationToast
          key={currentNotification.id}
          visible={true}
          title={currentNotification.title}
          message={currentNotification.message}
          type={currentNotification.type}
          duration={currentNotification.duration}
          showIcon={currentNotification.showIcon}
          onPress={currentNotification.onPress}
          onDismiss={() => removeNotification(currentNotification.id)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 9999,
  },
  
  managerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  
  topPosition: {
    top: 60,
  },
  
  bottomPosition: {
    bottom: 100,
  },
  
  toastContainer: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  textContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationToast;

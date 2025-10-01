import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { notificationService, NotificationData } from '../../services/notificationService';
import * as Notifications from 'expo-notifications';

interface NotificationSettingsProps {
  navigation: any;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeNotifications();
    loadScheduledNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const enabled = await notificationService.areNotificationsEnabled();
      setNotificationsEnabled(enabled);
      
      if (enabled) {
        const token = await notificationService.registerForPushNotifications();
        setPushToken(token);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await notificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setIsLoading(true);
    try {
      if (value) {
        const granted = await notificationService.requestPermissions();
        if (granted) {
          const token = await notificationService.registerForPushNotifications();
          setPushToken(token);
          setNotificationsEnabled(true);
          Alert.alert('Success', 'Notifications enabled successfully!');
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
        }
      } else {
        setNotificationsEnabled(false);
        setPushToken(null);
        Alert.alert('Notifications Disabled', 'You will not receive any notifications.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification from FamilyDash!',
        { type: 'test' }
      );
      Alert.alert('Test Sent', 'Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleCancelNotification = async (notificationId: string) => {
    try {
      await notificationService.cancelNotification(notificationId);
      await loadScheduledNotifications();
      Alert.alert('Cancelled', 'Notification cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling notification:', error);
      Alert.alert('Error', 'Failed to cancel notification.');
    }
  };

  const handleScheduleTestReminder = async () => {
    try {
      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + 1); // 1 minute from now

      await notificationService.scheduleNotification({
        id: `test_${Date.now()}`,
        title: 'Test Reminder',
        body: 'This is a test reminder scheduled for 1 minute from now.',
        scheduledTime: testTime,
        type: 'reminder',
        data: { type: 'test' }
      });

      await loadScheduledNotifications();
      Alert.alert('Scheduled', 'Test reminder scheduled for 1 minute from now!');
    } catch (error) {
      console.error('Error scheduling test reminder:', error);
      Alert.alert('Error', 'Failed to schedule test reminder.');
    }
  };

  const formatNotificationTime = (date: Date) => {
    return date.toLocaleString();
  };

  const getNotificationTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'reminder': 'time',
      'event_start': 'play',
      'event_end': 'stop',
      'voting_deadline': 'people',
      'test': 'flask'
    };
    return icons[type] || 'notifications';
  };

  const getNotificationTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'reminder': '#F59E0B',
      'event_start': '#10B981',
      'event_end': '#EF4444',
      'voting_deadline': '#8B5CF6',
      'test': '#6B7280'
    };
    return colors[type] || '#6B7280';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your reminders</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleTestNotification}>
              <Ionicons name="send" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Main Settings */}
      <View style={styles.settingsSection}>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders for events and activities
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              disabled={isLoading}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={notificationsEnabled ? 'white' : '#9CA3AF'}
            />
          </View>

          {pushToken && (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenLabel}>Push Token:</Text>
              <Text style={styles.tokenText} numberOfLines={2}>
                {pushToken}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Test Notifications */}
      <View style={styles.testSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Test Notifications</Text>
          <View style={styles.testButtons}>
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={handleTestNotification}
              disabled={!notificationsEnabled}
            >
              <Ionicons name="send" size={16} color="white" />
              <Text style={styles.testButtonText}>Send Test</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={handleScheduleTestReminder}
              disabled={!notificationsEnabled}
            >
              <Ionicons name="time" size={16} color="white" />
              <Text style={styles.testButtonText}>Schedule Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scheduled Notifications */}
      <View style={styles.scheduledSection}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
            <TouchableOpacity onPress={loadScheduledNotifications}>
              <Ionicons name="refresh" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {scheduledNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No scheduled notifications</Text>
              <Text style={styles.emptyStateSubtext}>
                Notifications will appear here when you create events
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {scheduledNotifications.map((notification, index) => (
                <View key={notification.identifier} style={styles.notificationItem}>
                  <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationTypeColor(notification.content.data?.type || 'reminder') }
                  ]}>
                    <Ionicons 
                      name={getNotificationTypeIcon(notification.content.data?.type || 'reminder') as any} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.content.title}</Text>
                    <Text style={styles.notificationBody}>{notification.content.body}</Text>
                    <Text style={styles.notificationTime}>
                      {formatNotificationTime(new Date(notification.trigger as any))}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelNotification(notification.identifier)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  tokenContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  testSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  scheduledSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cancelButton: {
    padding: 4,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default NotificationSettings;

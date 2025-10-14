/**
 * Advanced Notification Center Component
 * Comprehensive notification management interface
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, AdvancedCard, AdvancedButton } from '../ui';
import { AdvancedNotificationService, UserNotificationPreferences } from '@/services/notifications/AdvancedNotificationService';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  category: string;
  severity: 'high' | 'medium' | 'low';
  actions?: Array<{
    id: string;
    title: string;
    action: string;
  }>;
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const notificationService = AdvancedNotificationService.getInstance();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  // Load notifications and preferences
  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadNotifications = async () => {
    try {
      // Simulate loading notifications
      const mockNotifications: NotificationItem[] = [
        {
          id: 'notif_001',
          title: 'New Task Assigned',
          body: 'Clean your room - Due in 2 hours',
          timestamp: Date.now() - 300000, // 5 minutes ago
          read: false,
          category: 'tasks',
          severity: 'high',
          actions: [
            { id: 'view_task', title: 'View Task', action: 'VIEW_TASK' },
            { id: 'complete', title: 'Mark Done', action: 'COMPLETE_TASK' },
          ],
        },
        {
          id: 'notif_002',
          title: 'Goal Progress Update',
          body: 'You are 75% complete with "Learn Spanish" goal!',
          timestamp: Date.now() - 600000, // 10 minutes ago
          read: false,
          category: 'goals',
          severity: 'medium',
          actions: [
            { id: 'view_goal', title: 'View Goal', action: 'VIEW_GOAL' },
          ],
        },
        {
          id: 'notif_003',
          title: 'Penalty Expired',
          body: 'Your screen time penalty has ended',
          timestamp: Date.now() - 1800000, // 30 minutes ago
          read: true,
          category: 'penalties',
          severity: 'high',
        },
        {
          id: 'notif_004',
          title: 'SafeRoom Message',
          body: 'Dad sent you a message in SafeRoom',
          timestamp: Date.now() - 3600000, // 1 hour ago
          read: true,
          category: 'saferoom',
          severity: 'medium',
          actions: [
            { id: 'view_message', title: 'View Message', action: 'VIEW_MESSAGE' },
            { id: 'reply', title: 'Reply', action: 'REPLY_MESSAGE' },
          ],
        },
        {
          id: 'notif_005',
          title: 'Calendar Event Reminder',
          body: 'Family dinner in 30 minutes',
          timestamp: Date.now() - 5400000, // 1.5 hours ago
          read: true,
          category: 'calendar',
          severity: 'medium',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUserPreferences = async () => {
    const prefs = notificationService.getUserPreferences();
    setPreferences(prefs);
  };

  const updatePreferences = async (newPreferences: Partial<UserNotificationPreferences>) => {
    if (preferences) {
      const updatedPreferences = { ...preferences, ...newPreferences };
      await notificationService.updateUserPreferences(newPreferences);
      setPreferences(updatedPreferences);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const archiveNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleNotificationAction = async (notificationId: string, action: string) => {
    try {
      await notificationService.handleNotificationInteraction(notificationId, action);

      // Handle the action locally
      switch (action) {
        case 'COMPLETE_TASK':
        case 'VIEW_TASK':
          // Navigate to task details or complete task
          Alert.alert('Action', `Performing ${action}...`);
          break;
        case 'VIEW_GOAL':
          Alert.alert('Action', 'Opening goal details...');
          break;
        case 'VIEW_MESSAGE':
          Alert.alert('Action', 'Opening SafeRoom message...');
          break;
      }

      markAsRead(notificationId);
    } catch (error) {
      console.error('Error handling notification action:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by tab
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(notif => !notif.read);
        break;
      case 'archived':
        // In a real app, archived notifications would be separate
        filtered = [];
        break;
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getNotificationCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const getSeverityColor = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.secondary;
      default:
        return theme.colors.gray500;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tasks':
        return 'checkbox';
      case 'goals':
        return 'trophy';
      case 'penalties':
        return 'briefcase';
      case 'saferoom':
        return 'chatbubble';
      case 'calendar':
        return 'calendar';
      default:
        return 'notifications';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <LinearGradient
          colors={themeUtils.gradients.primary as [string, string]}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {getNotificationCount()} unread
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowPreferences(true);
            }}
            style={styles.headerButton}
          >
            <Ionicons name="settings" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['all', 'unread', 'archived'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          {activeTab === 'all' && (
            <AdvancedButton
              variant="ghost"
              size="sm"
              onPress={markAllAsRead}
              icon="checkmark-done"
            >
              Mark All Read
            </AdvancedButton>
          )}
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {getFilteredNotifications().length === 0 ? (
            <AdvancedCard variant="outlined" size="lg" style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color={theme.colors.gray500} />
              <Text style={[theme.typography.textStyles.h3, styles.emptyTitle]}>
                No Notifications
              </Text>
              <Text style={[theme.typography.textStyles.body, styles.emptySubtitle]}>
                {activeTab === 'unread'
                  ? 'You\'re all caught up!'
                  : 'No notifications to show at this time.'
                }
              </Text>
            </AdvancedCard>
          ) : (
            getFilteredNotifications().map((notification) => (
              <AdvancedCard
                key={notification.id}
                variant="outlined"
                size="md"
                style={{
                  ...styles.notificationCard,
                  ...(!notification.read ? styles.unreadNotification : {}),
                }}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationIcon}>
                      <Ionicons
                        name={getCategoryIcon(notification.category) as any}
                        size={20}
                        color={getSeverityColor(notification.severity)}
                      />
                    </View>

                    <View style={styles.notificationMain}>
                      <Text style={[theme.typography.textStyles.title, styles.notificationTitle]}>
                        {notification.title}
                      </Text>
                      <Text style={[theme.typography.textStyles.body, styles.notificationBody]}>
                        {notification.body}
                      </Text>
                    </View>

                    <View style={styles.notificationMeta}>
                      <Text style={[theme.typography.textStyles.caption, styles.notificationTime]}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {notification.actions && notification.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      {notification.actions.map((action) => (
                        <AdvancedButton
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onPress={() => {
                            handleNotificationAction(notification.id, action.action);
                            markAsRead(notification.id);
                          }}
                          icon={action.action === 'VIEW_MESSAGE' ? 'chatbubble' :
                            action.action === 'REPLY_MESSAGE' ? 'arrow-undo' :
                              action.action === 'COMPLETE_TASK' ? 'checkmark' : 'eye'}
                        >
                          {action.title}
                        </AdvancedButton>
                      ))}
                    </View>
                  )}
                </View>
              </AdvancedCard>
            ))
          )}
        </ScrollView>

        {/* Notification Preferences Modal */}
        {showPreferences && (
          <NotificationPreferencesModal
            visible={showPreferences}
            preferences={preferences}
            onClose={() => setShowPreferences(false)}
            onUpdate={updatePreferences}
          />
        )}
      </View>
    </Modal>
  );
};

// Notification Preferences Sub-component
interface NotificationPreferencesModalProps {
  visible: boolean;
  preferences: UserNotificationPreferences | null;
  onClose: () => void;
  onUpdate: (prefs: Partial<UserNotificationPreferences>) => Promise<void>;
}

const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  visible,
  preferences,
  onClose,
  onUpdate,
}) => {
  const theme = useTheme();
  const notificationService = AdvancedNotificationService.getInstance();

  if (!preferences) return null;

  const toggleChannelEnabled = async (channelId: string, enabled: boolean) => {
    await onUpdate({
      channels: {
        ...preferences.channels,
        [channelId]: enabled,
      },
    });
  };

  const toggleQuietHours = async (enabled: boolean) => {
    await onUpdate({
      quietHours: {
        ...preferences.quietHours,
        enabled,
      },
    });
  };

  const channels = notificationService.getChannels();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={themeUtils.gradients.primary as [string, string]}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notification Settings</Text>

          <View style={styles.headerButton} />
        </LinearGradient>

        <ScrollView style={styles.preferencesContent}>
          {/* Master Toggle */}
          <AdvancedCard variant="outlined" size="lg" style={styles.preferenceSection}>
            <Text style={[theme.typography.textStyles.h3, styles.sectionTitle]}>
              Master Settings
            </Text>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={theme.typography.textStyles.title}>All Notifications</Text>
                <Text style={theme.typography.textStyles.caption}>
                  Enable or disable all notifications
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggle,
                  preferences.enabled && styles.toggleActive,
                ]}
                onPress={() => onUpdate({ enabled: !preferences.enabled })}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    preferences.enabled && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </AdvancedCard>

          {/* Channel Preferences */}
          <AdvancedCard variant="outlined" size="lg" style={styles.preferenceSection}>
            <Text style={[theme.typography.textStyles.h3, styles.sectionTitle]}>
              Notification Categories
            </Text>

            {channels.map((channel) => (
              <View key={channel.id} style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={theme.typography.textStyles.title}>{channel.name}</Text>
                  <Text style={theme.typography.textStyles.caption}>{channel.description}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.toggle,
                    preferences.channels[channel.id] && styles.toggleActive,
                  ]}
                  onPress={() => toggleChannelEnabled(channel.id, !preferences.channels[channel.id])}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      preferences.channels[channel.id] && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </AdvancedCard>

          {/* Quiet Hours */}
          <AdvancedCard variant="outlined" size="lg" style={styles.preferenceSection}>
            <Text style={[theme.typography.textStyles.h3, styles.sectionTitle]}>
              Quiet Hours
            </Text>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={theme.typography.textStyles.title}>Enable Quiet Hours</Text>
                <Text style={theme.typography.textStyles.caption}>
                  Disable notifications during set hours
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggle,
                  preferences.quietHours.enabled && styles.toggleActive,
                ]}
                onPress={() => toggleQuietHours(!preferences.quietHours.enabled)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    preferences.quietHours.enabled && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </AdvancedCard>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },

  // Notifications
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    marginBottom: 12,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    backgroundColor: '#f8f9ff',
  },
  notificationContent: {
    padding: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationMain: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginLeft: 52,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginTop: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6B7280',
  },

  // Preferences
  preferencesContent: {
    flex: 1,
    padding: 20,
  },
  preferenceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },

  // Toggle switch
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

// Import theme utils
import { themeUtils } from '../ui';

export default NotificationCenter;

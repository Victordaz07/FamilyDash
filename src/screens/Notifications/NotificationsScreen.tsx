/**
 * 🔔 NOTIFICATIONS CENTER SCREEN
 * In-app notification feed with badge and mark as read
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Notification } from '@/types/notifications';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, startNotificationsSync } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const notificationsList = Object.values(notifications).sort((a, b) => b.createdAt - a.createdAt);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Sync will auto-update via onSnapshot
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationPress = (notif: Notification) => {
    // Navigate based on metadata
    if (notif.metadata?.taskId) {
      navigation.navigate('Tasks', { taskId: notif.metadata.taskId });
    } else if (notif.metadata?.achId) {
      navigation.navigate('Achievements');
    }
  };

  // Group notifications by date
  const groupedNotifications = notificationsList.reduce((groups, notif) => {
    const date = new Date(notif.createdAt).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(notif);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#60A5FA']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Notifications List */}
      {notificationsList.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            You'll see notifications here when tasks are due or achievements are unlocked
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(groupedNotifications)}
          keyExtractor={([date]) => date}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item: [date, notifs] }) => (
            <View>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{date}</Text>
              </View>
              {notifs.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onPress={() => handleNotificationPress(notif)}
                  onMarkAsRead={() => markAsRead(notif.id)}
                />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  markAllButton: {
    padding: 8,
  },
  dateHeader: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

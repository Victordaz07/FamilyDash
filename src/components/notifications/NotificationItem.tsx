/**
 * 🔔 NOTIFICATION ITEM COMPONENT
 * Individual notification in the feed
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onMarkAsRead: () => void;
}

const getIconForType = (type: string): string => {
  switch (type) {
    case 'task_due_soon': return 'time';
    case 'task_completed': return 'checkmark-circle';
    case 'achievement_unlocked': return 'trophy';
    case 'daily_reminder': return 'notifications';
    default: return 'information-circle';
  }
};

const getColorForChannel = (channel: string): string => {
  switch (channel) {
    case 'tasks': return '#3B82F6';
    case 'achievements': return '#10B981';
    case 'general': return '#6B7280';
    default: return '#8B5CF6';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const iconName = getIconForType(notification.type);
  const channelColor = getColorForChannel(notification.channel);

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.containerUnread]}
      onPress={() => {
        onMarkAsRead();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${channelColor}20` }]}>
        <Ionicons name={iconName as any} size={24} color={channelColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={[styles.unreadDot, { backgroundColor: channelColor }]} />}
        </View>

        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.channelChip, { backgroundColor: `${channelColor}15` }]}>
            <Text style={[styles.channelText, { color: channelColor }]}>
              {notification.channel}
            </Text>
          </View>
          <Text style={styles.time}>
            {getRelativeTime(notification.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  containerUnread: {
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  channelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

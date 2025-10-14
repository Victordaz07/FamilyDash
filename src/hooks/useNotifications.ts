import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/store';
import { useFamilyStore } from '@/store/familyStore';
import NotificationService, { Notification } from '@/services/notifications/NotificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const { familyHouse } = useFamilyStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(() => {
    if (!user || !familyHouse?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    console.log('🔔 Setting up notifications listener for user:', user.uid, 'family:', familyHouse.id);

    const unsubscribe = NotificationService.listenToNotifications(
      user.uid,
      familyHouse.id,
      (newNotifications) => {
        console.log('🔔 Received notifications:', newNotifications.length);
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, familyHouse]);

  useEffect(() => {
    const unsubscribe = loadNotifications();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user || !familyHouse?.id) return;

    try {
      await NotificationService.markAllAsRead(user.uid, familyHouse.id);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, familyHouse]);

  const createTaskNotification = useCallback(async (taskTitle: string, assignedTo: string) => {
    if (!familyHouse?.id) return;

    try {
      await NotificationService.createTaskNotification(taskTitle, assignedTo, familyHouse.id);
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  }, [familyHouse]);

  const createVoteNotification = useCallback(async (voteTitle: string) => {
    if (!familyHouse?.id) return;

    try {
      await NotificationService.createVoteNotification(voteTitle, familyHouse.id);
    } catch (error) {
      console.error('Error creating vote notification:', error);
    }
  }, [familyHouse]);

  const createChatNotification = useCallback(async (senderName: string, message: string) => {
    if (!familyHouse?.id) return;

    try {
      await NotificationService.createChatNotification(senderName, message, familyHouse.id);
    } catch (error) {
      console.error('Error creating chat notification:', error);
    }
  }, [familyHouse]);

  const createEmergencyNotification = useCallback(async () => {
    if (!familyHouse?.id) return;

    try {
      await NotificationService.createEmergencyNotification(familyHouse.id);
    } catch (error) {
      console.error('Error creating emergency notification:', error);
    }
  }, [familyHouse]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createTaskNotification,
    createVoteNotification,
    createChatNotification,
    createEmergencyNotification,
  };
};
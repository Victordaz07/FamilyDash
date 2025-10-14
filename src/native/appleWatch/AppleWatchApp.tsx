import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppleWatchManager, WatchNotification, WatchComplication } from './AppleWatchManager';

interface AppleWatchAppProps {
  familyId: string;
}

export function AppleWatchApp({ familyId }: AppleWatchAppProps) {
  // Apple Watch app component
  const [isConnected, setIsConnected] = useState(false);
  const [complications, setComplications] = useState<WatchComplication[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [activeWorkouts, setActiveWorkouts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<WatchNotification[]>([]);

  const watchManager = AppleWatchManager.getInstance();

  // Initialize Apple Watch app
  useEffect(() => {
    const initializeWatchApp = async () => {
      try {
        // Check connectivity
        const connected = await watchManager.checkWatchConnectivity();
        setIsConnected(connected);

        if (connected) {
          // Setup complications
          await setupDefaultComplications();

          // Load quick actions
          setQuickActions(watchManager.quickActions);

          // Load active workouts
          setActiveWorkouts(watchManager.activeWorkouts);

          console.log('⌚ Apple Watch app initialized');
        }
      } catch (error) {
        console.error('Error initializing Apple Watch app:', error);
      }
    };

    initializeWatchApp();
  }, []);

  // Setup default complications
  const setupDefaultComplications = async () => {
    try {
      const defaultComplications: WatchComplication[] = [
        {
          id: 'family_status',
          type: 'family_status',
          displayText: '3 Active',
          template: 'circularSmall',
          priority: 1,
          updateInterval: 300, // 5 minutes
        },
        {
          id: 'next_task',
          type: 'next_task',
          displayText: 'Buy groceries',
          template: 'graphicRectangular',
          priority: 2,
          updateInterval: 600, // 10 minutes
        },
        {
          id: 'goal_progress',
          type: 'goal_progress',
          displayText: 'Goal: 75%',
          template: 'graphicCircular',
          priority: 3,
          updateInterval: 900, // 15 minutes
        },
      ];

      await watchManager.setupComplications(defaultComplications);
      setComplications(defaultComplications);
    } catch (error) {
      console.error('Error setting up complications:', error);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      const testNotification: WatchNotification = {
        id: `test_${Date.now()}`,
        familyId,
        memberId: 'current_user',
        title: 'Family Meal Time!',
        message: 'Dinner is ready, everyone come to the kitchen!',
        category: 'family_alert',
        urgency: 'medium',
        timestamp: Date.now(),
        actions: [
          { id: 'on_way', title: "I'm on my way", type: 'quick_response' as const },
          { id: 'be_right_there', title: "Be right there", type: 'quick_response' as const },
          { id: 'dismiss', title: 'Dismiss', type: 'dismiss' as const },
        ],
        data: { notificationType: 'family_alert' },
      };

      const success = await watchManager.sendWatchNotification(testNotification);

      if (success) {
        setNotifications(prev => [testNotification, ...prev]);
        console.log('📱 Test notification sent to Apple Watch');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Start family workout
  const startFamilyWorkout = async () => {
    try {
      const workout = await watchManager.startFamilyWorkout(
        'current_user',
        'steps',
        10000 // 10,000 steps goal
      );

      setActiveWorkouts(prev => [workout, ...prev]);
      console.log('💪 Family workout started on Apple Watch');
    } catch (error) {
      console.error('Error starting family workout:', error);
    }
  };

  // Configure watch face
  const configureWatchFace = async () => {
    try {
      await watchManager.configureWatchFace({
        theme: 'modern',
        colorScheme: 'blue',
        complications: ['family_status', 'next_task'],
        layout: 'hybrid',
        features: {
          showFamilyStatus: true,
          showNextTask: true,
          showGoalProgress: true,
          showNotifications: true,
        },
      });

      console.log('🎨 Watch face configured');
    } catch (error) {
      console.error('Error configuring watch face:', error);
    }
  };

  // Handle quick action tap
  const handleQuickActionTap = async (actionId: string) => {
    try {
      console.log(`⚡ Quick action tapped: ${actionId}`);

      const action = quickActions.find(a => a.id === actionId);
      if (!action) return;

      // Execute action based on type
      switch (action.targetType) {
        case 'create_task':
          console.log('➕ Creating task...');
          break;
        case 'add_event':
          console.log('📅 Adding event...');
          break;
        case 'send_message':
          console.log('💬 Opening message...');
          break;
        case 'check_status':
          console.log('👨‍👩‍👧‍👦 Checking family status...');
          break;
      }
    } catch (error) {
      console.error('Error handling quick action tap:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name="watch" size={32} color="white" />
        <Text style={styles.headerTitle}>Apple Watch</Text>
      </LinearGradient>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Ionicons
            name={isConnected ? "checkmark-circle" : "close-circle"}
            size={24}
            color={isConnected ? "#10B981" : "#EF4444"}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected to Apple Watch' : 'Apple Watch Disconnected'}
          </Text>
        </View>
      </View>

      {/* Complications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Watch Complications</Text>

        <View style={styles.complicationsGrid}>
          {complications.map((complication, index) => (
            <View key={index} style={styles.complicationCard}>
              <View style={styles.complicationIcon}>
                <Ionicons name="analytics" size={24} color="#007AFF" />
              </View>
              <Text style={styles.complicationTitle}>
                {complication.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.complicationText}>{complication.displayText}</Text>
              <Text style={styles.complicationUpdate}>
                Updates every {Math.floor(complication.updateInterval / 60)} min
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => handleQuickActionTap(action.id)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={20} color="#007AFF" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              {action.requiresConfirmation && (
                <Ionicons name="shield" size={12} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Workouts Section */}
      {activeWorkouts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Workouts</Text>

          {activeWorkouts.map((workout, index) => (
            <View key={index} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Ionicons name="fitness" size={20} color="#007AFF" />
                <Text style={styles.workoutTitle}>
                  {workout.goalType.charAt(0).toUpperCase() + workout.goalType.slice(1)}
                </Text>
                <Text style={styles.workoutStatus}>
                  {workout.current} / {workout.target}
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(workout.current / workout.target) * 100}%` }
                  ]}
                />
              </View>

              <View style={styles.workoutActions}>
                <TouchableOpacity style={styles.workoutButton}>
                  <Ionicons name="pause" size={16} color="#6B7280" />
                  <Text style={styles.workoutButtonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.workoutButton}>
                  <Ionicons name="stop" size={16} color="#EF4444" />
                  <Text style={styles.workoutButtonText}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Watch Controls Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Watch Controls</Text>

        <TouchableOpacity style={styles.controlButton} onPress={sendTestNotification}>
          <Ionicons name="notifications" size={20} color="#007AFF" />
          <Text style={styles.controlButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={startFamilyWorkout}>
          <Ionicons name="fitness" size={20} color="#007AFF" />
          <Text style={styles.controlButtonText}>Start Family Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={configureWatchFace}>
          <Ionicons name="watch" size={20} color="#007AFF" />
          <Text style={styles.controlButtonText}>Configure Watch Face</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>

          {notifications.slice(0, 3).map((notification, index) => (
            <View key={index} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Text>
              </View>

              <Text style={styles.notificationMessage}>{notification.message}</Text>

              <View style={styles.notificationActions}>
                {notification.actions.slice(0, 2).map((action, actionIndex) => (
                  <TouchableOpacity key={actionIndex} style={styles.notificationAction}>
                    <Text style={styles.notificationActionText}>{action.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  statusContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  complicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  complicationCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  complicationIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  complicationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  complicationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  complicationUpdate: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  workoutStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  workoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  controlButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  notificationAction: {
    flex: 1,
    backgroundColor: '#EBF8FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  notificationActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
});





/**
 * Sync Testing Screen
 * Multi-device synchronization testing with Firebase
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTasksStore } from '@/modules/tasks/store/tasksStore';
import { usePenaltiesStore } from '@/modules/penalties/store/penaltiesStore';
import { useCalendarStore } from '@/modules/calendar/store/calendarStore';
import { useProfileStore } from '@/modules/profile/store/profileStore';
import { RealAuthService, RealDatabaseService } from '../services';
import { syncMonitorService, SyncEvent } from '@/services/sync/SyncMonitorService';

interface SyncTestScreenProps {
  navigation: any;
}

// Use the imported SyncEvent type from SyncMonitorService

const SyncTestingScreen: React.FC<SyncTestScreenProps> = ({ navigation }) => {
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationUser, setSimulationUser] = useState<'device-1' | 'device-2'>('device-1');
  const [refreshing, setRefreshing] = useState(false);
  const [syncStats, setSyncStats] = useState({
    totalEvents: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageLatency: 0,
    lastSyncTime: null as Date | null,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Stores with real-time listeners
  const tasksStore = useTasksStore();
  const penaltiesStore = usePenaltiesStore();
  const calendarStore = useCalendarStore();
  const profileStore = useProfileStore();

  const deviceId = simulationUser;
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await RealAuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };
    getUser();
  }, []);

  // Add sync event
  const addSyncEvent = (event: Omit<SyncEvent, 'id' | 'timestamp'>) => {
    const newEvent: SyncEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setSyncEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events

    // Update stats
    setSyncStats(prev => ({
      ...prev,
      totalEvents: prev.totalEvents + 1,
      lastSyncTime: newEvent.timestamp,
      successfulSyncs: event.status === 'confirmed' || event.status === 'received'
        ? prev.successfulSyncs + 1
        : prev.successfulSyncs,
      failedSyncs: event.status === 'failed'
        ? prev.failedSyncs + 1
        : prev.failedSyncs,
    }));
  };

  // Simulate sync events
  const simulateSyncEvent = async (module: string, type: 'create' | 'update' | 'delete') => {
    try {
      // Add outgoing event
      addSyncEvent({
        type,
        module,
        deviceId,
        userId: currentUser?.uid || 'anonymous',
        status: 'sent',
        data: { action: type, module },
      });

      // Simulate network delay
      const latency = Math.random() * 1000 + 200; // 200-1200ms
      await new Promise(resolve => setTimeout(resolve, latency));

      // Simulate receiving confirmation
      setTimeout(() => {
        addSyncEvent({
          type: 'sync',
          module: `${module}-confirmation`,
          deviceId: simulationUser === 'device-1' ? 'device-2' : 'device-1',
          userId: currentUser?.uid || 'anonymous',
          status: 'received',
          data: { originalType: type, latency },
        });
      }, latency / 2);

      // Update latency stats
      setSyncStats(prev => ({
        ...prev,
        averageLatency: (prev.averageLatency + latency) / 2,
      }));

    } catch (error) {
      addSyncEvent({
        type,
        module,
        deviceId,
        userId: currentUser?.uid || 'anonymous',
        status: 'failed',
        data: { error: error.message },
      });
    }
  };

  // Start simulation mode
  const startSimulation = () => {
    setIsSimulating(true);

    // Simulate different types of events
    const simulationInterval = setInterval(() => {
      if (!isSimulating) {
        clearInterval(simulationInterval);
        return;
      }

      const modules = ['tasks', 'goals', 'penalties', 'calendar', 'profile'];
      const types: ('create' | 'update' | 'delete')[] = ['create', 'update', 'delete'];

      const randomModule = modules[Math.floor(Math.random() * modules.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];

      simulateSyncEvent(randomModule, randomType);
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds

    // Cleanup on unmount
    return () => clearInterval(simulationInterval);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  // Test real Firebase sync
  const testRealSync = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user authenticated');
      return;
    }

    try {
      addSyncEvent({
        type: 'create',
        module: 'tasks-sync-test',
        deviceId,
        userId: currentUser?.uid || 'anonymous',
        status: 'sent',
        data: { action: 'create', module: 'tasks-sync-test' },
      });

      // Create test task via Firebase
      const testTask = {
        title: `Sync Test Task - ${deviceId}`,
        description: `Testing sync from ${deviceId} at ${new Date().toLocaleString()}`,
        priority: 'medium' as const,
        status: 'pending' as const,
        assignedTo: currentUser?.displayName || currentUser?.email || 'Unknown User',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        steps: ['Step 1: Test sync functionality', 'Step 2: Verify real-time updates'],
        progress: 0,
        points: 10,
      };

      const result = await tasksStore.addTask(testTask);

      if (result.success) {
        addSyncEvent({
          type: 'sync',
          module: 'tasks-sync-test',
          deviceId,
          userId: currentUser?.uid || 'anonymous',
          status: 'confirmed',
          data: { taskCreated: true },
        });
        Alert.alert('Success', `Sync test task created successfully!\nCheck other devices for real-time update.`);
      } else {
        throw new Error(result.error || 'Unknown error');
      }

    } catch (error) {
      addSyncEvent({
        type: 'create',
        module: 'tasks-sync-test',
        deviceId,
        userId: currentUser?.uid || 'anonymous',
        status: 'failed',
        data: { error: error.message },
      });
      Alert.alert('Error', `Sync test failed: ${error.message}`);
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    console.log('🔄 Setting up sync testing subscriptions...');

    // Initialize sync monitor
    syncMonitorService.initialize().catch(error => {
      console.error('❒ Failed to initialize sync monitor:', error);
    });

    // Listen for sync events
    const unsubscribeSyncEvents = syncMonitorService.addEventListener((event: SyncEvent) => {
      addSyncEvent({
        type: event.type,
        module: event.module,
        deviceId: event.deviceId,
        userId: event.userId,
        status: event.status,
        data: event.data,
      });
    });

    return () => {
      unsubscribeSyncEvents();
      syncMonitorService.cleanup();
    };
  }, []);

  // Pulse animation for simulation
  useEffect(() => {
    if (isSimulating) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isSimulating, pulseAnim]);

  const onRefresh = async () => {
    setRefreshing(true);

    // Simulate refresh sync
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test all store connections
    try {
      await Promise.all([
        tasksStore.checkConnection(),
        goalsStore.checkConnection(),
        penaltiesStore.checkConnection(),
        calendarStore.checkConnection(),
      ]);

      setRefreshSyncEvent({
        type: 'sync',
        module: 'refresh-sync',
        deviceId,
        userId: currentUser?.uid || 'anonymous',
        status: 'confirmed',
        data: { action: 'refresh', module: 'refresh-sync' },
      });

    } catch (error) {
      addSyncEvent({
        type: 'sync',
        module: 'refresh-sync',
        deviceId,
        userId: currentUser?.uid || 'anonymous',
        status: 'failed',
        data: { error: error.message },
      });
    }

    setRefreshing(false);
  };

  const setRefreshSyncEvent = (event: Omit<SyncEvent, 'id' | 'timestamp'>) => {
    const newEvent: SyncEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setSyncEvents(prev => [newEvent, ...prev.slice(0, 49)]);
  };

  const clearEvents = () => {
    setSyncEvents([]);
    setSyncStats({
      totalEvents: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageLatency: 0,
      lastSyncTime: null,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>🔄 Sync Testing</Text>
        <Text style={styles.headerSubtitle}>
          Device: {deviceId} | User: {currentUser?.email || 'Not authenticated'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Simulation Controls */}
        <View style={styles.simulationControls}>
          <View style={styles.simulationHeader}>
            <Text style={styles.sectionTitle}>Device Simulation</Text>
            <View style={styles.deviceSwitch}>
              <TouchableOpacity
                style={[
                  styles.deviceButton,
                  simulationUser === 'device-1' && styles.deviceButtonActive
                ]}
                onPress={() => setSimulationUser('device-1')}
              >
                <Text style={[
                  styles.deviceButtonText,
                  simulationUser === 'device-1' && styles.deviceButtonTextActive
                ]}>
                  📱 Device 1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deviceButton,
                  simulationUser === 'device-2' && styles.deviceButtonActive
                ]}
                onPress={() => setSimulationUser('device-2')}
              >
                <Text style={[
                  styles.deviceButtonText,
                  simulationUser === 'device-2' && styles.deviceButtonTextActive
                ]}>
                  📱 Device 2
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.simulationButtons}>
            <TouchableOpacity
              style={[styles.simulationButton, isSimulating && styles.simulationButtonActive]}
              onPress={isSimulating ? stopSimulation : startSimulation}
            >
              <Animated.View style={{ transform: [{ scale: isSimulating ? pulseAnim : 1 }] }}>
                <LinearGradient
                  colors={isSimulating ? ['#f44336', '#da190b'] : ['#4CAF50', '#45a049']}
                  style={styles.buttonGradient}
                >
                  <Ionicons
                    name={isSimulating ? "stop" : "play"}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simulationButton}
              onPress={testRealSync}
            >
              <LinearGradient
                colors={['#FF9800', '#f57c00']}
                style={styles.buttonGradient}
              >
                <Ionicons name="flame" size={20} color="white" />
                <Text style={styles.buttonText}>Real Sync Test</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simulationButton}
              onPress={clearEvents}
            >
              <LinearGradient
                colors={['#607D8B', '#455a64']}
                style={styles.buttonGradient}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.buttonText}>Clear Events</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Sync Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{syncStats.totalEvents}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{syncStats.successfulSyncs}</Text>
              <Text style={styles.statLabel}>Successful</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{syncStats.failedSyncs}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(syncStats.averageLatency)}ms</Text>
              <Text style={styles.statLabel}>Avg Latency</Text>
            </View>
          </View>

          {syncStats.lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last sync: {syncStats.lastSyncTime.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Data Status */}
        <View style={styles.dataStatusContainer}>
          <Text style={styles.sectionTitle}>Live Data Status</Text>

          <View style={styles.dataStatusRow}>
            <Text style={styles.dataStatusLabel}>📋 Tasks:</Text>
            <Text style={styles.dataStatusValue}>{tasksStore.tasks.length}</Text>
          </View>

          <View style={styles.dataStatusRow}>
            <Text style={styles.dataStatusLabel}>🎯 Tasks:</Text>
            <Text style={styles.dataStatusValue}>{tasksStore.tasks.length}</Text>
          </View>

          <View style={styles.dataStatusRow}>
            <Text style={styles.dataStatusLabel}>⚠️ Penalties:</Text>
            <Text style={styles.dataStatusValue}>{penaltiesStore.penalties.length}</Text>
          </View>

          <View style={styles.dataStatusRow}>
            <Text style={styles.dataStatusLabel}>📅 Events:</Text>
            <Text style={styles.dataStatusValue}>{calendarStore.events.length}</Text>
          </View>

          <View style={styles.dataStatusRow}>
            <Text style={styles.dataStatusLabel}>👤 User:</Text>
            <Text style={styles.dataStatusValue}>
              {profileStore.currentUser?.name || 'Not logged in'}
            </Text>
          </View>
        </View>

        {/* Sync Events Timeline */}
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Sync Events Timeline</Text>

          {syncEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No sync events yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start simulation or run real sync test to see events
              </Text>
            </View>
          ) : (
            syncEvents.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>{event.timestamp.toLocaleTimeString()}</Text>
                  <Text style={[styles.eventStatus, {
                    color: event.status === 'confirmed' || event.status === 'received'
                      ? '#4CAF50'
                      : event.status === 'failed'
                        ? '#f44336'
                        : '#ff9800'
                  }]}>
                    {event.status === 'sent' ? '📤' :
                      event.status === 'received' ? '📥' :
                        event.status === 'confirmed' ? '✅' : '❌'}
                    {event.status.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.eventContent}>
                  <Text style={styles.eventType}>{event.type.toUpperCase()}</Text>
                  <Text style={styles.eventModule}>
                    {event.deviceId} → {event.module}
                  </Text>
                  {event.data && (
                    <Text style={styles.eventData}>
                      {event.data.latency ? `Latency: ${event.data.latency}ms` : JSON.stringify(event.data)}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  // Simulation Controls
  simulationControls: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simulationHeader: {
    marginBottom: 15,
  },
  deviceSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  deviceButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deviceButtonActive: {
    backgroundColor: '#667eea',
  },
  deviceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#666',
  },
  deviceButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  simulationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simulationButton: {
    flex: 0.3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  simulationButtonActive: {
    // Animation handled by Animated component
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },

  // Statistics
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Data Status
  dataStatusContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataStatusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dataStatusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  // Events Timeline
  eventsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  eventItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
  },
  eventStatus: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  eventModule: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  eventData: {
    fontSize: 10,
    color: '#999',
    marginLeft: 10,
  },
});

export default SyncTestingScreen;

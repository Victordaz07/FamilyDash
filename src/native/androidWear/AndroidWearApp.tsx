import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
import { AndroidWearManager, WearTile, WearNotification, WearHealthData } from './AndroidWearManager';

interface AndroidWearAppProps {
  familyId: string;
}

export function AndroidWearApp({ familyId }: AndroidWearAppProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [activeTiles, setActiveTiles] = useState<WearTile[]>([]);
  const [notifications, setNotifications] = useState<WearNotification[]>([]);
  const [healthData, setHealthData] = useState<WearHealthData[]>([]);
  const [voiceCommandResult, setVoiceCommandResult] = useState<string>('');

  const wearManager = AndroidWearManager.getInstance();

  // Initialize Android Wear app
  useEffect(() => {
    const initializeWearApp = async () => {
      try {
        // Check connectivity
        const connected = await wearManager.checkWearConnectivity();
        setIsConnected(connected);

        if (connected) {
          setConnectedDevices(wearManager.connectedDevices);
          setActiveTiles(wearManager.activeTiles);
          setHealthData(wearManager.healthData);

          console.log('🤲 Android Wear app initialized');
        }
      } catch (error) {
        console.error('Error initializing Android Wear app:', error);
      }
    };

    initializeWearApp();
  }, []);

  // Send test notification
  const sendTestNotification = async () => {
    try {
      const testNotification: WearNotification = {
        id: `test_${Date.now()}`,
        familyId,
        memberId: 'current_user',
        title: 'Family Task Reminder',
        message: 'Don\'t forget: Buy groceries today at 5 PM',
        category: 'task_reminder',
        priority: 'high',
        channelId: 'family_tasks',
        actions: [
          {
            title: 'Mark Done',
            icon: 'checkmark',
            pendingIntent: 'MARK_DONE_INTENT',
            actionCode: 'mark_done',
          },
          {
            title: 'Snooze',
            icon: 'time',
            pendingIntent: 'SNOOZE_INTENT',
            actionCode: 'snooze_1h',
          },
          {
            title: 'Dismiss',
            icon: 'close',
            pendingIntent: 'DISMISS_INTENT',
            actionCode: 'dismiss',
          },
        ],
        wearableExtender: {
          background: '#007AFF',
          contentIcon: 'calendar',
          contentIconGravity: 'start',
          dismissible: true,
          hintHideIcon: false,
          startScrollBottom: true,
        },
        visibility: 'public',
        timestamp: Date.now(),
      };

      const success = await wearManager.sendWearNotification(testNotification);

      if (success) {
        setNotifications(prev => [testNotification, ...prev]);
        console.log('📱 Test notification sent to Android Wear');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Start fitness tracking
  const startFitnessTracking = async () => {
    try {
      await wearManager.startFitnessTracking('current_user', 'walking');
      console.log('💪 Fitness tracking started on Android Wear');
    } catch (error) {
      console.error('Error starting fitness tracking:', error);
    }
  };

  // Sync health data
  const syncHealthData = async () => {
    try {
      const newHealthData = await wearManager.syncHealtheData();
      setHealthData(newHealthData);
      console.log('📊 Health data synced from Android Wear');
    } catch (error) {
      console.error('Error syncing health data:', error);
    }
  };

  // Test voice command
  const testVoiceCommand = async () => {
    try {
      const command = 'Hey FamilyDash, create a task to buy groceries';
      const result = await wearManager.handleVoiceCommand(command);
      setVoiceCommandResult(result.response);
      console.log(`🎤 Voice command test result: ${result.response}`);
    } catch (error) {
      console.error('Error testing voice command:', error);
    }
  };

  // Create custom tile
  const createCustomTile = async () => {
    try {
      const customTile: WearTile = {
        id: `custom_${Date.now()}`,
        title: 'Custom Family Tile',
        content: 'Family Activities',
        category: 'family_status',
        layout: 'action_tile',
        data: {
          customData: 'This is a custom tile',
          backgroundColor: '#34D399',
          textColor: '#FFFFFF',
        },
        priority: 1,
        updateInterval: 300, // 5 minutes
        isActive: true,
      };

      const success = await wearManager.createTile(customTile);

      if (success) {
        setActiveTiles(prev => [customTile, ...prev]);
        console.log('📱 Custom tile created on Android Wear');
      }
    } catch (error) {
      console.error('Error creating custom tile:', error);
    }
  };

  // Update tile
  const updateTile = async (tileId: string) => {
    try {
      const newData = {
        updatedAt: Date.now(),
        dynamicContent: `Updated at ${new Date().toLocaleTimeString()}`,
      };

      await wearManager.updateTile(tileId, newData);
      console.log(`📱 Tile updated: ${tileId}`);
    } catch (error) {
      console.error('Error updating tile:', error);
    }
  };

  const renderHealthDataCard = (data: WearHealthData, index: number) => (
    <View key={index} style={styles.healthCard}>
      <View style={styles.healthIcon}>
        <Ionicons
          name={
            data.dataType === 'steps' ? 'walk' :
              data.dataType === 'heart_rate' ? 'heart' :
                data.dataType === 'exercise' ? 'fitness' : 'time'
          }
          size={20}
          color="#059669"
        />
      </View>
      <View style={styles.healthInfo}>
        <Text style={styles.healthType}>
          {data.dataType.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.healthValue}>
          {data.value} {data.unit}
        </Text>
        <Text style={styles.healthSource}>
          {data.source === 'automatic' ? 'Auto' : 'Manual'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name="watch-outline" size={32} color="white" />
        <Text style={styles.headerTitle}>Android Wear</Text>
      </LinearGradient>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Ionicons
            name={isConnected ? "checkmark-circle" : "close-circle"}
            size={24}
            color={isConnected ? "#10B981" : "#EF4444"}
          />
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>
              {isConnected ? 'Connected to Android Wear' : 'Android Wear Disconnected'}
            </Text>
            {connectedDevices.length > 0 && (
              <Text style={styles.deviceList}>
                Devices: {connectedDevices.join(', ')}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Active Tiles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Wear Tiles</Text>

        <View style={styles.tilesGrid}>
          {activeTiles.map((tile, index) => (
            <View key={index} style={styles.tileCard}>
              <View style={styles.tileHeader}>
                <View style={styles.tileIcon}>
                  <Ionicons name="square-outline" size={20} color="#059669" />
                </View>
                <Text style={styles.tileTitle}>{tile.title}</Text>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => updateTile(tile.id)}
                >
                  <Ionicons name="refresh" size={12} color="#059669" />
                </TouchableOpacity>
              </View>

              <Text style={styles.tileContent}>{tile.content}</Text>

              <View style={styles.tileInfo}>
                <Text style={styles.tileCategory}>
                  {tile.category.replace('_', ' ')}
                </Text>
                <Text style={styles.tileUpdate}>
                  Updates every {tile.updateInterval / 60}min
                </Text>
              </View>

              {tile.layout === 'gauge_tile' && (
                <View style={styles.tileGauge}>
                  <View style={styles.gaugeBackground}>
                    <View
                      style={[
                        styles.gaugeFill,
                        { width: `${tile.data.progress || 75}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.gaugeText}>
                    {tile.data.progress || 75}%
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.createTileButton} onPress={createCustomTile}>
          <Ionicons name="add-circle" size={20} color="#059669" />
          <Text style={styles.createTileButtonText}>Create Custom Tile</Text>
        </TouchableOpacity>
      </View>

      {/* Health Data Section */}
      {healthData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Data</Text>
            <TouchableOpacity style={styles.syncButton} onPress={syncHealthData}>
              <Ionicons name="refresh" size={16} color="#059669" />
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.healthContainer}>
              {healthData.map((data, index) => renderHealthDataCard(data, index))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Wear Controls Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wear Controls</Text>

        <TouchableOpacity style={styles.controlButton} onPress={sendTestNotification}>
          <Ionicons name="notifications" size={20} color="#059669" />
          <Text style={styles.controlButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={startFitnessTracking}>
          <Ionicons name="fitness" size={20} color="#059669" />
          <Text style={styles.controlButtonText}>Start Fitness Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={testVoiceCommand}>
          <Ionicons name="mic" size={20} color="#059669" />
          <Text style={styles.controlButtonText}>Test Voice Command</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={syncHealthData}>
          <Ionicons name="sync" size={20} color="#059669" />
          <Text style={styles.controlButtonText}>Sync Health Data</Text>
        </TouchableOpacity>
      </View>

      {/* Voice Command Result */}
      {voiceCommandResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Command Result</Text>

          <View style={styles.voiceResultCard}>
            <Ionicons name="chatbubble" size={20} color="#059669" />
            <Text style={styles.voiceResultText}>{voiceCommandResult}</Text>
          </View>
        </View>
      )}

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
                    <Ionicons name={action.icon as any} size={12} color="#059669" />
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
    backgroundColor: '#F0FDF4',
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
    alignItems: 'flex-start',
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  deviceList: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  tilesGrid: {
    gap: 12,
  },
  tileCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  updateButton: {
    width: 24,
    height: 24,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileContent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tileCategory: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  tileUpdate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  tileGauge: {
    marginTop: 8,
    alignItems: 'center',
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  gaugeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  createTileButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
    borderStyle: 'dashed',
    marginTop: 12,
  },
  createTileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  healthContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  healthCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  healthInfo: {
    flex: 1,
  },
  healthType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  healthSource: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
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
  voiceResultCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceResultText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
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
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  notificationActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
});





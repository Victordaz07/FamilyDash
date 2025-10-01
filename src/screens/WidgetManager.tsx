import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface WidgetManagerProps {
  navigation: any;
}

const WidgetManager: React.FC<WidgetManagerProps> = ({ navigation }) => {
  const [widgetsEnabled, setWidgetsEnabled] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState([
    {
      id: 'calendar',
      name: 'Calendar Widget',
      description: 'Shows today\'s activities and schedule',
      icon: 'calendar',
      color: '#3B82F6',
      enabled: true
    },
    {
      id: 'tasks',
      name: 'Tasks Widget',
      description: 'Quick view of pending tasks',
      icon: 'checkmark-circle',
      color: '#10B981',
      enabled: false
    },
    {
      id: 'penalties',
      name: 'Penalties Widget',
      description: 'Active penalties countdown',
      icon: 'warning',
      color: '#EF4444',
      enabled: false
    },
    {
      id: 'goals',
      name: 'Goals Widget',
      description: 'Progress towards family goals',
      icon: 'trophy',
      color: '#F59E0B',
      enabled: false
    }
  ]);

  useEffect(() => {
    checkWidgetSupport();
  }, []);

  const checkWidgetSupport = () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Widgets Not Supported',
        'Widgets are only available on Android devices.',
        [{ text: 'OK' }]
      );
      return;
    }
    setWidgetsEnabled(true);
  };

  const handleAddWidget = (widgetId: string) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Available', 'Widgets are only supported on Android');
      return;
    }

    Alert.alert(
      'Add Widget',
      'To add this widget to your home screen:\n\n1. Long press on your home screen\n2. Select "Widgets"\n3. Find "FamilyDash"\n4. Drag the widget to your home screen',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Got it!', style: 'default' }
      ]
    );
  };

  const handleConfigureWidget = (widgetId: string) => {
    Alert.alert(
      'Configure Widget',
      'Widget configuration options would be available here.',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveWidget = (widgetId: string) => {
    Alert.alert(
      'Remove Widget',
      'To remove this widget:\n\n1. Long press on the widget\n2. Drag it to "Remove" or "Trash"',
      [{ text: 'OK' }]
    );
  };

  const getWidgetStatus = (widget: any) => {
    if (!widgetsEnabled) return 'Not Supported';
    if (widget.enabled) return 'Available';
    return 'Coming Soon';
  };

  const getWidgetStatusColor = (widget: any) => {
    if (!widgetsEnabled) return '#9CA3AF';
    if (widget.enabled) return '#10B981';
    return '#F59E0B';
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Android Widgets</Text>
            <Text style={styles.headerSubtitle}>Home screen widgets</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="help-circle" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Widget Status */}
      <View style={styles.statusSection}>
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={widgetsEnabled ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={widgetsEnabled ? "#10B981" : "#EF4444"} 
            />
            <Text style={styles.statusTitle}>
              {widgetsEnabled ? 'Widgets Supported' : 'Widgets Not Supported'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {widgetsEnabled 
              ? 'You can add FamilyDash widgets to your Android home screen for quick access to your family activities.'
              : 'Widgets are only available on Android devices. Please use an Android device to access this feature.'
            }
          </Text>
        </View>
      </View>

      {/* Available Widgets */}
      <View style={styles.widgetsSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Available Widgets</Text>
          <View style={styles.widgetsList}>
            {availableWidgets.map(widget => (
              <View key={widget.id} style={styles.widgetItem}>
                <View style={styles.widgetInfo}>
                  <View style={[styles.widgetIcon, { backgroundColor: widget.color }]}>
                    <Ionicons name={widget.icon as any} size={20} color="white" />
                  </View>
                  <View style={styles.widgetDetails}>
                    <Text style={styles.widgetName}>{widget.name}</Text>
                    <Text style={styles.widgetDescription}>{widget.description}</Text>
                    <View style={styles.widgetStatusContainer}>
                      <View style={[
                        styles.widgetStatusDot, 
                        { backgroundColor: getWidgetStatusColor(widget) }
                      ]} />
                      <Text style={[
                        styles.widgetStatus, 
                        { color: getWidgetStatusColor(widget) }
                      ]}>
                        {getWidgetStatus(widget)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.widgetActions}>
                  {widget.enabled && widgetsEnabled ? (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleAddWidget(widget.id)}
                      >
                        <Ionicons name="add" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleConfigureWidget(widget.id)}
                      >
                        <Ionicons name="settings" size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleRemoveWidget(widget.id)}
                      >
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.disabledButton]}
                      disabled
                    >
                      <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How to Add Widgets</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Long press on an empty area of your home screen
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Tap "Widgets" from the menu that appears
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Find "FamilyDash" in the widgets list
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Drag the widget to your desired location
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </View>
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
  statusSection: {
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  widgetsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  widgetsList: {
    gap: 12,
  },
  widgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  widgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  widgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  widgetDetails: {
    flex: 1,
  },
  widgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  widgetDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  widgetStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  widgetStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  widgetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F9FAFB',
  },
  instructionsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default WidgetManager;

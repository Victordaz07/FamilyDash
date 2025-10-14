/**
 * 🔔 NOTIFICATION SETTINGS SCREEN
 * Complete notification configuration interface
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '@/store';
import { NotificationSettings } from '@/types/notifications';
import { DNDSettings } from '@/components/notifications/DNDSettings';
import { rescheduleDailyReminderAvoidingDND } from '@/services/notifications/dndService';

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, setSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);

  const handleSettingsChange = (partialSettings: Partial<NotificationSettings>) => {
    const newSettings = {
      ...localSettings,
      ...partialSettings,
      dnd: { ...localSettings.dnd, ...partialSettings.dnd },
      channels: { ...localSettings.channels, ...partialSettings.channels },
      dailyReminder: { ...localSettings.dailyReminder, ...partialSettings.dailyReminder },
    };
    setLocalSettings(newSettings);
    setSettings(partialSettings);
  };

  const handleChannelToggle = (channel: keyof NotificationSettings['channels'], enabled: boolean) => {
    handleSettingsChange({
      channels: {
        ...localSettings.channels,
        [channel]: enabled,
      },
    });
  };

  const handleDailyReminderToggle = (enabled: boolean) => {
    handleSettingsChange({
      dailyReminder: {
        ...localSettings.dailyReminder,
        enabled,
      },
    });
  };

  const handleTimeChange = (hour: number, minute: number) => {
    handleSettingsChange({
      dailyReminder: {
        ...localSettings.dailyReminder,
        hour,
        minute,
      },
    });
  };

  const showTimePicker = () => {
    const { hour, minute } = localSettings.dailyReminder;
    const currentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    Alert.prompt(
      'Daily Reminder Time',
      'Enter time in HH:MM format (24-hour)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: (input) => {
            if (input && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input)) {
              const [h, m] = input.split(':').map(Number);
              handleTimeChange(h, m);
              
              // Reschedule reminder to avoid DND
              rescheduleDailyReminderAvoidingDND().catch(console.warn);
            } else {
              Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 20:00)');
            }
          },
        },
      ],
      'plain-text',
      currentTime
    );
  };

  const handleSave = () => {
    // Apply all settings
    setSettings(localSettings);
    
    // Reschedule daily reminder if needed
    if (localSettings.dailyReminder.enabled) {
      rescheduleDailyReminderAvoidingDND().catch(console.warn);
    }
    
    Alert.alert('Settings Saved', 'Your notification preferences have been updated.');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A007F', '#7B1FA2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Channel Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Tasks</Text>
                <Text style={styles.settingDescription}>Task reminders and completions</Text>
              </View>
            </View>
            <Switch
              value={localSettings.channels.tasks}
              onValueChange={(enabled) => handleChannelToggle('tasks', enabled)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={localSettings.channels.tasks ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="trophy-outline" size={24} color="#8E24AA" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Achievements</Text>
                <Text style={styles.settingDescription}>Achievement unlocks and progress</Text>
              </View>
            </View>
            <Switch
              value={localSettings.channels.achievements}
              onValueChange={(enabled) => handleChannelToggle('achievements', enabled)}
              trackColor={{ false: '#E5E7EB', true: '#8E24AA' }}
              thumbColor={localSettings.channels.achievements ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>General</Text>
                <Text style={styles.settingDescription}>App updates and general notifications</Text>
              </View>
            </View>
            <Switch
              value={localSettings.channels.general}
              onValueChange={(enabled) => handleChannelToggle('general', enabled)}
              trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
              thumbColor={localSettings.channels.general ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* DND Settings */}
        <DNDSettings settings={localSettings} onSettingsChange={handleSettingsChange} />

        {/* Daily Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminder</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="alarm-outline" size={24} color="#10B981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Daily Reminder</Text>
                <Text style={styles.settingDescription}>
                  {localSettings.dailyReminder.enabled 
                    ? `Daily reminder at ${localSettings.dailyReminder.hour.toString().padStart(2, '0')}:${localSettings.dailyReminder.minute.toString().padStart(2, '0')}`
                    : 'Get reminded to check your tasks daily'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.dailyReminder.enabled}
              onValueChange={handleDailyReminderToggle}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={localSettings.dailyReminder.enabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          {localSettings.dailyReminder.enabled && (
            <TouchableOpacity style={styles.timeButton} onPress={showTimePicker}>
              <Text style={styles.timeButtonText}>
                Set Time: {localSettings.dailyReminder.hour.toString().padStart(2, '0')}:{localSettings.dailyReminder.minute.toString().padStart(2, '0')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginLeft: -24,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

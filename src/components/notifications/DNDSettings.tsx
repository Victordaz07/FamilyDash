/**
 * 🔇 DND SETTINGS COMPONENT
 * UI for configuring Do Not Disturb hours
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { NotificationSettings } from '@/types/notifications';
import { formatDNDTimeRange } from '@/services/notifications/dndService';

interface DNDSettingsProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: Partial<NotificationSettings>) => void;
}

export const DNDSettings: React.FC<DNDSettingsProps> = ({ settings, onSettingsChange }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDNDToggle = (enabled: boolean) => {
    onSettingsChange({
      dnd: {
        ...settings.dnd,
        enabled,
      },
    });
  };

  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    onSettingsChange({
      dnd: {
        ...settings.dnd,
        [type]: time,
      },
    });
  };

  const showTimePickerAlert = (type: 'start' | 'end') => {
    const currentTime = type === 'start' ? settings.dnd.start : settings.dnd.end;
    const [hour, minute] = currentTime.split(':').map(Number);

    Alert.prompt(
      `${type === 'start' ? 'Start' : 'End'} Time`,
      'Enter time in HH:MM format (24-hour)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: (input) => {
            if (input && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input)) {
              handleTimeChange(type, input);
            } else {
              Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 22:00)');
            }
          },
        },
      ],
      'plain-text',
      currentTime
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="moon-outline" size={24} color="#6B7280" />
        <Text style={styles.title}>Do Not Disturb</Text>
        <Switch
          value={settings.dnd.enabled}
          onValueChange={handleDNDToggle}
          trackColor={{ false: '#E5E7EB', true: '#8E24AA' }}
          thumbColor={settings.dnd.enabled ? '#FFFFFF' : '#F3F4F6'}
        />
      </View>

      {settings.dnd.enabled && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeRangeLabel}>
            {formatDNDTimeRange(settings.dnd)}
          </Text>
          
          <View style={styles.timeButtons}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => showTimePickerAlert('start')}
            >
              <Text style={styles.timeButtonText}>Start: {settings.dnd.start}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => showTimePickerAlert('end')}
            >
              <Text style={styles.timeButtonText}>End: {settings.dnd.end}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Notifications will be silenced during these hours
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  timeContainer: {
    marginTop: 8,
  },
  timeRangeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  timeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 0.48,
    justifyContent: 'space-between',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

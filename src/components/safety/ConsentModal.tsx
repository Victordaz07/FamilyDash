/**
 * Consent Modal Component
 * Shows detailed information about FamilyDash+ features and consent options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ConsentModalProps {
  visible: boolean;
  feature: 'ping' | 'sos' | 'location';
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentModal({
  visible,
  feature,
  onAccept,
  onDecline,
}: ConsentModalProps) {
  const getFeatureInfo = () => {
    switch (feature) {
      case 'ping':
        return {
          title: 'Emergency Ping',
          icon: 'notifications' as const,
          description: 'Send urgent alerts to family members',
          details: [
            'Sends a high-priority notification to family members',
            'Plays loud alarm sound even when phone is on silent',
            'Shows full-screen alert that requires acknowledgment',
            'Includes sender information and timestamp',
            'Can be used in genuine emergencies only',
          ],
          consentText: 'I understand that Emergency Ping will send urgent alerts to my family members and may override silent mode settings.',
          legalNote: 'This feature is designed for genuine emergencies and should be used responsibly.',
        };
      case 'sos':
        return {
          title: 'Live Audio SOS',
          icon: 'mic' as const,
          description: 'Real-time voice calls for emergencies',
          details: [
            'Initiates a live audio call with family members',
            'Requires explicit acceptance from the recipient',
            'Shows persistent notification during active call',
            'Automatically ends after 5 minutes for privacy',
            'No audio is recorded unless explicitly consented',
          ],
          consentText: 'I understand that Live Audio SOS will request real-time audio access and show a persistent notification during calls.',
          legalNote: 'Audio calls are not recorded by default and require explicit consent from all participants.',
        };
      case 'location':
        return {
          title: 'Location Sharing',
          icon: 'location' as const,
          description: 'Share location in real-time',
          details: [
            'Shares your current location with family members',
            'Updates location every 5 minutes when active',
            'Shows persistent notification while sharing',
            'Supports geofencing for home/school locations',
            'Data is retained for 24-72 hours maximum',
          ],
          consentText: 'I understand that Location Sharing will track and share my location with family members while active.',
          legalNote: 'Location data is encrypted and automatically deleted after 24-72 hours.',
        };
      default:
        return {
          title: 'FamilyDash+ Feature',
          icon: 'star' as const,
          description: 'Premium family safety feature',
          details: ['Premium feature for family safety'],
          consentText: 'I understand this is a premium feature.',
          legalNote: 'Please review our Privacy Policy for more information.',
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#7c3aed', '#8b5cf6']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={featureInfo.icon} size={24} color="white" />
              </View>
              <Text style={styles.headerTitle}>{featureInfo.title}</Text>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>{featureInfo.description}</Text>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>How it works:</Text>
              {featureInfo.details.map((detail, index) => (
                <View key={index} style={styles.detailItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>

            <View style={styles.consentSection}>
              <Text style={styles.consentTitle}>Your consent:</Text>
              <Text style={styles.consentText}>{featureInfo.consentText}</Text>
            </View>

            <View style={styles.legalSection}>
              <Text style={styles.legalTitle}>Important:</Text>
              <Text style={styles.legalText}>{featureInfo.legalNote}</Text>
            </View>

            <View style={styles.privacySection}>
              <TouchableOpacity style={styles.privacyButton}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#6b7280" />
                <Text style={styles.privacyButtonText}>Read Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Text style={styles.declineButtonText}>Not Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    lineHeight: 24,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  consentSection: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  consentText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  legalSection: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  privacySection: {
    alignItems: 'center',
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

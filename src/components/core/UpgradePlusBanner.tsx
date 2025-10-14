/**
 * UpgradePlusBanner Component
 * Shows upgrade prompt for FamilyDash+ features
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface UpgradePlusBannerProps {
  feature: keyof import('@/services/featureFlags').FeatureFlags;
  onUpgrade?: () => void;
  compact?: boolean;
}

export function UpgradePlusBanner({
  feature,
  onUpgrade,
  compact = false,
}: UpgradePlusBannerProps) {
  const getFeatureInfo = () => {
    switch (feature) {
      case 'emergencyPing':
        return {
          title: 'Emergency Ping',
          description: 'Send urgent alerts to family members',
          icon: 'notifications' as const,
        };
      case 'liveAudioSOS':
        return {
          title: 'Live Audio SOS',
          description: 'Real-time voice calls for emergencies',
          icon: 'mic' as const,
        };
      case 'locationSharing':
        return {
          title: 'Location Sharing',
          description: 'Share location in real-time',
          icon: 'location' as const,
        };
      default:
        return {
          title: 'FamilyDash+ Feature',
          description: 'Premium family safety feature',
          icon: 'star' as const,
        };
    }
  };

  const featureInfo = getFeatureInfo();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={featureInfo.icon} size={16} color="#7c3aed" />
        <Text style={styles.compactText}>
          {featureInfo.title} requires FamilyDash+
        </Text>
        <TouchableOpacity onPress={onUpgrade} style={styles.compactButton}>
          <Text style={styles.compactButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#7c3aed', '#8b5cf6']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={featureInfo.icon} size={24} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{featureInfo.title}</Text>
            <Text style={styles.description}>{featureInfo.description}</Text>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>FamilyDash+ includes:</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="notifications" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featureText}>Emergency Ping</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="mic" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featureText}>Live Audio SOS</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featureText}>Location Sharing</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={onUpgrade} style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to FamilyDash+</Text>
          <Ionicons name="arrow-forward" size={16} color="#7c3aed" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  features: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    margin: 8,
    gap: 8,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  compactButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  compactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});





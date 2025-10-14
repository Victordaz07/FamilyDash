/**
 * Safety Settings Screen
 * FamilyDash+ safety features configuration and consent management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFeatureFlags, updateUserConsent, getUserConsent } from '@/services/featureFlags';
import { ConsentModal } from '@/components/safety/ConsentModal';
import { UpgradePlusBanner } from '@/components/core/UpgradePlusBanner';

interface SafetySettingsScreenProps {
  navigation: any;
  route?: any;
}

export default function SafetySettingsScreen({ navigation }: SafetySettingsScreenProps) {
  const familyId = 'default-family'; // TODO: Get from context/params
  const userId = 'current-user'; // TODO: Get from auth context
  
  const { flags, plan, loading } = useFeatureFlags(familyId);
  const [consentModal, setConsentModal] = useState<{
    visible: boolean;
    feature: 'ping' | 'sos' | 'location';
  }>({ visible: false, feature: 'ping' });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConsentToggle = async (feature: 'ping' | 'sos' | 'location', value: boolean) => {
    try {
      await updateUserConsent(familyId, userId, feature, value);
      Alert.alert('Success', `Consent updated for ${feature}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update consent');
    }
  };

  const handleLearnMore = (feature: 'ping' | 'sos' | 'location') => {
    setConsentModal({ visible: true, feature });
  };

  const handleUpgrade = () => {
    // TODO: Implement upgrade flow
    Alert.alert('Upgrade', 'Upgrade flow will be implemented in future phases');
  };

  const renderFeatureToggle = (
    title: string,
    description: string,
    icon: keyof typeof Ionicons.glyphMap,
    feature: 'ping' | 'sos' | 'location',
    flag: keyof typeof flags
  ) => {
    const isEnabled = flags?.[flag] || false;
    const isPlus = plan === "plus";

    return (
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <View style={styles.featureIcon}>
            <Ionicons name={icon} size={24} color="#7c3aed" />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
          </View>
          {isPlus && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Plus</Text>
            </View>
          )}
        </View>

        <View style={styles.featureActions}>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => handleLearnMore(feature)}
          >
            <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>

          {isPlus ? (
            <Switch
              value={isEnabled}
              onValueChange={(value) => handleConsentToggle(feature, value)}
              trackColor={{ false: '#e5e7eb', true: '#7c3aed' }}
              thumbColor={isEnabled ? '#ffffff' : '#f3f4f6'}
            />
          ) : (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading safety settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Family Safety</Text>
            <Text style={styles.headerSubtitle}>Protect your loved ones</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* FamilyDash+ Banner */}
        {plan !== "plus" && (
          <UpgradePlusBanner
            feature="emergencyPing"
            onUpgrade={handleUpgrade}
            compact={true}
          />
        )}

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          <Text style={styles.sectionDescription}>
            Configure emergency and safety features for your family
          </Text>

          {renderFeatureToggle(
            'Emergency Ping',
            'Send urgent alerts to family members',
            'notifications',
            'ping',
            'emergencyPing'
          )}

          {renderFeatureToggle(
            'Live Audio SOS',
            'Real-time voice calls for emergencies',
            'mic',
            'sos',
            'liveAudioSOS'
          )}

          {renderFeatureToggle(
            'Location Sharing',
            'Share location in real-time',
            'location',
            'location',
            'locationSharing'
          )}
        </View>

        {/* Privacy & Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          
          <TouchableOpacity style={styles.legalButton}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
            <Text style={styles.legalButtonText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalButton}>
            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
            <Text style={styles.legalButtonText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalButton}>
            <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
            <Text style={styles.legalButtonText}>How FamilyDash+ Works</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Consent Modal */}
      <ConsentModal
        visible={consentModal.visible}
        feature={consentModal.feature}
        onAccept={() => setConsentModal({ visible: false, feature: 'ping' })}
        onDecline={() => setConsentModal({ visible: false, feature: 'ping' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  featuresSection: {
    padding: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  badge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featureActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMoreText: {
    fontSize: 14,
    color: '#6b7280',
  },
  upgradeButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  legalSection: {
    padding: 16,
    marginTop: 8,
  },
  legalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  legalButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});





/**
 * FeatureGate Component
 * Controls access to FamilyDash+ features based on flags and plan
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFeatureFlags, isFeatureEnabled } from '@/services/featureFlags';
import { UpgradePlusBanner } from './UpgradePlusBanner';

interface FeatureGateProps {
  flag: keyof import('@/services/featureFlags').FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  familyId: string;
  showUpgradeBanner?: boolean;
}

export function FeatureGate({
  flag,
  children,
  fallback,
  familyId,
  showUpgradeBanner = true,
}: FeatureGateProps) {
  const { flags, loading, error, plan } = useFeatureFlags(familyId);

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading features</Text>
      </View>
    );
  }

  // Check if feature is enabled
  const isEnabled = isFeatureEnabled(flags, flag);
  const isPlus = plan === "plus";

  // If feature is enabled, show children
  if (isEnabled) {
    return <>{children}</>;
  }

  // If feature is not enabled and user has plus plan, show fallback
  if (isPlus && fallback) {
    return <>{fallback}</>;
  }

  // If user doesn't have plus plan, show upgrade banner
  if (showUpgradeBanner && !isPlus) {
    return <UpgradePlusBanner feature={flag} />;
  }

  // Default: show nothing
  return null;
}

// Convenience wrapper for specific features
export function EmergencyPingGate({ children, familyId, fallback }: {
  children: React.ReactNode;
  familyId: string;
  fallback?: React.ReactNode;
}) {
  return (
    <FeatureGate
      flag="emergencyPing"
      familyId={familyId}
      fallback={fallback}
    >
      {children}
    </FeatureGate>
  );
}

export function LiveAudioSOSGate({ children, familyId, fallback }: {
  children: React.ReactNode;
  familyId: string;
  fallback?: React.ReactNode;
}) {
  return (
    <FeatureGate
      flag="liveAudioSOS"
      familyId={familyId}
      fallback={fallback}
    >
      {children}
    </FeatureGate>
  );
}

export function LocationSharingGate({ children, familyId, fallback }: {
  children: React.ReactNode;
  familyId: string;
  fallback?: React.ReactNode;
}) {
  return (
    <FeatureGate
      flag="locationSharing"
      familyId={familyId}
      fallback={fallback}
    >
      {children}
    </FeatureGate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
});





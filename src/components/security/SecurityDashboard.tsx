/**
 * Security Dashboard Component
 * Comprehensive security management interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, AdvancedCard, AdvancedButton, AdvancedInput, themeUtils } from '../ui';
import { useSecurity } from '../../hooks/useSecurity';

interface SecurityDashboardProps {
  familyId: string;
  userId: string;
  onNavigate?: (screen: string, params?: any) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  familyId,
  userId,
  onNavigate,
}) => {
  const theme = useTheme();
  const {
    state: {
      isLoading,
      config: securityConfig,
      threats,
      incidents,
      securityScore,
      complianceLevel
    },
    configureSecurity,
    createIncident,
    resolveIncident,
    getSecurityAnalytics
  } = useSecurity({ familyId, userId });

  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'incidents' | 'policies' | 'audit'>('overview');
  const [securityAnalytics, setSecurityAnalytics] = useState<any>(null);

  // Load security data
  useEffect(() => {
    loadSecurityData();
  }, [familyId]);

  const loadSecurityData = async () => {
    try {
      const analytics = await getSecurityAnalytics();
      setSecurityAnalytics(analytics);
    } catch (error) {
      console.error('Error loading security data:', error);
      Alert.alert('Error', 'Failed to load security information');
    }
  };

  const handleToggleSetting = async (setting: string, value: any) => {
    try {
      if (!securityConfig) return;

      const updatedConfig = { ...securityConfig, [setting]: value };
      const success = await configureSecurity(updatedConfig);

      if (!success) {
        Alert.alert('Error', 'Failed to update security configuration');
      }

    } catch (error) {
      Alert.alert('Error', 'Configuration update failed');
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    Alert.alert(
      'Resolve Incident',
      'Mark this incident as resolved?',
      [
        { text: 'Cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            const success = await resolveIncident(incidentId);
            if (success) {
              Alert.alert('Success', 'Incident marked as resolved');
            }
          }
        },
      ]
    );
  };

  const handleCreateSecurityPolicy = () => {
    Alert.alert(
      'Create Security Policy',
      'This will open the security policy creation wizard.',
      [
        { text: 'Cancel' },
        {
          text: 'Create Policy',
          onPress: () => onNavigate?.('CreatePolicy'),
        },
      ]
    );
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'high': return '#FF6B35';
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return '#6B7280';
    }
  };

  const renderOverviewTab = () => {
    if (!securityConfig || !securityAnalytics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Security Score */}
        <AdvancedCard variant="outlined" size="lg" style={styles.scoreCard}>
          <LinearGradient
            colors={securityAnalytics.securityScore >= 80 ? ['#10B981', '#059669'] as const :
              securityAnalytics.securityScore >= 60 ? ['#F59E0B', '#D97706'] as const :
                ['#EF4444', '#DC2626'] as const}
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreValue}>{securityAnalytics.securityScore}/100</Text>
            <Text style={styles.scoreLabel}>Security Score</Text>
            <Text style={styles.scoreLevel}>{securityAnalytics.complianceLevel.toUpperCase()}</Text>
          </LinearGradient>
        </AdvancedCard>

        {/* Security Metrics */}
        <View style={styles.metricsGrid}>
          <AdvancedCard variant="outlined" size="md" style={styles.metricCard}>
            <Text style={styles.metricValue}>{securityAnalytics.threatCount}</Text>
            <Text style={styles.metricLabel}>Active Threats</Text>
            <Ionicons name="warning" size={24} color={theme.colors.warning} />
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="md" style={styles.metricCard}>
            <Text style={styles.metricValue}>{securityAnalytics.incidentCount}</Text>
            <Text style={styles.metricLabel}>Security Incidents</Text>
            <Ionicons name="shield" size={24} color={theme.colors.error} />
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="md" style={styles.metricCard}>
            <Text style={styles.metricValue}>{securityAnalytics.auditLogCount}</Text>
            <Text style={styles.metricLabel}>Audit Events</Text>
            <Ionicons name="document" size={24} color="#3B82F6" />
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="md" style={styles.metricCard}>
            <Text style={styles.metricValue}>Active</Text>
            <Text style={styles.metricLabel}>Session Count</Text>
            <Ionicons name="person" size={24} color={theme.colors.success} />
          </AdvancedCard>
        </View>

        {/* Security Settings */}
        <AdvancedCard variant="outlined" size="lg" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Security Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield" size={24} color={theme.colors.success} />
              <View style={styles.settingDetails}>
                <Text style={theme.typography.textStyles.title}>Encryption Enabled</Text>
                <Text style={theme.typography.textStyles.caption}>Data protection level: Maximum</Text>
              </View>
            </View>
            <Switch
              value={securityConfig.encryptionEnabled}
              onValueChange={(value) => handleToggleSetting('encryptionEnabled', value)}
              trackColor={{ false: '#E5E7EB', true: theme.colors.success }}
              thumbColor={securityConfig.encryptionEnabled ? 'white' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={24} color={theme.colors.primary} />
              <View style={styles.settingDetails}>
                <Text style={theme.typography.textStyles.title}>Biometric Authentication</Text>
                <Text style={theme.typography.textStyles.caption}>Touch ID, Face ID enabled</Text>
              </View>
            </View>
            <Switch
              value={securityConfig.biometricAuthEnabled}
              onValueChange={(value) => handleToggleSetting('biometricAuthEnabled', value)}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
              thumbColor={securityConfig.biometricAuthEnabled ? 'white' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed" size={24} color={theme.colors.warning} />
              <View style={styles.settingDetails}>
                <Text style={theme.typography.textStyles.title}>Multi-Factor Authentication</Text>
                <Text style={theme.typography.textStyles.caption}>2FA via SMS/TOTP</Text>
              </View>
            </View>
            <Switch
              value={securityConfig.multiFactorAuthEnabled}
              onValueChange={(value) => handleToggleSetting('multiFactorAuthEnabled', value)}
              trackColor={{ false: '#E5E7EB', true: theme.colors.warning }}
              thumbColor={securityConfig.multiFactorAuthEnabled ? 'white' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="eye" size={24} color="#3B82F6" />
              <View style={styles.settingDetails}>
                <Text style={theme.typography.textStyles.title}>Audit Logging</Text>
                <Text style={theme.typography.textStyles.caption}>Documented activity: Standard</Text>
              </View>
            </View>
            <Switch
              value={securityConfig.auditLoggingEnabled}
              onValueChange={(value) => handleToggleSetting('auditLoggingEnabled', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={securityConfig.auditLoggingEnabled ? 'white' : '#9CA3AF'}
            />
          </View>
        </AdvancedCard>

        {/* Quick Actions */}
        <AdvancedCard variant="outlined" size="lg" style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <AdvancedButton
            variant="primary"
            size="md"
            onPress={() => onNavigate?.('SecuritySettings')}
            icon="settings-outline"
            style={styles.actionButton}
          >
            Advanced Security Settings
          </AdvancedButton>

          <AdvancedButton
            variant="outline"
            size="md"
            onPress={handleCreateSecurityPolicy}
            icon="add-outline"
            style={styles.actionButton}
          >
            Create Security Policy
          </AdvancedButton>
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderThreatsTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.threatsCard}>
          <View style={styles.threatsHeader}>
            <Text style={styles.sectionTitle}>Security Threats</Text>
            <Text style={styles.threatCount}>{threats.length} active</Text>
          </View>

          {threats.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={48} color={theme.colors.success} />
              <Text style={[theme.typography.textStyles.h3, styles.emptyTitle]}>No Threats Detected</Text>
              <Text style={[theme.typography.textStyles.body, styles.emptySubtitle]}>
                Your family is currently secure with no active threats!
              </Text>
            </View>
          ) : (
            threats.map((threat) => (
              <AdvancedCard key={threat.threatId} variant="outlined" size="md" style={styles.threatItem}>
                <View style={styles.threatHeader}>
                  <View style={styles.threatInfo}>
                    <Text style={theme.typography.textStyles.title}>{threat.description}</Text>
                    <Text style={theme.typography.textStyles.body}>
                      Detected: {formatDate(threat.timestamp)}
                    </Text>
                    <Text style={theme.typography.textStyles.caption}>
                      Source: {threat.source} • Affected: {threat.affectedUsers.length} users
                    </Text>
                  </View>

                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(threat.severity) }
                  ]}>
                    <Text style={styles.severityText}>{threat.severity.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.threatActions}>
                  <AdvancedButton
                    variant="outline"
                    size="sm"
                    onPress={() => onNavigate?.('ThreatDetails', { threatId: threat.threatId })}
                    icon="eye"
                    style={styles.actionButton}
                  >
                    Investigate
                  </AdvancedButton>

                  <AdvancedButton
                    variant="primary"
                    size="sm"
                    onPress={() => Alert.alert('Success', 'Threat mitigation initiated')}
                    icon="checkmark"
                    style={styles.actionButton}
                  >
                    Mitigate
                  </AdvancedButton>
                </View>
              </AdvancedCard>
            ))
          )}
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderIncidentsTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.incidentsCard}>
          <View style={styles.incidentsHeader}>
            <Text style={styles.sectionTitle}>Security Incidents</Text>
            <AdvancedButton
              variant="outline"
              size="sm"
              onPress={() => onNavigate?.('CreateIncident')}
              icon="add"
            >
              Report Incident
            </AdvancedButton>
          </View>

          {incidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.success} />
              <Text style={[theme.typography.textStyles.h3, styles.emptyTitle]}>No Incidents Reported</Text>
              <Text style={[theme.typography.textStyles.body, styles.emptySubtitle]}>
                Security is working perfectly with no incidents to report!
              </Text>
            </View>
          ) : (
            incidents.map((incident) => (
              <AdvancedCard key={incident.incidentId} variant="outlined" size="md" style={styles.incidentItem}>
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentInfo}>
                    <Text style={theme.typography.textStyles.title}>{incident.title}</Text>
                    <Text style={theme.typography.textStyles.body}>{incident.description}</Text>
                    <Text style={theme.typography.textStyles.caption}>
                      Reported: {formatDate(incident.timestamp)} • User: {incident.userId}
                    </Text>
                  </View>

                  <View style={styles.incidentStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getSeverityColor(incident.severity) }
                    ]}>
                      <Text style={styles.statusText}>{incident.severity}</Text>
                    </View>

                    <View style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: incident.status === 'resolved' ? theme.colors.success :
                          incident.status === 'investigating' ? theme.colors.warning :
                            theme.colors.error
                      }
                    ]}>
                      <Text style={styles.statusIndicatorText}>{incident.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.incidentActions}>
                  <AdvancedButton
                    variant="outline"
                    size="sm"
                    onPress={() => onNavigate?.('IncidentDetails', { incidentId: incident.incidentId })}
                    icon="eye"
                    style={styles.actionButton}
                  >
                    View Details
                  </AdvancedButton>

                  <AdvancedButton
                    variant="primary"
                    size="sm"
                    onPress={() => handleResolveIncident(incident.incidentId)}
                    icon="checkmark"
                    style={styles.actionButton}
                    disabled={incident.status === 'resolved'}
                  >
                    {incident.status === 'resolved' ? 'Resolved' : 'Resolve'}
                  </AdvancedButton>
                </View>
              </AdvancedCard>
            ))
          )}
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderPoliciesTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.policiesCard}>
          <View style={styles.policiesHeader}>
            <Text style={styles.sectionTitle}>Security Policies</Text>
            <AdvancedButton
              variant="outline"
              size="sm"
              onPress={handleCreateSecurityPolicy}
              icon="add"
            >
              New Policy
            </AdvancedButton>
          </View>

          {/* Default Policies */}
          <AdvancedCard variant="outlined" size="md" style={styles.policyItem}>
            <View style={styles.policyHeader}>
              <Ionicons name="shield" size={24} color={theme.colors.success} />
              <Text style={theme.typography.textStyles.title}>Password Strength Policy</Text>
            </View>
            <Text style={theme.typography.textStyles.body}>
              Enforces strong password requirements with minimum 8 characters, numbers, and symbols
            </Text>
            <Text style={theme.typography.textStyles.caption}>Priority: High • Status: Active</Text>
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="md" style={styles.policyItem}>
            <View style={styles.policyHeader}>
              <Ionicons name="time" size={24} color={theme.colors.warning} />
              <Text style={theme.typography.textStyles.title}>Session Timeout Policy</Text>
            </View>
            <Text style={theme.typography.textStyles.body}>
              Automatically logs out users after 30 minutes of inactivity
            </Text>
            <Text style={theme.typography.textStyles.caption}>Priority: Medium • Status: Active</Text>
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="md" style={styles.policyItem}>
            <View style={styles.policyHeader}>
              <Ionicons name="location" size={24} color={theme.colors.error} />
              <Text style={theme.typography.textStyles.title}>Location Access Policy</Text>
            </View>
            <Text style={theme.typography.textStyles.body}>
              Requires admin approval for account access from new geographic locations
            </Text>
            <Text style={theme.typography.textStyles.caption}>Priority: High • Status: Active</Text>
          </AdvancedCard>
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderAuditTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.auditCard}>
          <Text style={styles.sectionTitle}>Audit Log</Text>

          {/* Mock audit log entries */}
          <AdvancedCard variant="outlined" size="sm" style={styles.auditItem}>
            <View style={styles.auditHeader}>
              <Ionicons name="log-in" size={16} color={theme.colors.success} />
              <Text style={theme.typography.textStyles.body}>User Login</Text>
              <Text style={theme.typography.textStyles.caption}>2 hours ago</Text>
            </View>
            <Text style={theme.typography.textStyles.caption}>user_123 successfully logged in</Text>
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="sm" style={styles.auditItem}>
            <View style={styles.auditHeader}>
              <Ionicons name="settings" size={16} color="#3B82F6" />
              <Text style={theme.typography.textStyles.body}>Settings Change</Text>
              <Text style={theme.typography.textStyles.caption}>4 hours ago</Text>
            </View>
            <Text style={theme.typography.textStyles.caption}>Security configuration updated</Text>
          </AdvancedCard>

          <AdvancedCard variant="outlined" size="sm" style={styles.auditItem}>
            <View style={styles.auditHeader}>
              <Ionicons name="warning" size={16} color={theme.colors.warning} />
              <Text style={theme.typography.textStyles.body}>Failed Login</Text>
              <Text style={theme.typography.textStyles.caption}>6 hours ago</Text>
            </View>
            <Text style={theme.typography.textStyles.caption}>user_456 failed authentication attempt</Text>
          </AdvancedCard>

          <AdvancedButton
            variant="outline"
            size="md"
            onPress={() => onNavigate?.('AuditLogDetails')}
            icon="document"
            style={styles.viewAllButton}
          >
            View All Audit Logs
          </AdvancedButton>
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'threats':
        return renderThreatsTab();
      case 'incidents':
        return renderIncidentsTab();
      case 'policies':
        return renderPoliciesTab();
      case 'audit':
        return renderAuditTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Security Center</Text>
          <Text style={styles.headerSubtitle}>Advanced Security Management</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadSecurityData} style={styles.actionButton}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('SecurityAlerts')} style={styles.actionButton}>
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'Overview', icon: 'home' },
          { id: 'threats', label: 'Threats', icon: 'shield' },
          { id: 'incidents', label: 'Incidents', icon: 'warning' },
          { id: 'policies', label: 'Policies', icon: 'document' },
          { id: 'audit', label: 'Audit', icon: 'list' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? 'white' : '#6B7280'}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadSecurityData} />}
      >
        {renderCurrentTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#dc2626',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },

  // Score card
  scoreCard: {
    marginBottom: 20,
  },
  scoreGradient: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  scoreLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    opacity: 0.8,
    marginTop: 8,
  },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6B7280',
  },

  // Settings
  settingsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingDetails: {
    flex: 1,
  },

  // Actions
  actionCard: {
    marginBottom: 20,
  },

  // Threats
  threatsCard: {
    marginBottom: 20,
  },
  threatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  threatCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  threatItem: {
    marginBottom: 12,
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  threatInfo: {
    flex: 1,
    marginRight: 12,
  },
  threatActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Incidents
  incidentsCard: {
    marginBottom: 20,
  },
  incidentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  incidentItem: {
    marginBottom: 12,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incidentInfo: {
    flex: 1,
    marginRight: 12,
  },
  incidentStatus: {
    alignItems: 'center',
  },
  incidentActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Policies
  policiesCard: {
    marginBottom: 20,
  },
  policiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  policyItem: {
    marginBottom: 12,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },

  // Audit
  auditCard: {
    marginBottom: 20,
  },
  auditItem: {
    marginBottom: 8,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  viewAllButton: {
    marginTop: 16,
  },

  // Status badges
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusIndicatorText: {
    fontSize: 9,
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6B7280',
  },
});


export default SecurityDashboard;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, BackHandler, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';
import { useAuth } from '../contexts/AuthContext';
import { RealAuthService } from '../services/auth/RealAuthService';
import RealDatabaseService from '../services/database/RealDatabaseService';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  // Enhanced state management
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deviceRingEnabled, setDeviceRingEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [appVersion] = useState('1.3.0');
  const [buildNumber] = useState('4');

  // Theme options
  const themeOptions = [
    { id: 'light', name: 'Light', colors: ['#FFFFFF', '#F8FAFC'] },
    { id: 'dark', name: 'Dark', colors: ['#1F2937', '#111827'] },
    { id: 'auto', name: 'Auto', colors: ['#6366F1', '#8B5CF6'] },
  ];

  const [selectedTheme, setSelectedTheme] = useState('light');

  // Connection monitoring
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await RealDatabaseService.checkConnection();
        setIsConnected(isConnected);
        if (isConnected) {
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.log('Connection check failed:', error);
        setIsConnected(false);
      }
    };

    const connectionInterval = setInterval(checkConnection, 30000);
    checkConnection();

    return () => clearInterval(connectionInterval);
  }, []);

  // Enhanced handlers
  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'Notifications',
      `Push notifications ${notificationsEnabled ? 'disabled' : 'enabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeviceRingToggle = () => {
    setDeviceRingEnabled(!deviceRingEnabled);
    Alert.alert(
      'Device Ring',
      `Device ring ${deviceRingEnabled ? 'disabled' : 'enabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    Alert.alert(
      'Theme Changed',
      `Switched to ${themeOptions.find(t => t.id === themeId)?.name} theme`,
      [{ text: 'OK' }]
    );
  };

  const handleLanguageChange = async () => {
    Alert.alert(
      'Language',
      'Language selection will be available in a future update'
    );
  };

  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    Alert.alert(
      'Dark Mode',
      `Dark mode ${darkModeEnabled ? 'disabled' : 'enabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleSyncNow = async () => {
    try {
      setIsConnected(false);
      const isConnected = await RealDatabaseService.checkConnection();
      setIsConnected(isConnected);
      setLastSyncTime(new Date());
      Alert.alert('Sync', isConnected ? 'Sync completed successfully' : 'Sync failed');
    } catch (error) {
      console.log('Sync failed:', error);
      setIsConnected(false);
      Alert.alert('Sync Error', 'Failed to sync data');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out...');
              const result = await logout();

              if (result.success) {
                console.log('✅ Logout successful');
                Alert.alert('Success', 'Logged out successfully');
              } else {
                console.error('❌ Logout failed:', result.error);
                Alert.alert('Error', result.error || 'Logout failed');
              }
            } catch (error: any) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', error.message || 'Logout failed');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={isConnected ? ['#6366f1', '#8b5cf6'] : ['#6b7280', '#9ca3af']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              {isConnected ? '🟢 Connected' : '🔴 Offline'} • v{appVersion}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSyncNow}
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Language Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred language</Text>

          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                currentLanguage === 'en' && styles.languageOptionSelected
              ]}
              onPress={() => handleLanguageChange()}
            >
              <Text style={styles.languageFlag}>🇺🇸</Text>
              <Text style={[
                styles.languageText,
                currentLanguage === 'en' && styles.languageTextSelected
              ]}>
                English
              </Text>
              {currentLanguage === 'en' && (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                currentLanguage === 'es' && styles.languageOptionSelected
              ]}
              onPress={() => handleLanguageChange()}
            >
              <Text style={styles.languageFlag}>🇪🇸</Text>
              <Text style={[
                styles.languageText,
                currentLanguage === 'es' && styles.languageTextSelected
              ]}>
                Spanish
              </Text>
              {currentLanguage === 'es' && (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Language Selection */}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => Alert.alert('Coming Soon', 'Language selection will be available in a future update')}
          >
            <Text style={styles.languageButtonText}>🌐 Language / Idioma</Text>
          </TouchableOpacity>
        </Card>

        {/* Theme Selection */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <Text style={styles.sectionSubtitle}>Customize your experience</Text>
          </View>

          <View style={styles.themeContainer}>
            {themeOptions.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  selectedTheme === theme.id && styles.themeOptionSelected
                ]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <LinearGradient
                  colors={theme.colors as [string, string]}
                  style={styles.themePreview}
                >
                  <View style={styles.themePreviewContent}>
                    <View style={styles.themePreviewHeader} />
                    <View style={styles.themePreviewBody} />
                  </View>
                </LinearGradient>
                <Text style={[
                  styles.themeText,
                  selectedTheme === theme.id && styles.themeTextSelected
                ]}>
                  {theme.name}
                </Text>
                {selectedTheme === theme.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors[0]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive app notifications"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
              />
            }
          />
          <SettingItem
            icon="time"
            title="Reminders"
            subtitle="Configure notification schedules"
            onPress={() => Alert.alert('Reminders', 'Reminder configuration')}
          />
          <SettingItem
            icon="volume-high"
            title="Sounds"
            subtitle="Configure notification sounds"
            onPress={() => Alert.alert('Sounds', 'Sound configuration')}
          />
        </Card>

        {/* Devices */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Devices</Text>
          <SettingItem
            icon="phone-portrait"
            title="Device Ring"
            subtitle="Ring all family devices"
            rightComponent={
              <Switch
                value={deviceRingEnabled}
                onValueChange={handleDeviceRingToggle}
                trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
                thumbColor={deviceRingEnabled ? '#ffffff' : '#ffffff'}
              />
            }
          />
          <SettingItem
            icon="bluetooth"
            title="Connected Devices"
            subtitle="Manage linked devices"
            onPress={() => Alert.alert('Devices', 'Connected devices list')}
          />
          <SettingItem
            icon="location"
            title="Family Location"
            subtitle="Share location between family members"
            onPress={() => Alert.alert('Location', 'Location configuration')}
          />
        </Card>

        {/* Appearance */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch between light and dark theme"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
                thumbColor={darkModeEnabled ? '#ffffff' : '#ffffff'}
              />
            }
          />
          <SettingItem
            icon="color-palette"
            title="Colors"
            subtitle="Customize app colors"
            onPress={() => Alert.alert('Colors', 'Color customization')}
          />
          <SettingItem
            icon="text"
            title="Text Size"
            subtitle="Adjust font size"
            onPress={() => Alert.alert('Text', 'Text size configuration')}
          />
        </Card>

        {/* Account */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="person"
            title="Profile"
            subtitle="Edit personal information"
            onPress={() => Alert.alert('Profile', 'Edit profile')}
          />
          <SettingItem
            icon="people"
            title="Family"
            subtitle="Manage family members"
            onPress={() => Alert.alert('Family', 'Family configuration')}
          />
          <SettingItem
            icon="shield"
            title="Privacy"
            subtitle="Configure privacy and security"
            onPress={() => Alert.alert('Privacy', 'Privacy configuration')}
          />
        </Card>

        {/* Support */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="help-circle"
            title="Help"
            subtitle="Help center and FAQ"
            onPress={() => Alert.alert('Help', 'Help center')}
          />
          <SettingItem
            icon="mail"
            title="Contact"
            subtitle="Send feedback or report issues"
            onPress={() => Alert.alert('Contact', 'Send message')}
          />
          <SettingItem
            icon="information-circle"
            title="About"
            subtitle="Application information"
            onPress={() => Alert.alert('About', 'FamilyDash v1.0')}
          />
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FamilyDash v1.0</Text>
          <Text style={styles.footerSubtext}>Keeping families connected</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: '#e0e7ff',
    borderColor: theme.colors.primary,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  languageTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  languageButton: {
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutSection: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  // Enhanced features styles
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  themeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f0f9ff',
  },
  themePreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  themePreviewContent: {
    flex: 1,
    padding: 4,
  },
  themePreviewHeader: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  themePreviewBody: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  themeTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default SettingsScreen;

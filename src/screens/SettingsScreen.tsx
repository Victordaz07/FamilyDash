import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';
import { useTranslation, Language } from '../locales/i18n';
import i18n from '../locales/i18n';
import { useAuth } from '../contexts/AuthContext';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, language, changeLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deviceRingEnabled, setDeviceRingEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'Notifications',
      `Notifications ${notificationsEnabled ? 'disabled' : 'enabled'}`
    );
  };

  const handleDeviceRingToggle = () => {
    setDeviceRingEnabled(!deviceRingEnabled);
    Alert.alert(
      'Device Ring',
      `Device ring ${deviceRingEnabled ? 'disabled' : 'enabled'}`
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
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

  const handleLanguageChange = async (newLanguage: Language) => {
    await changeLanguage(newLanguage);
    Alert.alert(
      t('settings.language'),
      `${t('settings.languageDescription')} - ${newLanguage === 'en' ? t('settings.english') : t('settings.spanish')}`
    );
  };


  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    Alert.alert(
      'Dark Mode',
      `Dark mode ${darkModeEnabled ? 'disabled' : 'enabled'}`
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Language Selection */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <Text style={styles.sectionSubtitle}>{t('settings.languageDescription')}</Text>

        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && styles.languageOptionSelected
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={styles.languageFlag}>🇺🇸</Text>
            <Text style={[
              styles.languageText,
              language === 'en' && styles.languageTextSelected
            ]}>
              {t('settings.english')}
            </Text>
            {language === 'en' && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'es' && styles.languageOptionSelected
            ]}
            onPress={() => handleLanguageChange('es')}
          >
            <Text style={styles.languageFlag}>🇪🇸</Text>
            <Text style={[
              styles.languageText,
              language === 'es' && styles.languageTextSelected
            ]}>
              {t('settings.spanish')}
            </Text>
            {language === 'es' && (
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

      {/* Notifications */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
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
          icon="shield-checkmark"
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
});

export default SettingsScreen;

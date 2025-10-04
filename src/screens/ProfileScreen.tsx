import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Avatar } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';
import { useTranslation } from '../locales/i18n';
import { useProfileStore } from '../modules/profile/store/profileStore';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentUser, familyHouse } = useProfileStore();

  // Create user profile from store data or empty state
  const user = {
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '👤',
    points: currentUser?.points || 0,
    streak: currentUser?.streak || 0,
    level: currentUser?.level || 'New User',
    joinDate: currentUser?.joinedAt ? 
      currentUser.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  };

  const handleEditProfile = () => {
    navigation.navigate('EditableProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleFamilyMembers = () => {
    navigation.navigate('HomeManagement');
  };

  const handleJoinHouse = () => {
    navigation.navigate('JoinHouse');
  };

  const handleAchievements = () => {
    Alert.alert('Achievements', 'Coming soon - Achievements screen');
  };

  const handleRecentActivity = () => {
    Alert.alert('Recent Activity', 'Coming soon - Recent Activity screen');
  };

  const handleStatistics = () => {
    Alert.alert('Statistics', 'Coming soon - Statistics screen');
  };

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: string | number;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileLeft}>
        <View style={styles.profileIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.profileContent}>
          <Text style={styles.profileTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.profileRight}>
        {badge && (
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </View>
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <Ionicons name="settings" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <Avatar
            source={{ uri: user.avatar }}
            size={80}
            name={user.name}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>
          </View>
        </View>
        <Button
          title="Edit Profile"
          onPress={handleEditProfile}
          variant="outline"
          style={styles.editButton}
        />
        
        {/* Empty State - Connection Options */}
        {!currentUser && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to FamilyDash!</Text>
            <Text style={styles.emptySubtitle}>Connect with other apps to get started</Text>
            <View style={styles.connectionButtons}>
              <Button
                title="📱 Connect Phone Contacts"
                onPress={() => Alert.alert('Coming Soon', 'Connect with your phone contacts')}
                variant="primary"
                style={styles.connectionButton}
              />
              <Button
                title="📧 Connect Email Apps"
                onPress={() => Alert.alert('Coming Soon', 'Connect with Gmail, Outlook')}
                variant="primary"
                style={styles.connectionButton}
              />
              <Button
                title="☁️ Connect Cloud Storage"
                onPress={() => Alert.alert('Coming Soon', 'Connect with Google Drive, iCloud')}
                variant="primary"
                style={styles.connectionButton}
              />
            </View>
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ProfileItem
          icon="people"
          title="Family Members"
          subtitle="Manage family members"
          onPress={handleFamilyMembers}
          badge="4"
        />
        <ProfileItem
          icon="home"
          title="Join/Create House"
          subtitle="Join with invitation code or create new house"
          onPress={handleJoinHouse}
        />
        <ProfileItem
          icon="trophy"
          title="Achievements"
          subtitle="View medals and achievements"
          onPress={handleAchievements}
          badge="12"
        />
        <ProfileItem
          icon="calendar"
          title="Recent Activity"
          subtitle="View activity history"
          onPress={handleRecentActivity}
        />
        <ProfileItem
          icon="stats-chart"
          title="Statistics"
          subtitle="View progress and metrics"
          onPress={handleStatistics}
        />
      </Card>

      {/* Family Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Family Information</Text>
        <ProfileItem
          icon="home"
          title="Main Home"
          subtitle="Family house"
          onPress={() => Alert.alert('Home', 'Home information')}
        />
        <ProfileItem
          icon="location"
          title="Saved Locations"
          subtitle="Frequent places"
          onPress={() => Alert.alert('Locations', 'Saved places')}
        />
        <ProfileItem
          icon="time"
          title="Family Schedules"
          subtitle="Routines and schedules"
          onPress={() => Alert.alert('Schedules', 'Family routines')}
        />
      </Card>

      {/* App Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <ProfileItem
          icon="information-circle"
          title="Version"
          subtitle="FamilyDash v1.0"
          onPress={() => Alert.alert('Version', 'FamilyDash v1.0')}
        />
        <ProfileItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Help center"
          onPress={() => Alert.alert('Help', 'Help center')}
        />
        <ProfileItem
          icon="document-text"
          title="Terms & Privacy"
          subtitle="App policies"
          onPress={() => Alert.alert('Terms', 'Privacy policies')}
        />
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Member since {user.joinDate}</Text>
        <Text style={styles.footerSubtext}>FamilyDash - Connecting families</Text>
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
  settingsButton: {
    padding: 8,
  },
  userCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  editButton: {
    marginTop: 8,
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
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  profileBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  
  // New Empty State Styles
  emptyState: {
    marginTop: 20,
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  connectionButtons: {
    gap: 12,
  },
  connectionButton: {
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
});

export default ProfileScreen;

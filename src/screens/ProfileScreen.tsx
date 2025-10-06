import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Avatar } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';
import { useProfileStore } from '../modules/profile/store/profileStore';
import { useTasksStore } from '../modules/tasks/store/tasksStore';
import { useGoalsStore } from '../modules/goals/store/goalsStore';
import { usePenaltiesStore } from '../modules/penalties/store/penaltiesStore';
import { RealAuthService } from '../services/auth/RealAuthService';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // Real data connections
  const { currentUser, familyHouse, updateProfile } = useProfileStore();
  const { tasks } = useTasksStore();
  const { goals } = useGoalsStore();
  const { penalties } = usePenaltiesStore();

  // Enhanced state management
  const [isOnline, setIsOnline] = useState(true);
  const [lastActive, setLastActive] = useState(new Date());
  const [achievements, setAchievements] = useState([
    { id: 'first_task', title: 'First Task', description: 'Complete your first task', icon: 'checkmark-circle', earned: true },
    { id: 'family_leader', title: 'Family Leader', description: 'Lead 10 family activities', icon: 'trophy', earned: false },
    { id: 'goal_master', title: 'Goal Master', description: 'Complete 5 goals', icon: 'star', earned: false },
    { id: 'safe_guardian', title: 'Safe Guardian', description: 'Use Safe Room 3 times', icon: 'shield', earned: false },
  ]);

  // Calculate user statistics
  const userStats = {
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(task => task.status === 'completed').length || 0,
    activeGoals: goals?.filter(goal => goal.status === 'active').length || 0,
    completedGoals: goals?.filter(goal => goal.status === 'completed').length || 0,
    currentStreak: 0,
    totalPoints: 0,
    level: calculateLevel(0),
  };

  function calculateLevel(points: number): string {
    if (points < 100) return 'Newcomer';
    if (points < 500) return 'Explorer';
    if (points < 1000) return 'Achiever';
    if (points < 2000) return 'Expert';
    return 'Master';
  }

  // Enhanced navigation handlers
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
    Alert.alert('Achievements', `You have ${achievements.filter(a => a.earned).length} achievements unlocked!`);
  };

  const handleRecentActivity = () => {
    Alert.alert('Recent Activity', `Last active: ${lastActive.toLocaleString()}`);
  };

  const handleStatistics = () => {
    Alert.alert('Statistics',
      `Tasks: ${userStats.completedTasks}/${userStats.totalTasks}\n` +
      `Goals: ${userStats.completedGoals}/${userStats.activeGoals}\n` +
      `Streak: ${userStats.currentStreak} days\n` +
      `Level: ${userStats.level}`
    );
  };

  // Real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastActive(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#ec4899']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettings}
          >
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.profileImageContainer}>
            <Avatar
              source={{ uri: currentUser?.profileImage || currentUser?.avatar || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
              size={80}
              name={currentUser?.name || 'User'}
            />
            <View style={[styles.onlineStatus, { backgroundColor: isOnline ? '#10B981' : '#6B7280' }]}>
              <Text style={styles.onlineStatusText}>{isOnline ? '🟢' : '🔴'}</Text>
            </View>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{currentUser?.name || 'Family Member'}</Text>
            <Text style={styles.userEmail}>{currentUser?.email || 'user@family.com'}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>{userStats.level}</Text>
              <Text style={styles.pointsText}>{userStats.totalPoints} points</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.completedTasks}</Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.completedGoals}</Text>
                <Text style={styles.statLabel}>Goals</Text>
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
      </Card>

      {/* Achievements Section */}
      <Card style={styles.achievementsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionSubtitle}>{achievements.filter(a => a.earned).length}/{achievements.length} unlocked</Text>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[styles.achievementItem, !achievement.earned && styles.achievementItemLocked]}
              onPress={() => Alert.alert(achievement.title, achievement.description)}
            >
              <View style={[styles.achievementIcon, !achievement.earned && styles.achievementIconLocked]}>
                <Ionicons
                  name={achievement.icon as any}
                  size={24}
                  color={achievement.earned ? '#F59E0B' : '#9CA3AF'}
                />
              </View>
              <Text style={[styles.achievementTitle, !achievement.earned && styles.achievementTitleLocked]}>
                {achievement.title}
              </Text>
              {achievement.earned && (
                <View style={styles.achievementBadge}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Card>

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

      {/* Enhanced Quick Actions */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Tap to explore</Text>
        </View>
        <ProfileItem
          icon="people"
          title="Family Members"
          subtitle={`${familyHouse?.members?.length || 0} members in your family`}
          onPress={handleFamilyMembers}
          badge={familyHouse?.members?.length || 0}
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
          subtitle={`${achievements.filter(a => a.earned).length} achievements unlocked`}
          onPress={handleAchievements}
          badge={achievements.filter(a => a.earned).length}
        />
        <ProfileItem
          icon="calendar"
          title="Recent Activity"
          subtitle={`Last active: ${lastActive.toLocaleTimeString()}`}
          onPress={handleRecentActivity}
        />
        <ProfileItem
          icon="stats-chart"
          title="Statistics"
          subtitle={`${userStats.completedTasks} tasks completed`}
          onPress={handleStatistics}
          badge={userStats.completedTasks}
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
        <Text style={styles.footerText}>Member since {currentUser?.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString() : 'Recently'}</Text>
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
  // New styles for enhanced features
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileImageContainer: {
    position: 'relative',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineStatusText: {
    fontSize: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  achievementsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 0,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  achievementItem: {
    width: '48%',
    margin: '1%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementItemLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIconLocked: {
    backgroundColor: '#F3F4F6',
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: theme.colors.textSecondary,
  },
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;

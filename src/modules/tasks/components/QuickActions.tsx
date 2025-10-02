import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/simpleTheme';

interface QuickActionsProps {
  onAddTask: () => void;
  onAddPhotoTask: () => void;
  onAddVideoInstructions: () => void;
  onAddReward: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddTask,
  onAddPhotoTask,
  onAddVideoInstructions,
  onAddReward,
}) => {
  const actions = [
    {
      id: 'add-task',
      title: 'Add New Task',
      icon: 'add',
      colors: [theme.colors.success, '#059669'],
      onPress: onAddTask,
    },
    {
      id: 'photo-task',
      title: 'Add Photo Task',
      icon: 'camera',
      colors: [theme.colors.primary, '#3730A3'],
      onPress: onAddPhotoTask,
    },
    {
      id: 'video-instructions',
      title: 'Video Instructions',
      icon: 'videocam',
      colors: ['#8B5CF6', '#7C3AED'],
      onPress: onAddVideoInstructions,
    },
    {
      id: 'add-reward',
      title: 'Add Reward',
      icon: 'star',
      colors: [theme.colors.warning, '#D97706'],
      onPress: onAddReward,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <LinearGradient
              colors={action.colors}
              style={styles.actionGradient}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={action.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.semibold,
    color: 'white',
    textAlign: 'center',
  },
});

export default QuickActions;

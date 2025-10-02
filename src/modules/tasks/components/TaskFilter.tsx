import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FamilyMember } from '../types/taskTypes';
import { theme } from '../../../styles/simpleTheme';

interface TaskFilterProps {
  members: FamilyMember[];
  selectedMemberId?: string;
  onMemberSelect: (memberId: string | undefined) => void;
  taskCounts: { [key: string]: number };
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  members,
  selectedMemberId,
  onMemberSelect,
  taskCounts,
}) => {
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter by Member</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.memberCard,
            !selectedMemberId && styles.memberCardSelected
          ]}
          onPress={() => onMemberSelect(undefined)}
        >
          <Text style={styles.allTasksText}>All Tasks</Text>
          <Text style={styles.allTasksCount}>({totalTasks})</Text>
        </TouchableOpacity>

        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={[
              styles.memberCard,
              selectedMemberId === member.id && styles.memberCardSelected
            ]}
            onPress={() => onMemberSelect(member.id)}
          >
            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
            <Text style={[
              styles.memberName,
              selectedMemberId === member.id && styles.memberNameSelected
            ]}>
              {member.name}
            </Text>
            <Text style={[
              styles.taskCount,
              selectedMemberId === member.id && styles.taskCountSelected
            ]}>
              {taskCounts[member.id] || 0} task{(taskCounts[member.id] || 0) !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  memberCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: theme.colors.background,
    minWidth: 80,
  },
  memberCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  memberNameSelected: {
    color: theme.colors.primary,
  },
  taskCount: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  taskCountSelected: {
    color: theme.colors.primary,
  },
  allTasksText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  allTasksCount: {
    fontSize: 12,
    color: theme.colors.gray,
  },
});

export default TaskFilter;

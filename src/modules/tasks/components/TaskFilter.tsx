import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FamilyMember } from '@/types/taskTypes';
import { theme } from '@/styles/simpleTheme';

interface TaskFilterProps {
  members: FamilyMember[];
  selectedMemberId?: string;
  onMemberSelect: (memberId: string) => void;
  taskCounts: { [key: string]: number };
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  members,
  selectedMemberId,
  onMemberSelect,
  taskCounts,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
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
});

export default TaskFilter;





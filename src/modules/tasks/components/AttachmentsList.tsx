import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskAttachment } from '@/types/taskTypes';
import { theme } from '@/styles/simpleTheme';

interface AttachmentsListProps {
  attachments: TaskAttachment[];
  onAttachmentPress?: (attachment: TaskAttachment) => void;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  onAttachmentPress,
}) => {
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'image': return 'image';
      case 'doc': return 'document-text';
      default: return 'attach';
    }
  };

  const getAttachmentColor = (type: string) => {
    switch (type) {
      case 'video': return theme.colors.primary;
      case 'image': return theme.colors.success;
      case 'doc': return theme.colors.warning;
      default: return theme.colors.gray;
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="attach" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Attachments</Text>
      </View>
      
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment, index) => {
          const icon = getAttachmentIcon(attachment.type);
          const color = getAttachmentColor(attachment.type);
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.attachmentCard, { borderLeftColor: color }]}
              onPress={() => onAttachmentPress?.(attachment)}
            >
              <View style={[styles.attachmentIcon, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={16} color="white" />
              </View>
              
              <View style={styles.attachmentContent}>
                <Text style={styles.attachmentTitle}>{attachment.title}</Text>
                {attachment.duration && (
                  <Text style={styles.attachmentDuration}>
                    Duration: {attachment.duration}
                  </Text>
                )}
                <Text style={styles.attachmentType}>
                  {attachment.type.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.attachmentAction}>
                {attachment.type === 'video' ? (
                  <Ionicons name="play" size={20} color={color} />
                ) : (
                  <Ionicons name="eye" size={20} color={color} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  attachmentsContainer: {
    gap: 12,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 12,
  },
  attachmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentContent: {
    flex: 1,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  attachmentDuration: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 2,
  },
  attachmentType: {
    fontSize: 10,
    color: theme.colors.gray,
    fontWeight: theme.typography.fontWeight.medium,
  },
  attachmentAction: {
    padding: 8,
  },
});

export default AttachmentsList;

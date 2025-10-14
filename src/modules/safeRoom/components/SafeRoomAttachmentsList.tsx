import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeRoomAttachment } from '@/types/safeRoomTypes';
import { useThemeColors, useThemeFonts } from '@/contexts/ThemeContext';

interface SafeRoomAttachmentsListProps {
  attachments: SafeRoomAttachment[];
  onAttachmentPress?: (attachment: SafeRoomAttachment) => void;
  compact?: boolean;
}

const SafeRoomAttachmentsList: React.FC<SafeRoomAttachmentsListProps> = ({
  attachments,
  onAttachmentPress,
  compact = false,
}) => {
  const colors = useThemeColors();
  const fonts = useThemeFonts();

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'image': return 'image';
      case 'audio': return 'musical-notes';
      case 'voice': return 'mic';
      default: return 'attach';
    }
  };

  const getAttachmentColor = (type: string) => {
    switch (type) {
      case 'video': return '#FF6B9D'; // SafeRoom pink
      case 'image': return '#10B981';
      case 'audio': return '#8B5CF6';
      case 'voice': return '#F59E0B';
      default: return colors.textSecondary;
    }
  };

  const getAttachmentBackgroundColor = (type: string) => {
    switch (type) {
      case 'video': return 'rgba(255, 107, 157, 0.1)';
      case 'image': return 'rgba(16, 185, 129, 0.1)';
      case 'audio': return 'rgba(139, 92, 246, 0.1)';
      case 'voice': return 'rgba(245, 158, 11, 0.1)';
      default: return colors.background;
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="attach" size={20} color="#FF6B9D" />
        <Text style={[styles.title, { color: colors.text, fontSize: fonts.h4 }]}>
          Media Shared ({attachments.length})
        </Text>
      </View>
      
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment, index) => {
          const icon = getAttachmentIcon(attachment.type);
          const color = getAttachmentColor(attachment.type);
          const backgroundColor = getAttachmentBackgroundColor(attachment.type);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.attachmentCard, 
                { 
                  borderLeftColor: color,
                  backgroundColor: compact ? backgroundColor : colors.surface
                }
              ]}
              onPress={() => onAttachmentPress?.(attachment)}
              activeOpacity={0.8}
            >
              <View style={[styles.attachmentIcon, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={16} color="white" />
              </View>
              
              <View style={styles.attachmentContent}>
                <Text style={[styles.attachmentTitle, { color: colors.text, fontSize: fonts.body }]}>
                  {attachment.title}
                </Text>
                {attachment.duration && (
                  <Text style={[styles.attachmentDuration, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                    Duration: {attachment.duration}
                  </Text>
                )}
                {attachment.metadata?.resolution && (
                  <Text style={[styles.attachmentMetadata, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                    {attachment.metadata.resolution}
                  </Text>
                )}
                <Text style={[styles.attachmentType, { color: color, fontSize: fonts.caption }]}>
                  {attachment.type.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.attachmentAction}>
                {attachment.type === 'video' ? (
                  <Ionicons name="play" size={20} color={color} />
                ) : attachment.type === 'image' ? (
                  <Ionicons name="eye" size={20} color={color} />
                ) : attachment.type === 'voice' || attachment.type === 'audio' ? (
                  <Ionicons name="play" size={20} color={color} />
                ) : (
                  <Ionicons name="download" size={20} color={color} />
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
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
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
    fontWeight: '600',
  },
  attachmentsContainer: {
    gap: 12,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
    fontWeight: '500',
    marginBottom: 2,
  },
  attachmentDuration: {
    marginBottom: 2,
  },
  attachmentMetadata: {
    marginBottom: 2,
  },
  attachmentType: {
    fontWeight: '600',
  },
  attachmentAction: {
    padding: 8,
  },
});

export default SafeRoomAttachmentsList;

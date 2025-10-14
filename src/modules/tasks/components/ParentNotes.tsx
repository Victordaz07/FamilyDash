import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TaskNote } from '@/types/taskTypes';
import { theme } from '@/styles/simpleTheme';

interface ParentNotesProps {
  notes: TaskNote[];
  memberAvatars: { [key: string]: string };
}

const ParentNotes: React.FC<ParentNotesProps> = ({
  notes,
  memberAvatars,
}) => {
  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  if (notes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Parent Notes</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.notesContainer}>
          {notes.map((note, index) => (
            <View key={index} style={styles.noteCard}>
              <LinearGradient
                colors={['#FDF2F8', '#FCE7F3']}
                style={styles.noteGradient}
              >
                <View style={styles.noteHeader}>
                  <Image 
                    source={{ uri: memberAvatars[note.author.toLowerCase()] || 'https://i.pravatar.cc/150?img=1' }} 
                    style={styles.noteAvatar} 
                  />
                  <View style={styles.noteInfo}>
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                    <Text style={styles.noteTime}>{formatTimeAgo(note.createdAt)}</Text>
                  </View>
                </View>
                
                <Text style={styles.noteText}>{note.text}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>
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
  notesContainer: {
    gap: 12,
  },
  noteCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  noteGradient: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  noteAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  noteInfo: {
    flex: 1,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  noteTime: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default ParentNotes;





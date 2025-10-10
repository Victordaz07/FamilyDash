/**
 * Debug component to show voice notes status
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VoiceNote } from '../../services/voice.service';

interface VoiceNotesDebugProps {
  voiceNotes: VoiceNote[];
  familyId: string;
  context: string;
  parentId: string;
}

export default function VoiceNotesDebug({ 
  voiceNotes, 
  familyId, 
  context, 
  parentId 
}: VoiceNotesDebugProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Voice Notes Debug</Text>
      
      <Text style={styles.info}>
        Family ID: {familyId}
      </Text>
      <Text style={styles.info}>
        Context: {context}
      </Text>
      <Text style={styles.info}>
        Parent ID: {parentId}
      </Text>
      
      <Text style={styles.count}>
        Total Notes: {voiceNotes.length}
      </Text>
      
      <ScrollView style={styles.notesList} nestedScrollEnabled={true}>
        {voiceNotes.map((note, index) => (
          <View key={note.id || index} style={styles.noteCard}>
            <Text style={styles.noteId}>ID: {note.id}</Text>
            <Text style={styles.noteUrl}>URL: {note.url}</Text>
            <Text style={styles.noteDuration}>Duration: {note.durationMs}ms</Text>
            <Text style={styles.noteCreated}>
              Created: {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}
            </Text>
          </View>
        ))}
        
        {voiceNotes.length === 0 && (
          <Text style={styles.noNotes}>No voice notes found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginVertical: 8,
  },
  notesList: {
    maxHeight: 200,
    nestedScrollEnabled: true,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noteId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  noteUrl: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  noteDuration: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 2,
  },
  noteCreated: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  noNotes: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

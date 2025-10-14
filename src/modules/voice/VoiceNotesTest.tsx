/**
 * Test component to manually test voice notes listener
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { listenVoiceNotes, VoiceNote } from '@/services/voice.service';

export default function VoiceNotesTest() {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const startListening = () => {
    console.log('🧪 Starting voice notes test listener...');
    
    const familyId = 'default-family';
    const context = 'safe';
    const parentId = 'safe-room';
    
    const unsubscribeFn = listenVoiceNotes(familyId, context, parentId, (notes) => {
      console.log('🧪 Test listener received notes:', notes);
      setVoiceNotes(notes);
    });
    
    setUnsubscribe(unsubscribeFn);
    setIsListening(true);
    console.log('🧪 Test listener started');
  };

  const stopListening = () => {
    if (unsubscribe) {
      console.log('🧪 Stopping voice notes test listener...');
      unsubscribe();
      setUnsubscribe(null);
      setIsListening(false);
      console.log('🧪 Test listener stopped');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Voice Notes Test</Text>
      
      <View style={styles.controls}>
        {!isListening ? (
          <TouchableOpacity style={styles.button} onPress={startListening}>
            <Text style={styles.buttonText}>Start Listening</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopListening}>
            <Text style={styles.buttonText}>Stop Listening</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.status}>
        Status: {isListening ? 'Listening' : 'Not Listening'}
      </Text>
      
      <Text style={styles.count}>
        Notes Found: {voiceNotes.length}
      </Text>
      
      <ScrollView style={styles.notesScrollView} nestedScrollEnabled={true}>
        {voiceNotes.map((note, index) => (
          <View key={note.id || index} style={styles.noteCard}>
            <Text style={styles.noteId}>ID: {note.id}</Text>
            <Text style={styles.noteDuration}>Duration: {note.durationMs}ms</Text>
            <Text style={styles.noteCreated}>
              Created: {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007bff',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#28a745',
  },
  notesScrollView: {
    maxHeight: 200,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  noteId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  noteDuration: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 2,
  },
  noteCreated: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
});





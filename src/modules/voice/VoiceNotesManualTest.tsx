/**
 * Manual test to debug Firestore query issues
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function VoiceNotesManualTest() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startManualListener = () => {
    console.log('🧪 Starting manual Firestore listener...');
    
    try {
      const q = query(
        collection(db, "voice_notes"),
        where("familyId", "==", "default-family"),
        where("context", "==", "safe"),
        where("parentId", "==", "safe-room"),
        orderBy("createdAt", "desc")
      );

      console.log('🧪 Query created:', q);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('🧪 Manual listener received snapshot:', snapshot.docs.length, 'documents');
        
        const docs = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('🧪 Document:', doc.id, data);
          return { id: doc.id, ...data };
        });
        
        setNotes(docs);
        setError(null);
      }, (err) => {
        console.error('🧪 Manual listener error:', err);
        setError(err.message);
        Alert.alert('Listener Error', err.message);
      });

      setIsListening(true);
      
      return unsubscribe;
    } catch (error) {
      console.error('🧪 Error creating manual listener:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      Alert.alert('Setup Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const stopManualListener = () => {
    console.log('🧪 Stopping manual listener...');
    setIsListening(false);
    setNotes([]);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Manual Firestore Test</Text>
      
      <View style={styles.controls}>
        {!isListening ? (
          <TouchableOpacity style={styles.button} onPress={startManualListener}>
            <Text style={styles.buttonText}>Start Manual Listener</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopManualListener}>
            <Text style={styles.buttonText}>Stop Manual Listener</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.status}>
        Status: {isListening ? 'Listening' : 'Not Listening'}
      </Text>
      
      {error && (
        <Text style={styles.error}>
          Error: {error}
        </Text>
      )}
      
      <Text style={styles.count}>
        Documents Found: {notes.length}
      </Text>
      
      <ScrollView style={styles.notesScrollView} nestedScrollEnabled={true}>
        {notes.map((note, index) => (
          <View key={note.id || index} style={styles.noteCard}>
            <Text style={styles.noteId}>ID: {note.id}</Text>
            <Text style={styles.noteData}>FamilyId: {note.familyId}</Text>
            <Text style={styles.noteData}>Context: {note.context}</Text>
            <Text style={styles.noteData}>ParentId: {note.parentId}</Text>
            <Text style={styles.noteData}>Duration: {note.durationMs}ms</Text>
            <Text style={styles.noteData}>URL: {note.url ? 'Present' : 'Missing'}</Text>
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
    backgroundColor: '#fff3cd',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#856404',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ffc107',
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
  error: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 4,
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#28a745',
  },
  notesScrollView: {
    maxHeight: 300,
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
  noteData: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  noteCreated: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
  },
});





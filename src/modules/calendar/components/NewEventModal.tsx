import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NewEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventData) => void;
}

interface EventData {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: string;
  participants: string[];
}

const NewEventModal: React.FC<NewEventModalProps> = ({ visible, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<EventData>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'movie',
    participants: []
  });

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const familyMembers = [
    { id: 'mom', name: 'Mom', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
    { id: 'dad', name: 'Dad', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
    { id: 'emma', name: 'Emma', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
    { id: 'jake', name: 'Jake', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' }
  ];

  const eventTypes = [
    { id: 'movie', name: 'Movie Night', icon: 'film', color: '#EC4899' },
    { id: 'birthday', name: 'Birthday Party', icon: 'gift', color: '#8B5CF6' },
    { id: 'doctor', name: 'Doctor Visit', icon: 'medical', color: '#F59E0B' },
    { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#3B82F6' },
    { id: 'reading', name: 'Reading Time', icon: 'book', color: '#F59E0B' },
    { id: 'picnic', name: 'Picnic', icon: 'leaf', color: '#10B981' },
    { id: 'bowling', name: 'Bowling', icon: 'bowling-ball', color: '#3B82F6' },
    { id: 'library', name: 'Library Visit', icon: 'library', color: '#8B5CF6' }
  ];

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    if (!formData.date.trim()) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!formData.time.trim()) {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    const eventData = {
      ...formData,
      participants: selectedParticipants
    };

    onSubmit(eventData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      type: 'movie',
      participants: []
    });
    setSelectedParticipants([]);
    onClose();
  };

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.modalHeader}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Event</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Event Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter event title"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />
            </View>

            {/* Event Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
                {eventTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      { backgroundColor: formData.type === type.id ? type.color : '#F3F4F6' }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type: type.id }))}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={formData.type === type.id ? 'white' : '#6B7280'}
                    />
                    <Text style={[
                      styles.typeOptionText,
                      { color: formData.type === type.id ? 'white' : '#6B7280' }
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Date and Time */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Time *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  value={formData.time}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, time: text }))}
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter location"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter event description"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Participants */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Participants</Text>
              <View style={styles.participantsContainer}>
                {familyMembers.map(member => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.participantItem,
                      selectedParticipants.includes(member.id) && styles.selectedParticipant
                    ]}
                    onPress={() => toggleParticipant(member.id)}
                  >
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantInitial}>
                        {member.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>{member.name}</Text>
                    {selectedParticipants.includes(member.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setFormData(prev => ({ ...prev, date: getCurrentDate() }))}
              >
                <Ionicons name="today" size={16} color="#3B82F6" />
                <Text style={styles.quickActionText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setFormData(prev => ({ ...prev, time: getCurrentTime() }))}
              >
                <Ionicons name="time" size={16} color="#3B82F6" />
                <Text style={styles.quickActionText}>Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setSelectedParticipants(familyMembers.map(m => m.id))}
              >
                <Ionicons name="people" size={16} color="#3B82F6" />
                <Text style={styles.quickActionText}>All Family</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeScrollView: {
    marginTop: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    gap: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  selectedParticipant: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});

export default NewEventModal;

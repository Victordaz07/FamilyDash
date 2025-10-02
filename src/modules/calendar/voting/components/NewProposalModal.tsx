import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FamilyMember } from '../useVoting';

interface NewProposalModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (proposalData: any) => void;
  familyMembers: FamilyMember[];
}

const NewProposalModal: React.FC<NewProposalModalProps> = ({
  visible,
  onClose,
  onSubmit,
  familyMembers
}) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'entertainment',
    options: ['', ''],
    expiresIn: '24' // horas
  });

  const categories = [
    { id: 'entertainment', name: 'Entretenimiento', icon: 'game-controller', color: '#8B5CF6' },
    { id: 'food', name: 'Comida', icon: 'restaurant', color: '#F59E0B' },
    { id: 'activity', name: 'Actividad', icon: 'bicycle', color: '#10B981' },
    { id: 'movie', name: 'Películas', icon: 'film', color: '#EC4899' },
    { id: 'travel', name: 'Viajes', icon: 'airplane', color: '#3B82F6' },
    { id: 'other', name: 'Otros', icon: 'ellipsis-horizontal', color: '#6B7280' }
  ];

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'entertainment',
      options: ['', ''],
      expiresIn: '24'
    });
    onClose();
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      Alert.alert('Error', 'Necesitas al menos 2 opciones');
      return;
    }

    const proposalData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      options: validOptions.map((text, index) => ({
        id: `opt${index + 1}`,
        text: text.trim(),
        votes: 0,
        voters: []
      })),
      createdBy: 'mom', // Por simplicidad
      expiresAt: new Date(Date.now() + parseInt(formData.expiresIn) * 60 * 60 * 1000)
    };

    onSubmit(proposalData);
    handleClose();
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
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
            <Text style={styles.modalTitle}>Nueva Propuesta</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Crear</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título de la propuesta *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="¿Qué película vemos esta noche?"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe la propuesta..."
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.category === category.id && styles.selectedCategory,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={formData.category === category.id ? '#ffffff' : category.color}
                    />
                    <Text style={[
                      styles.categoryText,
                      formData.category === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Options */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Opciones de votación *</Text>
              {formData.options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <TextInput
                    style={[styles.textInput, styles.optionInput]}
                    placeholder={`Opción ${index + 1}`}
                    value={option}
                    onChangeText={(text) => updateOption(index, text)}
                  />
                  {formData.options.length > 2 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeOption(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {formData.options.length < 6 && (
                <TouchableOpacity style={styles.addButton} onPress={addOption}>
                  <Ionicons name="add-circle" size={20} color="#3B82F6" />
                  <Text style={styles.addButtonText}>Añadir opción</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Expiration */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tiempo de votación</Text>
              <View style={styles.expirationContainer}>
                <TextInput
                  style={[styles.textInput, styles.expirationInput]}
                  placeholder="24"
                  value={formData.expiresIn}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, expiresIn: text }))}
                  keyboardType="numeric"
                />
                <Text style={styles.expirationLabel}>horas</Text>
              </View>
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
  categoryScroll: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    gap: 8,
  },
  selectedCategory: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionInput: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expirationInput: {
    width: 80,
    textAlign: 'center',
  },
  expirationLabel: {
    fontSize: 16,
    color: '#374151',
  },
});

export default NewProposalModal;

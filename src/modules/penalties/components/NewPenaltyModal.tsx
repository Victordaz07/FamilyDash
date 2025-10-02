import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockFamilyMembers, penaltyTypeConfigs, penaltySelectionMethods, penaltyCategories } from '../mock/penaltiesData';
import PenaltyRoulette from './PenaltyRoulette';
import { theme } from '../../../styles/simpleTheme';

interface NewPenaltyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (penaltyData: NewPenaltyData) => void;
}

interface NewPenaltyData {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  reason: string;
  duration: number;
  category: 'behavior' | 'chores' | 'screen_time' | 'homework' | 'other';
  penaltyType: 'yellow' | 'red';
  selectionMethod: 'fixed' | 'random';
  createdBy: string;
}

const NewPenaltyModal: React.FC<NewPenaltyModalProps> = ({ visible, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<NewPenaltyData>({
    memberId: '',
    memberName: '',
    memberAvatar: '',
    reason: '',
    duration: 3,
    category: 'behavior',
    penaltyType: 'yellow',
    selectionMethod: 'fixed',
    createdBy: 'mom',
  });

  const [showRoulette, setShowRoulette] = useState(false);

  const handleSubmit = () => {
    if (!formData.memberId) {
      Alert.alert('Error', 'Por favor selecciona un miembro de la familia');
      return;
    }
    if (!formData.reason.trim()) {
      Alert.alert('Error', 'Por favor ingresa una razón para la penalidad');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const selectMember = (member: any) => {
    setFormData({
      ...formData,
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
    });
  };

  const selectPenaltyType = (type: 'yellow' | 'red') => {
    const config = penaltyTypeConfigs.find(c => c.type === type);
    setFormData({
      ...formData,
      penaltyType: type,
      duration: config?.minDays || 3,
    });
  };

  const selectSelectionMethod = (method: 'fixed' | 'random') => {
    setFormData({
      ...formData,
      selectionMethod: method,
    });

    if (method === 'random') {
      setShowRoulette(true);
    }
  };

  const handleRouletteResult = (duration: number) => {
    setFormData({
      ...formData,
      duration,
    });
    setShowRoulette(false);
  };

  const selectCategory = (category: NewPenaltyData['category']) => {
    setFormData({
      ...formData,
      category,
    });
  };

  const selectDuration = (duration: number) => {
    setFormData({
      ...formData,
      duration,
    });
  };

  const currentTypeConfig = penaltyTypeConfigs.find(c => c.type === formData.penaltyType);
  const currentMethodConfig = penaltySelectionMethods.find(m => m.method === formData.selectionMethod);

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
            {/* Header */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Nueva Penalidad</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Select Member */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Seleccionar Miembro</Text>
                <View style={styles.memberGrid}>
                  {mockFamilyMembers.filter(m => m.role !== 'parent').map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberOption,
                        formData.memberId === member.id && styles.memberSelected
                      ]}
                      onPress={() => selectMember(member)}
                    >
                      <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                      <Text style={styles.memberName}>{member.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Select Penalty Type */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Tipo de Penalidad</Text>
                <View style={styles.typeGrid}>
                  {penaltyTypeConfigs.map((config) => (
                    <TouchableOpacity
                      key={config.type}
                      style={[
                        styles.typeOption,
                        { borderColor: config.color },
                        formData.penaltyType === config.type && { 
                          backgroundColor: config.color,
                          borderColor: config.color 
                        }
                      ]}
                      onPress={() => selectPenaltyType(config.type)}
                    >
                      <View style={[styles.typeIconContainer, { backgroundColor: config.color + '20' }]}>
                        <Ionicons 
                          name={config.icon as any} 
                          size={28} 
                          color={config.color} 
                        />
                      </View>
                      <Text style={[
                        styles.typeText,
                        { color: formData.penaltyType === config.type ? 'white' : config.color }
                      ]}>
                        {config.name}
                      </Text>
                      <Text style={[
                        styles.typeSubtext,
                        { color: formData.penaltyType === config.type ? 'white' : config.color }
                      ]}>
                        {config.minDays}-{config.maxDays} días
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Select Selection Method */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎲 Método de Selección</Text>
                <View style={styles.methodGrid}>
                  {penaltySelectionMethods.map((method) => (
                    <TouchableOpacity
                      key={method.method}
                      style={[
                        styles.methodOption,
                        formData.selectionMethod === method.method && styles.methodSelected
                      ]}
                      onPress={() => selectSelectionMethod(method.method)}
                    >
                      <View style={[
                        styles.methodIconContainer,
                        formData.selectionMethod === method.method && styles.methodIconSelected
                      ]}>
                        <Ionicons 
                          name={method.icon as any} 
                          size={24} 
                          color={formData.selectionMethod === method.method ? 'white' : theme.colors.primary} 
                        />
                      </View>
                      <Text style={[
                        styles.methodText,
                        { color: formData.selectionMethod === method.method ? 'white' : theme.colors.text }
                      ]}>
                        {method.name}
                      </Text>
                      <Text style={[
                        styles.methodSubtext,
                        { color: formData.selectionMethod === method.method ? 'white' : theme.colors.gray }
                      ]}>
                        {method.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration Selection (only for fixed method) */}
              {formData.selectionMethod === 'fixed' && currentTypeConfig && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⏰ Duración (días)</Text>
                  <View style={styles.durationGrid}>
                    {currentTypeConfig.durationOptions.map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        style={[
                          styles.durationOption,
                          { borderColor: currentTypeConfig.color },
                          formData.duration === duration && { 
                            backgroundColor: currentTypeConfig.color,
                            borderColor: currentTypeConfig.color 
                          }
                        ]}
                        onPress={() => selectDuration(duration)}
                      >
                        <Text style={[
                          styles.durationText,
                          { color: formData.duration === duration ? 'white' : currentTypeConfig.color }
                        ]}>
                          {duration}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Selected Duration Display (for random method) */}
              {formData.selectionMethod === 'random' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎯 Duración Seleccionada</Text>
                  <View style={[
                    styles.selectedDurationCard,
                    { backgroundColor: currentTypeConfig?.color + '20', borderColor: currentTypeConfig?.color }
                  ]}>
                    <Ionicons 
                      name={currentTypeConfig?.icon as any} 
                      size={32} 
                      color={currentTypeConfig?.color} 
                    />
                    <Text style={[styles.selectedDurationText, { color: currentTypeConfig?.color }]}>
                      {formData.duration} días
                    </Text>
                    <Text style={styles.selectedDurationSubtext}>
                      Seleccionado por la ruleta
                    </Text>
                  </View>
                </View>
              )}

              {/* Select Category */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📂 Categoría</Text>
                <View style={styles.categoryGrid}>
                  {penaltyCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        { borderColor: category.color },
                        formData.category === category.id && { 
                          backgroundColor: category.color,
                          borderColor: category.color 
                        }
                      ]}
                      onPress={() => selectCategory(category.id as any)}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={16} 
                        color={formData.category === category.id ? 'white' : category.color} 
                      />
                      <Text style={[
                        styles.categoryText,
                        { color: formData.category === category.id ? 'white' : category.color }
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Reason Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Razón</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: No limpió su habitación"
                  value={formData.reason}
                  onChangeText={(text) => setFormData({ ...formData, reason: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.submitButtonGradient}
                >
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text style={styles.submitButtonText}>Crear Penalidad</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Roulette Modal */}
      {showRoulette && currentTypeConfig && (
        <PenaltyRoulette
          durationOptions={currentTypeConfig.durationOptions}
          penaltyType={formData.penaltyType}
          onResult={handleRouletteResult}
          onClose={() => setShowRoulette(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  memberGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  memberOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    minWidth: 100,
  },
  memberSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  typeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  methodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  methodOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  methodSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  methodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 12,
  },
  methodIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  methodSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  durationOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    minWidth: 70,
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDurationCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: theme.colors.background,
  },
  selectedDurationText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  selectedDurationSubtext: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});

export default NewPenaltyModal;
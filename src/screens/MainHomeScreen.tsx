/**
 * 🏠 MAIN HOME SCREEN — FamilyDash+
 * Gestión de la casa principal de la familia
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';

interface MainHomeScreenProps {
  navigation: any;
}

interface FamilyHome {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MainHomeScreen({ navigation }: MainHomeScreenProps) {
  const { family } = useFamily();
  const { user } = useAuth();
  const [familyHome, setFamilyHome] = useState<FamilyHome | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    description: '',
  });

  useEffect(() => {
    loadFamilyHome();
  }, []);

  const loadFamilyHome = async () => {
    // Simular carga de datos de la casa familiar
    const mockHome: FamilyHome = {
      id: '1',
      name: 'Casa de los Ruiz',
      address: 'Calle Principal 123',
      city: 'Madrid',
      country: 'España',
      coordinates: {
        latitude: 40.4168,
        longitude: -3.7038,
      },
      description: 'Nuestra casa familiar donde compartimos momentos especiales',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };
    setFamilyHome(mockHome);
    setFormData({
      name: mockHome.name,
      address: mockHome.address,
      city: mockHome.city,
      country: mockHome.country,
      description: mockHome.description || '',
    });
  };

  const handleSaveHome = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const updatedHome: FamilyHome = {
        ...familyHome!,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        description: formData.description,
        updatedAt: new Date().toISOString(),
      };

      setFamilyHome(updatedHome);
      setShowEditModal(false);
      setIsEditing(false);
      Alert.alert('Éxito', 'Información de la casa actualizada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información');
    }
  };

  const handleDeleteHome = () => {
    Alert.alert(
      'Eliminar Casa',
      '¿Estás seguro de que quieres eliminar la información de la casa familiar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setFamilyHome(null);
            Alert.alert('Eliminado', 'Información de la casa eliminada');
          },
        },
      ]
    );
  };

  const renderHomeInfo = () => {
    if (!familyHome) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={64} color="#8B5CF6" />
          <Text style={styles.emptyTitle}>No hay casa configurada</Text>
          <Text style={styles.emptySubtitle}>
            Configura la información de tu casa familiar
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Agregar Casa</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.homeCard}>
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.homeHeader}
        >
          <View style={styles.homeHeaderContent}>
            <Ionicons name="home" size={32} color="white" />
            <View style={styles.homeTitleContainer}>
              <Text style={styles.homeTitle}>{familyHome.name}</Text>
              <Text style={styles.homeSubtitle}>Casa Principal</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.homeContent}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#6B7280" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={styles.infoValue}>
                {familyHome.address}, {familyHome.city}, {familyHome.country}
              </Text>
            </View>
          </View>

          {familyHome.description && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color="#6B7280" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Descripción</Text>
                <Text style={styles.infoValue}>{familyHome.description}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#6B7280" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Actualizado</Text>
              <Text style={styles.infoValue}>
                {new Date(familyHome.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.homeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create" size={16} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteHome}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Casa Principal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHomeInfo()}

        <View style={styles.familyMembers}>
          <Text style={styles.sectionTitle}>Miembros de la Familia</Text>
          <View style={styles.membersList}>
            {family?.members?.map((member: any) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {member.name?.charAt(0) || '?'}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
                <View style={styles.memberStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>En casa</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {familyHome ? 'Editar Casa' : 'Agregar Casa'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre de la Casa *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Ej: Casa de los Ruiz"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dirección *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                placeholder="Ej: Calle Principal 123"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ciudad *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
                placeholder="Ej: Madrid"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>País</Text>
              <TextInput
                style={styles.formInput}
                value={formData.country}
                onChangeText={(text) =>
                  setFormData({ ...formData, country: text })
                }
                placeholder="Ej: España"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Descripción de la casa familiar"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveHome}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  homeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  homeHeader: {
    padding: 20,
  },
  homeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeTitleContainer: {
    marginLeft: 16,
    flex: 1,
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  homeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  homeContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  homeActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#8B5CF6',
  },
  deleteButton: {
    borderColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  familyMembers: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  memberRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

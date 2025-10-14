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
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '@/store';
import { useAuth } from '@/store';
import { useFormValidation, COMMON_RULES } from '@/hooks/useFormValidation';
import { useFadeIn, useSlideIn } from '@/hooks/useAnimations';
import EnhancedInput from '@/components/ui/EnhancedInput';
import AnimatedButton from '@/components/ui/AnimatedButton';
import AnimatedCard from '@/components/ui/AnimatedCard';

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

  // Validation rules
  const validationRules = {
    name: COMMON_RULES.name('El nombre de la casa es requerido'),
    address: COMMON_RULES.address('La dirección es requerida'),
    city: COMMON_RULES.name('La ciudad es requerida'),
    country: COMMON_RULES.name('El país es requerido'),
    description: COMMON_RULES.maxLength(200, 'La descripción no puede tener más de 200 caracteres'),
  };

  const { errors, touched, validateForm, setFieldTouched, setFieldError } = useFormValidation(validationRules);

  // Animations
  const fadeAnim = useFadeIn(500);
  const slideAnim = useSlideIn('up', 400);

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
    // Validate form
    if (!validateForm(formData)) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
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
          <View style={styles.emptyIconContainer}>
            <Ionicons name="home-outline" size={80} color="#8B5CF6" />
            <View style={styles.emptyIconGlow} />
          </View>
          <Text style={styles.emptyTitle}>¡Tu hogar te espera! 🏠</Text>
          <Text style={styles.emptySubtitle}>
            Configura la información de tu casa familiar para mantener a todos conectados y organizados
          </Text>
            <AnimatedButton
              title="Crear Hogar Familiar"
              onPress={() => setShowEditModal(true)}
              variant="primary"
              size="large"
              icon="add"
              iconPosition="left"
              gradient
              animationType="scale"
            />
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
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Casa Principal</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={slideAnim.transform}>
          {renderHomeInfo()}
        </Animated.View>

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
            <EnhancedInput
              label="Nombre de la Casa"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              onBlur={() => setFieldTouched('name')}
              placeholder="Ej: Casa de los Ruiz"
              error={errors.name}
              touched={touched.name}
              required
              leftIcon="home"
            />

            <EnhancedInput
              label="Dirección"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              onBlur={() => setFieldTouched('address')}
              placeholder="Ej: Calle Principal 123"
              error={errors.address}
              touched={touched.address}
              required
              leftIcon="location"
            />

            <EnhancedInput
              label="Ciudad"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              onBlur={() => setFieldTouched('city')}
              placeholder="Ej: Madrid"
              error={errors.city}
              touched={touched.city}
              required
              leftIcon="business"
            />

            <EnhancedInput
              label="País"
              value={formData.country}
              onChangeText={(text) => setFormData({ ...formData, country: text })}
              onBlur={() => setFieldTouched('country')}
              placeholder="Ej: España"
              error={errors.country}
              touched={touched.country}
              leftIcon="flag"
            />

            <EnhancedInput
              label="Descripción"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              onBlur={() => setFieldTouched('description')}
              placeholder="Descripción de la casa familiar"
              error={errors.description}
              touched={touched.description}
              multiline
              numberOfLines={3}
              maxLength={200}
              leftIcon="document-text"
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <AnimatedButton
              title="Cancelar"
              onPress={() => setShowEditModal(false)}
              variant="secondary"
              size="medium"
              style={styles.cancelButton}
            />
            <AnimatedButton
              title="Guardar"
              onPress={handleSaveHome}
              variant="primary"
              size="medium"
              icon="checkmark"
              iconPosition="left"
              gradient
              style={styles.saveButton}
            />
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
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
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

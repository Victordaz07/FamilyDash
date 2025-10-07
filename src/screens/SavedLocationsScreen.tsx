/**
 * 📍 SAVED LOCATIONS SCREEN — FamilyDash+
 * Gestión de ubicaciones frecuentes de la familia
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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';

interface SavedLocationsScreenProps {
  navigation: any;
}

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: 'home' | 'work' | 'school' | 'hospital' | 'shopping' | 'other';
  description?: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

const LOCATION_CATEGORIES = [
  { key: 'home', label: 'Casa', icon: 'home', color: '#8B5CF6' },
  { key: 'work', label: 'Trabajo', icon: 'briefcase', color: '#3B82F6' },
  { key: 'school', label: 'Escuela', icon: 'school', color: '#10B981' },
  { key: 'hospital', label: 'Hospital', icon: 'medical', color: '#EF4444' },
  { key: 'shopping', label: 'Compras', icon: 'storefront', color: '#F59E0B' },
  { key: 'other', label: 'Otro', icon: 'location', color: '#6B7280' },
];

export default function SavedLocationsScreen({ navigation }: SavedLocationsScreenProps) {
  const { family } = useFamily();
  const { user } = useAuth();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<SavedLocation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    category: 'other' as SavedLocation['category'],
    description: '',
    isShared: true,
  });

  useEffect(() => {
    loadSavedLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, selectedCategory]);

  const loadSavedLocations = async () => {
    // Simular carga de ubicaciones guardadas
    const mockLocations: SavedLocation[] = [
      {
        id: '1',
        name: 'Casa de los Abuelos',
        address: 'Calle Mayor 45',
        city: 'Barcelona',
        country: 'España',
        coordinates: { latitude: 41.3851, longitude: 2.1734 },
        category: 'home',
        description: 'Casa de los abuelos maternos',
        isShared: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Colegio San José',
        address: 'Avenida de la Paz 12',
        city: 'Madrid',
        country: 'España',
        coordinates: { latitude: 40.4168, longitude: -3.7038 },
        category: 'school',
        description: 'Colegio de los niños',
        isShared: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: '3',
        name: 'Hospital Clínico',
        address: 'Calle Profesor Martín Lagos',
        city: 'Madrid',
        country: 'España',
        coordinates: { latitude: 40.4378, longitude: -3.6795 },
        category: 'hospital',
        description: 'Hospital de referencia familiar',
        isShared: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
      {
        id: '4',
        name: 'Centro Comercial Plaza Norte',
        address: 'Calle de la Gran Vía 100',
        city: 'Madrid',
        country: 'España',
        coordinates: { latitude: 40.4200, longitude: -3.7000 },
        category: 'shopping',
        description: 'Centro comercial para compras familiares',
        isShared: true,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
    ];
    setLocations(mockLocations);
  };

  const filterLocations = () => {
    if (selectedCategory === 'all') {
      setFilteredLocations(locations);
    } else {
      setFilteredLocations(locations.filter(loc => loc.category === selectedCategory));
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      category: 'other',
      description: '',
      isShared: true,
    });
    setShowAddModal(true);
  };

  const handleEditLocation = (location: SavedLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      country: location.country,
      category: location.category,
      description: location.description || '',
      isShared: location.isShared,
    });
    setShowAddModal(true);
  };

  const handleSaveLocation = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (editingLocation) {
        // Actualizar ubicación existente
        const updatedLocation: SavedLocation = {
          ...editingLocation,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          category: formData.category,
          description: formData.description,
          isShared: formData.isShared,
          updatedAt: new Date().toISOString(),
        };

        setLocations(prev => 
          prev.map(loc => loc.id === editingLocation.id ? updatedLocation : loc)
        );
        Alert.alert('Éxito', 'Ubicación actualizada correctamente');
      } else {
        // Crear nueva ubicación
        const newLocation: SavedLocation = {
          id: Date.now().toString(),
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          coordinates: { latitude: 40.4168, longitude: -3.7038 }, // Mock coordinates
          category: formData.category,
          description: formData.description,
          isShared: formData.isShared,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setLocations(prev => [...prev, newLocation]);
        Alert.alert('Éxito', 'Ubicación agregada correctamente');
      }

      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la ubicación');
    }
  };

  const handleDeleteLocation = (location: SavedLocation) => {
    Alert.alert(
      'Eliminar Ubicación',
      `¿Estás seguro de que quieres eliminar "${location.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setLocations(prev => prev.filter(loc => loc.id !== location.id));
            Alert.alert('Eliminado', 'Ubicación eliminada correctamente');
          },
        },
      ]
    );
  };

  const getCategoryInfo = (category: string) => {
    return LOCATION_CATEGORIES.find(cat => cat.key === category) || LOCATION_CATEGORIES[5];
  };

  const renderLocationItem = ({ item }: { item: SavedLocation }) => {
    const categoryInfo = getCategoryInfo(item.category);
    
    return (
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <View style={styles.locationIconContainer}>
            <Ionicons 
              name={categoryInfo.icon as any} 
              size={24} 
              color={categoryInfo.color} 
            />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{item.name}</Text>
            <Text style={styles.locationAddress}>
              {item.address}, {item.city}, {item.country}
            </Text>
            {item.description && (
              <Text style={styles.locationDescription}>{item.description}</Text>
            )}
          </View>
          <View style={styles.locationActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditLocation(item)}
            >
              <Ionicons name="create" size={16} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteLocation(item)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.locationFooter}>
          <View style={styles.categoryTag}>
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.label}
            </Text>
          </View>
          <View style={styles.sharedIndicator}>
            <Ionicons 
              name={item.isShared ? "people" : "person"} 
              size={14} 
              color={item.isShared ? "#10B981" : "#6B7280"} 
            />
            <Text style={[
              styles.sharedText, 
              { color: item.isShared ? "#10B981" : "#6B7280" }
            ]}>
              {item.isShared ? "Compartida" : "Personal"}
            </Text>
          </View>
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
        <Text style={styles.headerTitle}>Ubicaciones Guardadas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddLocation}
        >
          <Ionicons name="add" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        style={styles.categoryFilter}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.activeCategoryButton
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === 'all' && styles.activeCategoryButtonText
          ]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        {LOCATION_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.key ? 'white' : category.color} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.key && styles.activeCategoryButtonText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Locations List */}
      <FlatList
        data={filteredLocations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        style={styles.locationsList}
        contentContainerStyle={styles.locationsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="#8B5CF6" />
            <Text style={styles.emptyTitle}>No hay ubicaciones</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory === 'all' 
                ? 'Agrega ubicaciones frecuentes para tu familia'
                : `No hay ubicaciones de tipo ${getCategoryInfo(selectedCategory).label.toLowerCase()}`
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleAddLocation}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.emptyAddButtonText}>Agregar Ubicación</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingLocation ? 'Editar Ubicación' : 'Agregar Ubicación'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ej: Casa de los Abuelos"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dirección *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Ej: Calle Mayor 45"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ciudad *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Ej: Barcelona"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>País</Text>
              <TextInput
                style={styles.formInput}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                placeholder="Ej: España"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría</Text>
              <View style={styles.categorySelector}>
                {LOCATION_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryOption,
                      formData.category === category.key && styles.selectedCategoryOption
                    ]}
                    onPress={() => setFormData({ ...formData, category: category.key as SavedLocation['category'] })}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={20} 
                      color={formData.category === category.key ? 'white' : category.color} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      formData.category === category.key && styles.selectedCategoryOptionText
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descripción de la ubicación"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.shareToggle}
                onPress={() => setFormData({ ...formData, isShared: !formData.isShared })}
              >
                <View style={styles.shareToggleInfo}>
                  <Ionicons 
                    name={formData.isShared ? "people" : "person"} 
                    size={20} 
                    color="#8B5CF6" 
                  />
                  <View style={styles.shareToggleText}>
                    <Text style={styles.shareToggleTitle}>
                      {formData.isShared ? 'Compartida con la familia' : 'Solo para mí'}
                    </Text>
                    <Text style={styles.shareToggleSubtitle}>
                      {formData.isShared 
                        ? 'Todos los miembros pueden ver esta ubicación'
                        : 'Solo tú puedes ver esta ubicación'
                      }
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  formData.isShared && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    formData.isShared && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveLocation}
            >
              <Text style={styles.saveButtonText}>
                {editingLocation ? 'Actualizar' : 'Guardar'}
              </Text>
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
  addButton: {
    padding: 8,
  },
  categoryFilter: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCategoryButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  activeCategoryButtonText: {
    color: 'white',
  },
  locationsList: {
    flex: 1,
  },
  locationsListContent: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharedText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  headerSpacer: {
    width: 40,
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
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  selectedCategoryOptionText: {
    color: 'white',
  },
  shareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shareToggleText: {
    marginLeft: 12,
    flex: 1,
  },
  shareToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  shareToggleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
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

/**
 * ⏰ FAMILY SCHEDULES SCREEN — FamilyDash+
 * Gestión de rutinas y horarios familiares
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

interface FamilySchedulesScreenProps {
  navigation: any;
}

interface FamilySchedule {
  id: string;
  title: string;
  description?: string;
  type: 'routine' | 'event' | 'reminder' | 'task';
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  time: string;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  date?: string; // For one-time events
  category: 'morning' | 'afternoon' | 'evening' | 'night' | 'work' | 'school' | 'family' | 'personal';
  isShared: boolean;
  assignedTo?: string[]; // Member IDs
  createdAt: string;
  updatedAt: string;
}

const SCHEDULE_TYPES = [
  { key: 'routine', label: 'Rutina', icon: 'repeat', color: '#8B5CF6' },
  { key: 'event', label: 'Evento', icon: 'calendar', color: '#3B82F6' },
  { key: 'reminder', label: 'Recordatorio', icon: 'alarm', color: '#F59E0B' },
  { key: 'task', label: 'Tarea', icon: 'checkmark-circle', color: '#10B981' },
];

const SCHEDULE_CATEGORIES = [
  { key: 'morning', label: 'Mañana', icon: 'sunny', color: '#F59E0B' },
  { key: 'afternoon', label: 'Tarde', icon: 'partly-sunny', color: '#F97316' },
  { key: 'evening', label: 'Noche', icon: 'moon', color: '#6366F1' },
  { key: 'night', label: 'Madrugada', icon: 'moon-outline', color: '#1F2937' },
  { key: 'work', label: 'Trabajo', icon: 'briefcase', color: '#3B82F6' },
  { key: 'school', label: 'Escuela', icon: 'school', color: '#10B981' },
  { key: 'family', label: 'Familia', icon: 'people', color: '#EC4899' },
  { key: 'personal', label: 'Personal', icon: 'person', color: '#6B7280' },
];

const DAYS_OF_WEEK = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function FamilySchedulesScreen({ navigation }: FamilySchedulesScreenProps) {
  const { family } = useFamily();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<FamilySchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<FamilySchedule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FamilySchedule | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'routine' as FamilySchedule['type'],
    frequency: 'daily' as FamilySchedule['frequency'],
    time: '',
    dayOfWeek: 1,
    date: '',
    category: 'family' as FamilySchedule['category'],
    isShared: true,
  });

  useEffect(() => {
    loadFamilySchedules();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [schedules, selectedCategory]);

  const loadFamilySchedules = async () => {
    // Simular carga de horarios familiares
    const mockSchedules: FamilySchedule[] = [
      {
        id: '1',
        title: 'Desayuno Familiar',
        description: 'Momento para compartir en familia',
        type: 'routine',
        frequency: 'daily',
        time: '08:00',
        category: 'morning',
        isShared: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Reunión Familiar',
        description: 'Revisión semanal de objetivos familiares',
        type: 'event',
        frequency: 'weekly',
        time: '19:00',
        dayOfWeek: 0, // Domingo
        category: 'family',
        isShared: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: '3',
        title: 'Tarea de Matemáticas',
        description: 'Repaso de ejercicios de matemáticas',
        type: 'task',
        frequency: 'daily',
        time: '16:00',
        category: 'school',
        isShared: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
      {
        id: '4',
        title: 'Cita Médica',
        description: 'Revisión médica anual',
        type: 'event',
        frequency: 'once',
        time: '10:00',
        date: '2024-02-15',
        category: 'personal',
        isShared: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
    ];
    setSchedules(mockSchedules);
  };

  const filterSchedules = () => {
    if (selectedCategory === 'all') {
      setFilteredSchedules(schedules);
    } else {
      setFilteredSchedules(schedules.filter(schedule => schedule.category === selectedCategory));
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      title: '',
      description: '',
      type: 'routine',
      frequency: 'daily',
      time: '',
      dayOfWeek: 1,
      date: '',
      category: 'family',
      isShared: true,
    });
    setShowAddModal(true);
  };

  const handleEditSchedule = (schedule: FamilySchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      type: schedule.type,
      frequency: schedule.frequency,
      time: schedule.time,
      dayOfWeek: schedule.dayOfWeek || 1,
      date: schedule.date || '',
      category: schedule.category,
      isShared: schedule.isShared,
    });
    setShowAddModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!formData.title || !formData.time) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (editingSchedule) {
        // Actualizar horario existente
        const updatedSchedule: FamilySchedule = {
          ...editingSchedule,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          frequency: formData.frequency,
          time: formData.time,
          dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
          date: formData.frequency === 'once' ? formData.date : undefined,
          category: formData.category,
          isShared: formData.isShared,
          updatedAt: new Date().toISOString(),
        };

        setSchedules(prev => 
          prev.map(schedule => schedule.id === editingSchedule.id ? updatedSchedule : schedule)
        );
        Alert.alert('Éxito', 'Horario actualizado correctamente');
      } else {
        // Crear nuevo horario
        const newSchedule: FamilySchedule = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          type: formData.type,
          frequency: formData.frequency,
          time: formData.time,
          dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
          date: formData.frequency === 'once' ? formData.date : undefined,
          category: formData.category,
          isShared: formData.isShared,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setSchedules(prev => [...prev, newSchedule]);
        Alert.alert('Éxito', 'Horario agregado correctamente');
      }

      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el horario');
    }
  };

  const handleDeleteSchedule = (schedule: FamilySchedule) => {
    Alert.alert(
      'Eliminar Horario',
      `¿Estás seguro de que quieres eliminar "${schedule.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSchedules(prev => prev.filter(s => s.id !== schedule.id));
            Alert.alert('Eliminado', 'Horario eliminado correctamente');
          },
        },
      ]
    );
  };

  const getTypeInfo = (type: string) => {
    return SCHEDULE_TYPES.find(t => t.key === type) || SCHEDULE_TYPES[0];
  };

  const getCategoryInfo = (category: string) => {
    return SCHEDULE_CATEGORIES.find(cat => cat.key === category) || SCHEDULE_CATEGORIES[6];
  };

  const formatFrequency = (schedule: FamilySchedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return `Cada ${DAYS_OF_WEEK[schedule.dayOfWeek || 0]}`;
      case 'monthly':
        return 'Mensual';
      case 'once':
        return schedule.date ? `El ${new Date(schedule.date).toLocaleDateString()}` : 'Una vez';
      default:
        return 'Diario';
    }
  };

  const renderScheduleItem = ({ item }: { item: FamilySchedule }) => {
    const typeInfo = getTypeInfo(item.type);
    const categoryInfo = getCategoryInfo(item.category);
    
    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleIconContainer}>
            <Ionicons 
              name={typeInfo.icon as any} 
              size={24} 
              color={typeInfo.color} 
            />
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.scheduleDescription}>{item.description}</Text>
            )}
            <View style={styles.scheduleMeta}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text style={styles.scheduleFrequency}>{formatFrequency(item)}</Text>
            </View>
          </View>
          <View style={styles.scheduleActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditSchedule(item)}
            >
              <Ionicons name="create" size={16} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteSchedule(item)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.scheduleFooter}>
          <View style={styles.categoryTag}>
            <Ionicons 
              name={categoryInfo.icon as any} 
              size={14} 
              color={categoryInfo.color} 
            />
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
              {item.isShared ? "Compartido" : "Personal"}
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
        <Text style={styles.headerTitle}>Horarios Familiares</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSchedule}
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
            Todos
          </Text>
        </TouchableOpacity>
        
        {SCHEDULE_CATEGORIES.map((category) => (
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

      {/* Schedules List */}
      <FlatList
        data={filteredSchedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        style={styles.schedulesList}
        contentContainerStyle={styles.schedulesListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="time-outline" size={80} color="#8B5CF6" />
              <View style={styles.emptyIconGlow} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedCategory === 'all' 
                ? '¡Organiza tu tiempo familiar! ⏰'
                : `¡Planifica ${getCategoryInfo(selectedCategory).label.toLowerCase()}!`
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory === 'all' 
                ? 'Crea rutinas y horarios que ayuden a tu familia a mantenerse organizada y conectada'
                : `Establece horarios de ${getCategoryInfo(selectedCategory).label.toLowerCase()} para una mejor organización familiar`
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleAddSchedule}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.emptyAddButtonGradient}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyAddButtonText}>Crear Horario</Text>
              </LinearGradient>
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
              {editingSchedule ? 'Editar Horario' : 'Agregar Horario'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Ej: Desayuno Familiar"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descripción del horario"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo</Text>
              <View style={styles.typeSelector}>
                {SCHEDULE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeOption,
                      formData.type === type.key && styles.selectedTypeOption
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.key as FamilySchedule['type'] })}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={formData.type === type.key ? 'white' : type.color} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === type.key && styles.selectedTypeOptionText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Frecuencia</Text>
              <View style={styles.frequencySelector}>
                <TouchableOpacity
                  style={[
                    styles.frequencyOption,
                    formData.frequency === 'daily' && styles.selectedFrequencyOption
                  ]}
                  onPress={() => setFormData({ ...formData, frequency: 'daily' })}
                >
                  <Text style={[
                    styles.frequencyOptionText,
                    formData.frequency === 'daily' && styles.selectedFrequencyOptionText
                  ]}>
                    Diario
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyOption,
                    formData.frequency === 'weekly' && styles.selectedFrequencyOption
                  ]}
                  onPress={() => setFormData({ ...formData, frequency: 'weekly' })}
                >
                  <Text style={[
                    styles.frequencyOptionText,
                    formData.frequency === 'weekly' && styles.selectedFrequencyOptionText
                  ]}>
                    Semanal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyOption,
                    formData.frequency === 'monthly' && styles.selectedFrequencyOption
                  ]}
                  onPress={() => setFormData({ ...formData, frequency: 'monthly' })}
                >
                  <Text style={[
                    styles.frequencyOptionText,
                    formData.frequency === 'monthly' && styles.selectedFrequencyOptionText
                  ]}>
                    Mensual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyOption,
                    formData.frequency === 'once' && styles.selectedFrequencyOption
                  ]}
                  onPress={() => setFormData({ ...formData, frequency: 'once' })}
                >
                  <Text style={[
                    styles.frequencyOptionText,
                    formData.frequency === 'once' && styles.selectedFrequencyOptionText
                  ]}>
                    Una vez
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.frequency === 'weekly' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Día de la semana</Text>
                <View style={styles.daySelector}>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayOption,
                        formData.dayOfWeek === index && styles.selectedDayOption
                      ]}
                      onPress={() => setFormData({ ...formData, dayOfWeek: index })}
                    >
                      <Text style={[
                        styles.dayOptionText,
                        formData.dayOfWeek === index && styles.selectedDayOptionText
                      ]}>
                        {day.charAt(0)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {formData.frequency === 'once' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Fecha</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hora *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
                placeholder="HH:MM"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría</Text>
              <View style={styles.categorySelector}>
                {SCHEDULE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryOption,
                      formData.category === category.key && styles.selectedCategoryOption
                    ]}
                    onPress={() => setFormData({ ...formData, category: category.key as FamilySchedule['category'] })}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
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
                      {formData.isShared ? 'Compartido con la familia' : 'Solo para mí'}
                    </Text>
                    <Text style={styles.shareToggleSubtitle}>
                      {formData.isShared 
                        ? 'Todos los miembros pueden ver este horario'
                        : 'Solo tú puedes ver este horario'
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
              onPress={handleSaveSchedule}
            >
              <Text style={styles.saveButtonText}>
                {editingSchedule ? 'Actualizar' : 'Guardar'}
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
  schedulesList: {
    flex: 1,
  },
  schedulesListContent: {
    padding: 16,
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scheduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  scheduleFrequency: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scheduleActions: {
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
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  emptyAddButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTypeOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  selectedTypeOptionText: {
    color: 'white',
  },
  frequencySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedFrequencyOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  frequencyOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedFrequencyOptionText: {
    color: 'white',
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedDayOptionText: {
    color: 'white',
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

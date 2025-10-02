import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePenaltiesStore } from '../store/penaltiesStore';
import PenaltyCard from '../components/PenaltyCard';
import NewPenaltyModal from '../components/NewPenaltyModal';
import { theme } from '../../../styles/simpleTheme';

interface PenaltiesMainProps {
  navigation: any;
}

const PenaltiesMain: React.FC<PenaltiesMainProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    penalties,
    isInitialized,
    addPenalty,
    endPenalty,
    adjustTime,
    updatePenaltyTimer,
    getActivePenalties,
    getStats,
    initializeWithMockData,
  } = usePenaltiesStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activePenalties = getActivePenalties();
  const stats = getStats();

  // Initialize store with mock data
  useEffect(() => {
    if (!isInitialized) {
      initializeWithMockData();
    }
  }, [isInitialized, initializeWithMockData]);

  // Update penalty timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      updatePenaltyTimer();
    }, 60000); // Update every minute for days-based penalties

    return () => clearInterval(timerInterval);
  }, [updatePenaltyTimer]);

  const handleAddPenalty = useCallback((penaltyData: any) => {
    addPenalty(penaltyData);
    setShowAddModal(false);
  }, [addPenalty]);

  const handleEndPenalty = useCallback((id: string) => {
    Alert.prompt(
      'Completar Penalidad',
      '¿Te gustaría agregar una reflexión sobre lo que se aprendió?',
      [
        { text: 'Saltar', onPress: () => endPenalty(id) },
        {
          text: 'Agregar Reflexión',
          onPress: (reflection?: string) => endPenalty(id, reflection)
        }
      ],
      'plain-text',
      '',
      'default'
    );
  }, [endPenalty]);

  const handleAdjustTime = useCallback((id: string, days: number) => {
    adjustTime(id, days);
  }, [adjustTime]);

  const handleViewDetails = useCallback((id: string) => {
    navigation.navigate('PenaltyDetails', { penaltyId: id });
  }, [navigation]);

  const handleViewHistory = useCallback(() => {
    navigation.navigate('PenaltyHistory');
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    updatePenaltyTimer();
    setTimeout(() => setRefreshing(false), 1000);
  }, [updatePenaltyTimer]);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Beautiful Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Sistema de Penalidades</Text>
            <Text style={styles.headerSubtitle}>Tarjetas Amarillas y Rojas</Text>
          </View>
          <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
            <Ionicons name="time-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Beautiful Stats */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Activas"
          value={stats.activePenalties}
          icon="play-circle"
          color="#3B82F6"
          subtitle="En curso"
        />
        <StatCard
          title="Completadas"
          value={stats.completedPenalties}
          icon="checkmark-circle"
          color="#10B981"
          subtitle="Finalizadas"
        />
        <StatCard
          title="Amarillas"
          value={stats.yellowCards}
          icon="warning"
          color="#F59E0B"
          subtitle="Menores"
        />
        <StatCard
          title="Rojas"
          value={stats.redCards}
          icon="close-circle"
          color="#EF4444"
          subtitle="Mayores"
        />
      </View>

      {/* Content with Pull to Refresh */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activePenalties.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="checkmark-circle" size={60} color="white" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>¡Excelente Trabajo!</Text>
            <Text style={styles.emptySubtitle}>
              No hay penalidades activas en este momento.{'\n'}
              Todos están cumpliendo con sus responsabilidades.
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Crear Nueva Penalidad</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.activePenaltiesHeader}>
              <Text style={styles.activePenaltiesTitle}>Penalidades Activas</Text>
              <Text style={styles.activePenaltiesSubtitle}>
                {activePenalties.length} penalidad{activePenalties.length !== 1 ? 'es' : ''} en curso
              </Text>
            </View>
            {activePenalties.map((penalty) => (
              <PenaltyCard
                key={penalty.id}
                penalty={penalty}
                onAdjustTime={handleAdjustTime}
                onEndPenalty={handleEndPenalty}
                onViewDetails={handleViewDetails}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Beautiful Floating Action Button */}
      {activePenalties.length > 0 && (
        <TouchableOpacity 
          style={[styles.fab, { bottom: insets.bottom + 20 }]} 
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Penalty Modal */}
      <NewPenaltyModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPenalty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  historyButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: '600',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: theme.colors.gray,
    marginTop: 2,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  activePenaltiesHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  activePenaltiesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  activePenaltiesSubtitle: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PenaltiesMain;
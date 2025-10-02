import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
            'Terminar Penalidad',
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

    const formatStats = (value: number, unit: string) => {
        if (unit === 'days') {
            return value === 1 ? '1 día' : `${value} días`;
        }
        return value.toString();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Sistema de Penalidades</Text>
                        <Text style={styles.headerSubtitle}>Tarjetas Amarillas y Rojas</Text>
                    </View>
                    <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
                        <Ionicons name="time-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.activeCount}</Text>
                    <Text style={styles.statLabel}>Activas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.completedCount}</Text>
                    <Text style={styles.statLabel}>Completadas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.yellowCards}</Text>
                    <Text style={styles.statLabel}>Amarillas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.redCards}</Text>
                    <Text style={styles.statLabel}>Rojas</Text>
                </View>
            </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activePenalties.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Hay Penalidades Activas</Text>
            <Text style={styles.emptySubtitle}>
              ¡Excelente! Nadie está cumpliendo una penalidad en este momento.
            </Text>
          </View>
        ) : (
          activePenalties.map((penalty) => (
            <PenaltyCard
              key={penalty.id}
              penalty={penalty}
              onAdjustTime={handleAdjustTime}
              onEndPenalty={handleEndPenalty}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom + 24 }]}
                onPress={() => setShowAddModal(true)}
            >
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>

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
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...theme.shadows.medium,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    historyButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.medium,
        gap: theme.spacing.small,
        marginTop: -30,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.medium,
        alignItems: 'center',
        ...theme.shadows.small,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.gray,
    },
  content: {
    flex: 1,
    marginTop: theme.spacing.small,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 24,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        right: 24,
        ...theme.shadows.medium,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PenaltiesMain;
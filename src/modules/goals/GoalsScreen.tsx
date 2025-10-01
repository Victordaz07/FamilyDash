import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../../state/store';

const GoalsScreen = () => {
    const { goals, updateGoal } = useFamilyDashStore();

    const handleUpdateProgress = (goalId: string, progress: number) => {
        updateGoal(goalId, { progress });
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return '#10B981';
        if (progress >= 75) return '#3B82F6';
        if (progress >= 50) return '#F59E0B';
        if (progress >= 25) return '#EF4444';
        return '#6B7280';
    };

    const getProgressStatus = (progress: number) => {
        if (progress >= 100) return 'Completado';
        if (progress >= 75) return 'Casi terminado';
        if (progress >= 50) return 'En progreso';
        if (progress >= 25) return 'Iniciado';
        return 'Sin iniciar';
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>🏆 Metas Familiares</Text>
                <Text style={styles.headerSubtitle}>
                    {goals.filter(g => g.progress < 100).length} metas en progreso
                </Text>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Metas Activas</Text>

                {goals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="trophy-outline" size={64} color="#F59E0B" />
                        <Text style={styles.emptyText}>No hay metas establecidas</Text>
                        <Text style={styles.emptySubtext}>¡Establece tu primera meta familiar!</Text>
                    </View>
                ) : (
                    goals.map((goal) => (
                        <View key={goal.id} style={styles.goalCard}>
                            <View style={styles.goalHeader}>
                                <View style={styles.goalInfo}>
                                    <Text style={styles.goalTitle}>
                                        {goal.title}
                                    </Text>
                                    <Text style={styles.goalDescription}>
                                        {goal.description}
                                    </Text>
                                </View>
                                <View style={styles.goalStatus}>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getProgressColor(goal.progress) }
                                    ]}>
                                        <Text style={styles.statusText}>
                                            {getProgressStatus(goal.progress)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>Progreso</Text>
                                    <Text style={styles.progressPercentage}>
                                        {goal.progress}%
                                    </Text>
                                </View>

                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${goal.progress}%`,
                                                    backgroundColor: getProgressColor(goal.progress)
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.goalDetails}>
                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#F59E0B" />
                                    <Text style={styles.detailText}>
                                        Meta: {new Date(goal.targetDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name="person-outline" size={16} color="#F59E0B" />
                                    <Text style={styles.detailText}>
                                        Responsable: {goal.familyMember}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressButtons}>
                                <TouchableOpacity
                                    style={[styles.progressButton, styles.decreaseButton]}
                                    onPress={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                                >
                                    <Ionicons name="remove" size={16} color="white" />
                                    <Text style={styles.progressButtonText}>-10%</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.progressButton, styles.increaseButton]}
                                    onPress={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                                >
                                    <Ionicons name="add" size={16} color="white" />
                                    <Text style={styles.progressButtonText}>+10%</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.addButtonText}>Agregar Nueva Meta</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    goalCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    goalStatus: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    progressSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    progressBarContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    goalDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    progressButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    decreaseButton: {
        backgroundColor: '#EF4444',
    },
    increaseButton: {
        backgroundColor: '#10B981',
    },
    progressButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    addButton: {
        backgroundColor: '#F59E0B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default GoalsScreen;

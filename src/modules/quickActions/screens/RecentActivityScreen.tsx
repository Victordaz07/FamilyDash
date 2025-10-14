import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useActivityStore } from '../store/activityStore';
import { ActivityItem } from '../components/ActivityItem';
import { theme } from '@/styles/simpleTheme';
import { useTranslation } from '../../../locales/i18n';

interface RecentActivityScreenProps {
    navigation: any;
}

export const RecentActivityScreen: React.FC<RecentActivityScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const { activityLogs, getActivityByType, getRecentActivity } = useActivityStore();
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const filters = [
        { key: 'all', label: 'Todos', icon: 'apps' },
        { key: 'task', label: 'Tareas', icon: 'checkmark-circle' },
        { key: 'goal', label: 'Metas', icon: 'trophy' },
        { key: 'penalty', label: 'Penas', icon: 'warning' },
        { key: 'safeRoom', label: 'Cuarto Seguro', icon: 'heart' },
    ];

    const filteredActivities = selectedFilter === 'all'
        ? getRecentActivity(20)
        : getActivityByType(selectedFilter as any);

    const handleActivityPress = (activityId: string) => {
        Alert.alert(
            'Actividad',
            `¿Qué deseas hacer con esta actividad?`,
            [
                { text: 'Ver Detalles', onPress: () => console.log('Ver detalles') },
                { text: 'Marcar como Leída', onPress: () => console.log('Marcar leída') },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const getActivityStats = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayActivities = activityLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
        });

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);

        const weekActivities = activityLogs.filter(log =>
            new Date(log.timestamp) > thisWeek
        );

        return {
            today: todayActivities.length,
            thisWeek: weekActivities.length,
            total: activityLogs.length,
            lastActivity: activityLogs[0]?.timestamp || null,
        };
    };

    const stats = getActivityStats();

    const formatLastActivity = (timestamp: string | null) => {
        if (!timestamp) return 'Sin actividad';

        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return 'Hace unos minutos';
        } else if (diffInHours < 24) {
            return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Actividad Reciente</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => Alert.alert('Configuraciones', 'Funcionalidad próximamente')}
                >
                    <Ionicons name="settings" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.today}</Text>
                        <Text style={styles.statLabel}>Hoy</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.thisWeek}</Text>
                        <Text style={styles.statLabel}>Esta Semana</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{formatLastActivity(stats.lastActivity)}</Text>
                        <Text style={styles.statLabel}>Última</Text>
                    </View>
                </View>

                {/* Filter Buttons */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter.key && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter(filter.key)}
                        >
                            <Ionicons
                                name={filter.icon as any}
                                size={20}
                                color={selectedFilter === filter.key ? 'white' : theme.colors.primary}
                            />
                            <Text style={[
                                styles.filterButtonText,
                                selectedFilter === filter.key && styles.filterButtonTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Activity Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📜 Historial de Actividades</Text>
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <ActivityItem
                                key={activity.id}
                                activity={activity}
                                onPress={() => handleActivityPress(activity.id)}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyStateTitle}>Sin actividades</Text>
                            <Text style={styles.emptyStateText}>
                                No hay actividades para mostrar con el filtro seleccionado
                            </Text>
                        </View>
                    )}
                </View>

                {/* Clear Old Activity Button */}
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => Alert.alert(
                        'Limpiar Actividad Antigua',
                        '¿Deseas eliminar actividades de más de 30 días?',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Limpiar', onPress: () => console.log('Limpiar actividad antigua') },
                        ]
                    )}
                >
                    <LinearGradient
                        colors={['#EF4444', '#F87171']}
                        style={styles.clearButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="trash" size={20} color="white" />
                        <Text style={styles.clearButtonText}>Limpiar Actividad Antigua</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    settingsButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    filterContainer: {
        marginVertical: 16,
    },
    filterContent: {
        paddingHorizontal: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
        marginLeft: 4,
    },
    filterButtonTextActive: {
        color: 'white',
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginHorizontal: 16,
        marginBottom: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    clearButton: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    clearButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
});

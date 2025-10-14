import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStatsStore } from '../store/statsStore';
import { StatsCard } from '../components/StatsCard';
import { theme } from '@/styles/simpleTheme';
import { useTranslation } from '../../../locales/i18n';

interface StatisticsScreenProps {
    navigation: any;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const { familyStats, getCompletionRate, getTopPerformer } = useStatsStore();
    const [selectedPeriod, setSelectedPeriod] = useState<string>('week');

    const periods = [
        { key: 'week', label: 'Esta Semana', icon: 'calendar' },
        { key: 'month', label: 'Este Mes', icon: 'calendar-outline' },
        { key: 'year', label: 'Este Año', icon: 'calendar-number' },
        { key: 'all', label: 'Todo el Tiempo', icon: 'time' },
    ];

    const completionRate = getCompletionRate();
    const topPerformer = getTopPerformer();

    const handleStatPress = (statType: string) => {
        Alert.alert(
            'Estadística',
            `¿Qué deseas hacer con esta estadística?`,
            [
                { text: 'Ver Detalles', onPress: () => console.log('Ver detalles') },
                { text: 'Exportar Datos', onPress: () => console.log('Exportar datos') },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const getMemberStatsCards = () => {
        const memberStats = Object.entries(familyStats.memberStats);

        return memberStats.map(([memberId, stats]) => (
            <View key={memberId} style={styles.memberStatsCard}>
                <LinearGradient
                    colors={['#8B5CF6', '#A855F7']}
                    style={styles.memberStatsGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.memberStatsTitle}>Miembro {memberId}</Text>
                    <View style={styles.memberStatsGrid}>
                        <View style={styles.memberStatItem}>
                            <Text style={styles.memberStatValue}>{stats.tasksCompleted}</Text>
                            <Text style={styles.memberStatLabel}>Tareas</Text>
                        </View>
                        <View style={styles.memberStatItem}>
                            <Text style={styles.memberStatValue}>{stats.goalsReached}</Text>
                            <Text style={styles.memberStatLabel}>Metas</Text>
                        </View>
                        <View style={styles.memberStatItem}>
                            <Text style={styles.memberStatValue}>{stats.penaltiesReceived}</Text>
                            <Text style={styles.memberStatLabel}>Penas</Text>
                        </View>
                        <View style={styles.memberStatItem}>
                            <Text style={styles.memberStatValue}>{stats.safeRoomEntries}</Text>
                            <Text style={styles.memberStatLabel}>Cuarto Seguro</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
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
                <Text style={styles.headerTitle}>Estadísticas Familiares</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => Alert.alert('Configuraciones', 'Funcionalidad próximamente')}
                >
                    <Ionicons name="settings" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Period Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.periodContainer}
                    contentContainerStyle={styles.periodContent}
                >
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period.key}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period.key && styles.periodButtonActive
                            ]}
                            onPress={() => setSelectedPeriod(period.key)}
                        >
                            <Ionicons
                                name={period.icon as any}
                                size={20}
                                color={selectedPeriod === period.key ? 'white' : theme.colors.primary}
                            />
                            <Text style={[
                                styles.periodButtonText,
                                selectedPeriod === period.key && styles.periodButtonTextActive
                            ]}>
                                {period.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Main Stats Cards */}
                <View style={styles.statsGrid}>
                    <StatsCard
                        title="Tareas Completadas"
                        value={familyStats.completedTasks}
                        subtitle={`de ${familyStats.totalTasks} total`}
                        icon="checkmark-circle"
                        gradient={['#10B981', '#34D399']}
                        trend="up"
                        trendValue="+12%"
                    />
                    <StatsCard
                        title="Metas Activas"
                        value={familyStats.activeGoals}
                        subtitle="en progreso"
                        icon="trophy"
                        gradient={['#3B82F6', '#60A5FA']}
                        trend="neutral"
                    />
                </View>

                <View style={styles.statsGrid}>
                    <StatsCard
                        title="Penas Asignadas"
                        value={familyStats.penalties}
                        subtitle="este período"
                        icon="warning"
                        gradient={['#EF4444', '#F87171']}
                        trend="down"
                        trendValue="-5%"
                    />
                    <StatsCard
                        title="Cuarto Seguro"
                        value={familyStats.safeRoomInteractions}
                        subtitle="interacciones"
                        icon="heart"
                        gradient={['#8B5CF6', '#A855F7']}
                        trend="up"
                        trendValue="+8%"
                    />
                </View>

                {/* Completion Rate */}
                <View style={styles.completionCard}>
                    <LinearGradient
                        colors={['#06B6D4', '#0891B2']}
                        style={styles.completionGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.completionHeader}>
                            <Ionicons name="analytics" size={32} color="white" />
                            <Text style={styles.completionTitle}>Tasa de Completado</Text>
                        </View>
                        <Text style={styles.completionValue}>{Math.round(completionRate)}%</Text>
                        <View style={styles.completionBar}>
                            <View
                                style={[
                                    styles.completionBarFill,
                                    { width: `${completionRate}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.completionSubtitle}>
                            {familyStats.completedTasks} de {familyStats.totalTasks} tareas completadas
                        </Text>
                    </LinearGradient>
                </View>

                {/* Top Performer */}
                {topPerformer && (
                    <View style={styles.topPerformerCard}>
                        <LinearGradient
                            colors={['#F59E0B', '#FBBF24']}
                            style={styles.topPerformerGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.topPerformerHeader}>
                                <Ionicons name="trophy" size={32} color="white" />
                                <Text style={styles.topPerformerTitle}>Mejor Desempeño</Text>
                            </View>
                            <Text style={styles.topPerformerName}>{topPerformer.memberName}</Text>
                            <Text style={styles.topPerformerScore}>{topPerformer.score} puntos</Text>
                        </LinearGradient>
                    </View>
                )}

                {/* Member Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Estadísticas por Miembro</Text>
                    {getMemberStatsCards()}
                </View>

                {/* Export Button */}
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => Alert.alert('Exportar Datos', 'Funcionalidad próximamente')}
                >
                    <LinearGradient
                        colors={['#10B981', '#34D399']}
                        style={styles.exportButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="download" size={24} color="white" />
                        <Text style={styles.exportButtonText}>Exportar Estadísticas</Text>
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
    periodContainer: {
        marginVertical: 16,
    },
    periodContent: {
        paddingHorizontal: 16,
    },
    periodButton: {
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
    periodButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
        marginLeft: 4,
    },
    periodButtonTextActive: {
        color: 'white',
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    completionCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    completionGradient: {
        padding: 20,
        alignItems: 'center',
    },
    completionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    completionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    completionValue: {
        fontSize: 48,
        fontWeight: '700',
        color: 'white',
        marginBottom: 16,
    },
    completionBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    completionBarFill: {
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 4,
    },
    completionSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    topPerformerCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    topPerformerGradient: {
        padding: 20,
        alignItems: 'center',
    },
    topPerformerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    topPerformerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    topPerformerName: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    topPerformerScore: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
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
    memberStatsCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    memberStatsGradient: {
        padding: 16,
    },
    memberStatsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
    },
    memberStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    memberStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    memberStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    memberStatLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    exportButton: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    exportButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    exportButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
});

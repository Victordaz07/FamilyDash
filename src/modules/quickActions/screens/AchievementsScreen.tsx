import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAchievementsStore } from '../store/achievementsStore';
import { AchievementCard } from '../components/AchievementCard';
import { theme } from '../../../styles/simpleTheme';
import { useTranslation } from '../../../locales/i18n';

interface AchievementsScreenProps {
    navigation: any;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const { achievements, getAchievementsByCategory, getLeaderboard } = useAchievementsStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { key: 'all', label: 'Todos', icon: 'apps' },
        { key: 'tasksCompleted', label: 'Tareas', icon: 'checkmark-circle' },
        { key: 'goalsReached', label: 'Metas', icon: 'trophy' },
        { key: 'noPenalties', label: 'Sin Penas', icon: 'shield-checkmark' },
        { key: 'specialEvents', label: 'Eventos', icon: 'star' },
    ];

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : getAchievementsByCategory(selectedCategory as any);

    const leaderboard = getLeaderboard();

    const handleAchievementPress = (achievementId: string) => {
        Alert.alert(
            'Logro',
            `¿Qué deseas hacer con este logro?`,
            [
                { text: 'Ver Detalles', onPress: () => console.log('Ver detalles') },
                { text: 'Marcar Completado', onPress: () => console.log('Marcar completado') },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const getStats = () => {
        const total = achievements.length;
        const achieved = achievements.filter(a => a.achieved).length;
        const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
        const earnedPoints = achievements.filter(a => a.achieved).reduce((sum, a) => sum + a.points, 0);

        return { total, achieved, totalPoints, earnedPoints };
    };

    const stats = getStats();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
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
                <Text style={styles.headerTitle}>Logros y Medallas</Text>
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
                        <Text style={styles.statValue}>{stats.achieved}</Text>
                        <Text style={styles.statLabel}>Completados</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.earnedPoints}</Text>
                        <Text style={styles.statLabel}>Puntos</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{Math.round((stats.achieved / stats.total) * 100)}%</Text>
                        <Text style={styles.statLabel}>Progreso</Text>
                    </View>
                </View>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryContainer}
                    contentContainerStyle={styles.categoryContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.key}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.key && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category.key)}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={20}
                                color={selectedCategory === category.key ? 'white' : theme.colors.primary}
                            />
                            <Text style={[
                                styles.categoryButtonText,
                                selectedCategory === category.key && styles.categoryButtonTextActive
                            ]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏆 Tabla de Líderes</Text>
                        <View style={styles.leaderboard}>
                            {leaderboard.slice(0, 3).map((member, index) => (
                                <View key={member.memberId} style={styles.leaderboardItem}>
                                    <View style={styles.leaderboardRank}>
                                        <Text style={styles.leaderboardRankText}>#{index + 1}</Text>
                                    </View>
                                    <View style={styles.leaderboardInfo}>
                                        <Text style={styles.leaderboardName}>{member.memberName}</Text>
                                        <Text style={styles.leaderboardPoints}>{member.points} puntos</Text>
                                    </View>
                                    <View style={styles.leaderboardMedal}>
                                        <Ionicons
                                            name={index === 0 ? 'trophy' : index === 1 ? 'medal' : 'ribbon'}
                                            size={24}
                                            color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Achievements List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Logros Disponibles</Text>
                    {filteredAchievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onPress={() => handleAchievementPress(achievement.id)}
                            showProgress={true}
                        />
                    ))}
                </View>

                {/* Add Achievement Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => Alert.alert('Agregar Logro', 'Funcionalidad próximamente')}
                >
                    <LinearGradient
                        colors={['#10B981', '#34D399']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>Agregar Logro</Text>
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
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    categoryContainer: {
        marginVertical: 16,
    },
    categoryContent: {
        paddingHorizontal: 16,
    },
    categoryButton: {
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
    categoryButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
        marginLeft: 4,
    },
    categoryButtonTextActive: {
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
    leaderboard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    leaderboardRank: {
        width: 30,
        alignItems: 'center',
    },
    leaderboardRankText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    leaderboardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    leaderboardName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    leaderboardPoints: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    leaderboardMedal: {
        marginLeft: 8,
    },
    addButton: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
});

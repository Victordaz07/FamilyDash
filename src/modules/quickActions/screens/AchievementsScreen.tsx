/**
 * 🏆 ACHIEVEMENTS SCREEN - ROBUST VERSION
 * Using centralized store and absolute imports
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAchievements, useAuth } from '@/store';
import { AchievementCard } from '../components/AchievementCard';
import { theme } from '@/styles/simpleTheme';

interface AchievementsScreenProps {
    navigation: any;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
    const { achievements, addAchievement, updateAchievement, completeAchievement, checkAchievements } = useAchievements();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { key: 'all', label: 'All', icon: 'apps' },
        { key: 'tasksCompleted', label: 'Tasks', icon: 'checkmark-circle' },
        { key: 'goalsReached', label: 'Goals', icon: 'trophy' },
        { key: 'noPenalties', label: 'Behavior', icon: 'shield' },
        { key: 'specialEvents', label: 'Events', icon: 'star' },
    ];

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    const handleAchievementPress = (achievementId: string) => {
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        Alert.alert(
            'Achievement',
            `What would you like to do with "${achievement.title}"?`,
            [
                { text: 'View Details', onPress: () => console.log('View details') },
                { 
                    text: 'Mark Complete', 
                    onPress: () => {
                        completeAchievement(achievementId);
                        Alert.alert('Success', `Achievement "${achievement.title}" completed!`);
                    }
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleCreateAchievement = () => {
        Alert.alert(
            'Create Custom Achievement', 
            'Custom achievement creation will be available soon!',
            [{ text: 'OK' }]
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
                <Text style={styles.headerTitle}>Achievements & Medals</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => Alert.alert('Settings', 'Configuration coming soon')}
                >
                    <Ionicons name="settings" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.achieved}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.earnedPoints}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.total > 0 ? Math.round((stats.achieved / stats.total) * 100) : 0}%</Text>
                        <Text style={styles.statLabel}>Progress</Text>
                    </View>
                </View>

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <View style={styles.helpIcon}>
                        <Ionicons name="information-circle" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.helpContent}>
                        <Text style={styles.helpTitle}>How Achievements Work</Text>
                        <Text style={styles.helpText}>
                            Achievements motivate family members by rewarding good behavior and completed tasks. 
                            Each achievement has points and progress tracking to encourage participation.
                        </Text>
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

                {/* Achievements List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievement Examples</Text>
                    <Text style={styles.sectionSubtitle}>
                        These are example achievements to guide you. Create your own custom achievements for your family.
                    </Text>
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
                    onPress={handleCreateAchievement}
                >
                    <LinearGradient
                        colors={['#10B981', '#34D399']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>Create Custom Achievement</Text>
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
    helpSection: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    helpIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 4,
    },
    helpText: {
        fontSize: 14,
        color: '#3B82F6',
        lineHeight: 20,
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
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginHorizontal: 16,
        marginBottom: 16,
        lineHeight: 20,
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
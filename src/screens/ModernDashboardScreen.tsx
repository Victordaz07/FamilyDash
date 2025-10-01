import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../state/store';
import NotificationsModal from '../components/NotificationsModal';
import { Button, Card, Badge, Avatar } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
    navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { tasks, penalties, activities, goals } = useFamilyDashStore();
    const [penaltyTime, setPenaltyTime] = useState(15 * 60 + 42);
    const [lastRingTime, setLastRingTime] = useState(5);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const formatTime = useCallback((totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleRingDevice = useCallback((memberName: string) => {
        Alert.alert('🔔 Ringing Device', `Ringing ${memberName}'s device...`);
    }, []);

    const handleRingAllDevices = useCallback(() => {
        Alert.alert('🔔 Ring All Devices', 'Ringing all family devices...');
        setLastRingTime(0);
        const timer = setTimeout(() => {
            setLastRingTime(5);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Navigation handlers
    const handleAddTask = useCallback(() => {
        navigation.navigate('Tasks');
    }, [navigation]);

    const handleSafeRoom = useCallback(() => {
        navigation.navigate('SafeRoom');
    }, [navigation]);

    const handleNotifications = useCallback(() => {
        setShowNotificationsModal(true);
    }, []);

    const handleViewAllTasks = useCallback(() => {
        navigation.navigate('Tasks');
    }, [navigation]);

    const handleViewCalendar = useCallback(() => {
        navigation.navigate('Calendar');
    }, [navigation]);

    const handleVote = useCallback(() => {
        navigation.navigate('Calendar', { screen: 'Voting' });
    }, [navigation]);

    const handleGoals = useCallback(() => {
        navigation.navigate('Goals');
    }, [navigation]);

    const handleActivePenalty = useCallback(() => {
        navigation.navigate('Penalties');
    }, [navigation]);

    const familyMembers = useMemo(() => [
        {
            id: '1',
            name: 'Dad',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            badge: { type: 'count', value: 3, color: '#10B981' },
            borderColor: '#3B82F6',
            status: 'online',
            lastSeen: '2 min ago',
            points: 1250,
            streak: 7
        },
        {
            id: '2',
            name: 'Mom',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            badge: { type: 'count', value: 2, color: '#10B981' },
            borderColor: '#EC4899',
            status: 'online',
            lastSeen: '1 min ago',
            points: 1180,
            streak: 5
        },
        {
            id: '3',
            name: 'Emma',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            badge: { type: 'count', value: 1, color: '#F59E0B' },
            borderColor: '#10B981',
            status: 'online',
            lastSeen: 'Just now',
            points: 890,
            streak: 3
        },
        {
            id: '4',
            name: 'Jake',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            badge: { type: 'icon', value: 'warning', color: '#EF4444' },
            borderColor: '#F59E0B',
            status: 'offline',
            lastSeen: '1 hour ago',
            points: 650,
            streak: 1
        },
    ], []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>FamilyDash</Text>
                            <Text style={styles.headerSubtitle}>Bienvenido de vuelta</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
                            <Ionicons name="notifications" size={24} color="white" />
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>3</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <Card style={styles.statCard}>
                            <View style={styles.statCardContent}>
                                <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                                    <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                                </View>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Tareas Completadas</Text>
                            </View>
                        </Card>
                        <Card style={styles.statCard}>
                            <View style={styles.statCardContent}>
                                <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                                    <Ionicons name="trophy" size={20} color="#22c55e" />
                                </View>
                                <Text style={styles.statValue}>4</Text>
                                <Text style={styles.statLabel}>Metas Alcanzadas</Text>
                            </View>
                        </Card>
                        <Card style={styles.statCard}>
                            <View style={styles.statCardContent}>
                                <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                                    <Ionicons name="calendar" size={20} color="#f59e0b" />
                                </View>
                                <Text style={styles.statValue}>8</Text>
                                <Text style={styles.statLabel}>Actividades</Text>
                            </View>
                        </Card>
                    </View>
                </LinearGradient>

                {/* Family Members */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Miembros de la Familia</Text>
                    <View style={styles.familyGrid}>
                        {familyMembers.map((member, index) => (
                            <Card key={member.id} style={styles.familyCard}>
                                <LinearGradient
                                    colors={[member.borderColor, `${member.borderColor}CC`]}
                                    style={styles.familyCardGradient}
                                >
                                    <View style={styles.familyCardHeader}>
                                        <Avatar
                                            source={{ uri: member.avatar }}
                                            size={48}
                                            name={member.name}
                                        />
                                        <View style={styles.familyStatus}>
                                            <View style={[styles.familyStatusDot, { backgroundColor: member.status === 'online' ? '#22c55e' : '#ef4444' }]} />
                                            <Text style={styles.familyStatusText}>{member.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.familyName}>{member.name}</Text>
                                    <View style={styles.familyInfo}>
                                        <Text style={styles.familyPoints}>{member.points} pts</Text>
                                        <Text style={styles.familyStreak}>{member.streak} días</Text>
                                    </View>
                                </LinearGradient>
                            </Card>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <View style={styles.quickActionsGrid}>
                        <Card style={styles.quickActionCard}>
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="add-circle" size={24} color="white" />
                                </View>
                                <Text style={styles.quickActionTitle}>Nueva Tarea</Text>
                                <Text style={styles.quickActionSubtitle}>Agregar tarea</Text>
                            </LinearGradient>
                        </Card>
                        <Card style={styles.quickActionCard}>
                            <LinearGradient
                                colors={['#EC4899', '#BE185D']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="shield-checkmark" size={24} color="white" />
                                </View>
                                <Text style={styles.quickActionTitle}>Safe Room</Text>
                                <Text style={styles.quickActionSubtitle}>Espacio seguro</Text>
                            </LinearGradient>
                        </Card>
                        <Card style={styles.quickActionCard}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="calendar" size={24} color="white" />
                                </View>
                                <Text style={styles.quickActionTitle}>Calendario</Text>
                                <Text style={styles.quickActionSubtitle}>Ver eventos</Text>
                            </LinearGradient>
                        </Card>
                        <Card style={styles.quickActionCard}>
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="trophy" size={24} color="white" />
                                </View>
                                <Text style={styles.quickActionTitle}>Metas</Text>
                                <Text style={styles.quickActionSubtitle}>Ver progreso</Text>
                            </LinearGradient>
                        </Card>
                    </View>
                </View>

                {/* Emergency Section */}
                <View style={styles.section}>
                    <Card style={styles.emergencyCard}>
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            style={styles.emergencyGradient}
                        >
                            <View style={styles.emergencyIcon}>
                                <Ionicons name="warning" size={32} color="white" />
                            </View>
                            <Text style={styles.emergencyTitle}>Emergencia</Text>
                            <Text style={styles.emergencySubtitle}>Acceso rápido a funciones de emergencia</Text>
                            <View style={styles.emergencyButtons}>
                                <Button
                                    title="Llamar 911"
                                    onPress={() => Alert.alert('Emergency', 'Calling 911...')}
                                    variant="outline"
                                    style={styles.emergencyButton}
                                />
                                <Button
                                    title="Ring All"
                                    onPress={handleRingAllDevices}
                                    variant="outline"
                                    style={styles.emergencyButton}
                                />
                            </View>
                        </LinearGradient>
                    </Card>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>FamilyDash v1.0 - Manteniendo familias conectadas</Text>
                </View>
            </ScrollView>

            <NotificationsModal
                visible={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    notificationButton: {
        position: 'relative',
        padding: 12,
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.colors.error,
        borderRadius: theme.borderRadius.full,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
    },
    statCardContent: {
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    familyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    familyCard: {
        width: (screenWidth - 48) / 2,
        marginBottom: 12,
        padding: 0,
        overflow: 'hidden',
    },
    familyCardGradient: {
        padding: 16,
    },
    familyCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    familyStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    familyStatusDot: {
        width: 8,
        height: 8,
        borderRadius: theme.borderRadius.full,
        marginRight: 4,
    },
    familyStatusText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    familyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    familyInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    familyPoints: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    familyStreak: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: (screenWidth - 48) / 2,
        marginBottom: 12,
        padding: 0,
        overflow: 'hidden',
    },
    quickActionGradient: {
        padding: 20,
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickActionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    emergencyCard: {
        marginHorizontal: 16,
        padding: 0,
        overflow: 'hidden',
    },
    emergencyGradient: {
        padding: 24,
        alignItems: 'center',
    },
    emergencyIcon: {
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emergencyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    emergencySubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 20,
    },
    emergencyButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    emergencyButton: {
        flex: 1,
        marginHorizontal: 8,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});

export default DashboardScreen;

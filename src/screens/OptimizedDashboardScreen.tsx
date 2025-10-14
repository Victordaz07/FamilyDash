import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/locales/i18n';
import { useFamilyDashStore } from '@/state/store';
import { useTasksStore } from '@/modules/tasks/store/tasksStore';
import { usePenaltiesStore } from '@/modules/penalties/store/penaltiesStore';
import { theme } from '@/styles/simpleTheme';

// Performance optimizations - using React built-in hooks

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
    navigation: any;
}

// Memoized components for better performance
const MemoizedFamilyMemberCard = React.memo<{
    member: any;
    index: number;
    onPress: (member: any) => void;
}>(({ member, index, onPress }) => (
    <TouchableOpacity
        style={[
            styles.memberCard,
            { backgroundColor: member.color },
            { marginLeft: index === 0 ? 0 : 8 }
        ]}
        onPress={() => onPress(member)}
    >
        <View style={styles.memberInfo}>
            <Text style={styles.memberAvatar}>{member.avatar}</Text>
            <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
            </View>
        </View>
        <View style={[
            styles.statusIndicator,
            { backgroundColor: member.isOnline ? theme.colors.success : theme.colors.border }
        ]} />
    </TouchableOpacity>
));

const MemoizedQuickActionCard = React.memo<{
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
}>(({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
        <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.actionGradient}
        >
            <Ionicons name={icon as any} size={24} color={theme.colors.white} />
        </LinearGradient>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
    </TouchableOpacity>
));

const OptimizedDashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();

    // Use specific module stores
    const tasksStore = useTasksStore();
    const penaltiesStore = usePenaltiesStore();

    // Timer state
    const [timerState, setTimerState] = useState({
        penaltyTime: 15 * 60 + 42,
        lastRingTime: 5,
    });

    // Timer optimization - only update if value changes
    useEffect(() => {
        const timer = setInterval(() => {
            setTimerState(prevState => ({
                ...prevState,
                penaltyTime: prevState.penaltyTime > 0 ? prevState.penaltyTime - 1 : 0,
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, [setTimerState]);

    // Memoized dashboard data
    const dashboardData = useMemo(() => {
        const activeTasks = (tasksStore.tasks || []).filter((task: any) => task.status !== 'completed');
        const activePenalties = (penaltiesStore.penalties || []).filter((penalty: any) => penalty.isActive);

        return {
            activeTasks,
            activePenalties,
        };
    }, [tasksStore.tasks, penaltiesStore.penalties]);

    // Memoized family members processing
    const familyMembers = useMemo(() => {
        const baseMembers = familyMembersFromStore || [];
        const colors = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B'];
        const statuses = ['online', 'away', 'offline'];

        return baseMembers.map((member: any, index: number) => ({
            ...member,
            color: colors[index % colors.length],
            status: statuses[index % statuses.length],
        }));
    }, [familyMembersFromStore]);

    // Callbacks
    const handleNavigation = useCallback(
        (screen: string, params?: any) => {
            navigation.navigate(screen, params);
        },
        [navigation]
    );

    const handleMemberPress = useCallback(
        (member: any) => {
            Alert.alert('Member Details', `${member.name} - ${member.role}`);
        },
        []
    );

    // Quick actions with memoization
    const quickActions = useMemo(() => [
        {
            icon: 'add-circle',
            title: t('dashboard.newTask'),
            subtitle: 'Add a new task',
            onPress: () => handleNavigation('Tasks'),
        },
        {
            icon: 'calendar',
            title: t('dashboard.schedule'),
            subtitle: 'View calendar',
            onPress: () => handleNavigation('Calendar'),
        },
        {
            icon: 'ribbon',
            title: t('dashboard.goals'),
            subtitle: 'Manage goals',
            onPress: () => handleNavigation('Goals'),
        },
        {
            icon: 'warning',
            title: t('dashboard.penalties'),
            subtitle: 'View penalties',
            onPress: () => handleNavigation('Penalties'),
        },
    ], [t, handleNavigation]);

    // Performance tracking removed - using standard React hooks

    const formatTime = useCallback((totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>{t('dashboard.welcome')}</Text>
                <Text style={styles.headerSubtitle}>Family Dashboard</Text>

                {/* Stats Cards - Optimized */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{dashboardData.activeTasks.length}</Text>
                        <Text style={styles.statLabel}>Tasks</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{dashboardData.activePenalties.length}</Text>
                        <Text style={styles.statLabel}>Penalties</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{dashboardData.activeGoals.length}</Text>
                        <Text style={styles.statLabel}>Goals</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{familyMembers.length}</Text>
                        <Text style={styles.statLabel}>Members</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Family Members */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Family Members</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {familyMembers.map((member, index) => (
                        <MemoizedFamilyMemberCard
                            key={member.id}
                            member={member}
                            index={index}
                            onPress={handleMemberPress}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                        <MemoizedQuickActionCard
                            key={index}
                            icon={action.icon}
                            title={action.title}
                            subtitle={action.subtitle}
                            onPress={action.onPress}
                        />
                    ))}
                </View>
            </View>

            {/* Penalty Timer */}
            {timerState.penaltyTime > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Penalty</Text>
                    <View style={styles.penaltyCard}>
                        <Ionicons name="timer-outline" size={24} color={theme.colors.warning} />
                        <Text style={styles.penaltyText}>
                            Time remaining: {formatTime(timerState.penaltyTime)}
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

// Optimized styles with memoization
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.white,
        opacity: 0.9,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 16,
        minWidth: 70,
    },
    statNumber: {
        fontWeight: 'bold',
        color: theme.colors.white,
        fontSize: 24,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.white,
        opacity: 0.9,
        marginTop: 4,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
    },
    memberCard: {
        borderRadius: 12,
        padding: 16,
        minWidth: 140,
        position: 'relative',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    memberAvatar: {
        fontSize: 32,
        marginRight: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.white,
    },
    memberRole: {
        fontSize: 12,
        color: theme.colors.white,
        opacity: 0.8,
    },
    statusIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: (screenWidth - 60) / 2,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionGradient: {
        borderRadius: 8,
        padding: 12,
        marginRight: 12,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    actionSubtitle: {
        fontSize: 12,
        color: theme.colors.text,
        opacity: 0.7,
        marginTop: 2,
    },
    penaltyCard: {
        backgroundColor: theme.colors.warning,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    penaltyText: {
        fontSize: 16,
        color: theme.colors.white,
        fontWeight: '600',
        marginLeft: 12,
    },
});

export default OptimizedDashboardScreen;





import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PenaltiesScreen = ({ navigation }: { navigation: any }) => {
    const [jakeTime, setJakeTime] = useState(15 * 60 + 42); // 15 minutes 42 seconds
    const [emmaTime, setEmmaTime] = useState(2 * 3600 + 18 * 60 + 33); // 2h 18m 33s

    useEffect(() => {
        const penaltyTimer = setInterval(() => {
            setJakeTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
            setEmmaTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(penaltyTimer);
    }, []);

    const formatTime = (totalSeconds: number) => {
        if (totalSeconds >= 3600) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddTime = (penaltyId: string, minutes: number) => {
        if (penaltyId === 'jake') {
            setJakeTime(prevTime => prevTime + (minutes * 60));
        } else if (penaltyId === 'emma') {
            setEmmaTime(prevTime => prevTime + (minutes * 60));
        }
        Alert.alert('Time Added', `Added ${minutes} minutes to penalty`);
    };

    const handleSubtractTime = (penaltyId: string, minutes: number) => {
        if (penaltyId === 'jake') {
            setJakeTime(prevTime => Math.max(0, prevTime - (minutes * 60)));
        } else if (penaltyId === 'emma') {
            setEmmaTime(prevTime => Math.max(0, prevTime - (minutes * 60)));
        }
        Alert.alert('Time Subtracted', `Subtracted ${minutes} minutes from penalty`);
    };

    const handleEndEarly = (penaltyId: string, memberName: string) => {
        Alert.alert(
            'End Penalty Early',
            `Are you sure you want to end ${memberName}'s penalty early?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Early',
                    style: 'destructive',
                    onPress: () => {
                        if (penaltyId === 'jake') {
                            setJakeTime(0);
                        } else if (penaltyId === 'emma') {
                            setEmmaTime(0);
                        }
                        Alert.alert('Penalty Ended', `${memberName}'s penalty has been ended early`);
                    }
                }
            ]
        );
    };

    const handlePenaltyPress = (penalty: any) => {
        navigation.navigate('PenaltyDetails', { penalty });
    };

    const handleNewPenalty = () => {
        Alert.alert('New Penalty', 'Create new penalty functionality would go here');
    };

    const handleViewHistory = () => {
        Alert.alert('Penalty History', 'View penalty history functionality would go here');
    };

    const activePenalties = [
        {
            id: 'jake',
            member: 'Jake',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            penalty: 'No tablet time',
            timeRemaining: jakeTime,
            progress: 0.74,
            reason: 'Didn\'t complete homework on time',
            startTime: 'Today 3:15 PM',
            color: '#EF4444',
            bgColor: '#FEF2F2',
            borderColor: '#EF4444',
            addTimeAmount: 5,
            subtractTimeAmount: 5
        },
        {
            id: 'emma',
            member: 'Emma',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            penalty: 'No phone for evening',
            timeRemaining: emmaTime,
            progress: 0.35,
            reason: 'Used phone during family dinner',
            startTime: 'Today 6:45 PM',
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#F59E0B',
            addTimeAmount: 30,
            subtractTimeAmount: 30
        }
    ];

    const recentPenalties = [
        {
            id: '1',
            member: 'Jake',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            penalty: '30 min timeout',
            status: 'Completed 2h ago',
            duration: '30:00',
            durationType: 'Full time',
            icon: 'checkmark',
            iconColor: '#10B981',
            bgColor: '#F0FDF4',
            borderColor: '#10B981'
        },
        {
            id: '2',
            member: 'Emma',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            penalty: 'No TV before homework',
            status: 'Completed yesterday',
            duration: '45:00',
            durationType: 'Full time',
            icon: 'checkmark',
            iconColor: '#10B981',
            bgColor: '#F0FDF4',
            borderColor: '#10B981'
        },
        {
            id: '3',
            member: 'Jake',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            penalty: 'Early chores completion',
            status: 'Ended 15min early',
            duration: '15:00',
            durationType: 'Early end',
            icon: 'heart',
            iconColor: '#3B82F6',
            bgColor: '#EBF8FF',
            borderColor: '#3B82F6',
            durationTypeColor: '#10B981'
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#EF4444', '#DC2626'] as unknown as readonly [string, string, ...string[]]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Active Penalties</Text>
                        <Text style={styles.headerSubtitle}>2 penalties running</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons name="add" size={16} color="white" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Quick Stats */}
            <View style={styles.statsSection}>
                <View style={styles.card}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconBg, { backgroundColor: '#EF444410' }]}>
                                <Ionicons name="hourglass" size={24} color="#EF4444" />
                            </View>
                            <Text style={styles.statValue}>2</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconBg, { backgroundColor: '#10B98110' }]}>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconBg, { backgroundColor: '#F59E0B10' }]}>
                                <Ionicons name="time" size={24} color="#F59E0B" />
                            </View>
                            <Text style={styles.statValue}>45m</Text>
                            <Text style={styles.statLabel}>Avg Time</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Currently Active Penalties */}
            <View style={styles.activePenaltiesSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Currently Active</Text>
                        <Text style={styles.activeCount}>2 running</Text>
                    </View>

                    {activePenalties.map(penalty => (
                        <TouchableOpacity key={penalty.id} style={[styles.penaltyCard, { backgroundColor: penalty.bgColor, borderLeftColor: penalty.borderColor }]} onPress={() => handlePenaltyPress(penalty)}>
                            <View style={styles.penaltyHeader}>
                                <View style={styles.penaltyMemberInfo}>
                                    <Image source={{ uri: penalty.avatar }} style={styles.penaltyAvatar} />
                                    <View>
                                        <Text style={styles.penaltyMemberName}>{penalty.member}</Text>
                                        <Text style={styles.penaltyDescription}>{penalty.penalty}</Text>
                                    </View>
                                </View>
                                <View style={styles.penaltyTimer}>
                                    <Text style={[styles.penaltyTime, { color: penalty.color }]}>
                                        {formatTime(penalty.timeRemaining)}
                                    </Text>
                                    <Text style={styles.penaltyTimeLabel}>remaining</Text>
                                </View>
                            </View>

                            <View style={styles.penaltyProgress}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>Progress</Text>
                                    <Text style={styles.progressPercent}>{Math.round(penalty.progress * 100)}% complete</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${penalty.progress * 100}%`, backgroundColor: penalty.color }]} />
                                </View>
                            </View>

                            <View style={styles.penaltyActions}>
                                <View style={styles.timeAdjustButtons}>
                                    <TouchableOpacity
                                        style={[styles.adjustButton, { backgroundColor: '#F59E0B' }]}
                                        onPress={() => handleAddTime(penalty.id, penalty.addTimeAmount)}
                                    >
                                        <Ionicons name="add" size={12} color="white" />
                                        <Text style={styles.adjustButtonText}>+{penalty.addTimeAmount} min</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.adjustButton, { backgroundColor: '#10B981' }]}
                                        onPress={() => handleSubtractTime(penalty.id, penalty.subtractTimeAmount)}
                                    >
                                        <Ionicons name="remove" size={12} color="white" />
                                        <Text style={styles.adjustButtonText}>-{penalty.subtractTimeAmount} min</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={[styles.endEarlyButton, { backgroundColor: penalty.color }]}
                                    onPress={() => handleEndEarly(penalty.id, penalty.member)}
                                >
                                    <Text style={styles.endEarlyButtonText}>End Early</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.penaltyDetails}>
                                <Text style={styles.penaltyReason}>Reason: {penalty.reason}</Text>
                                <Text style={styles.penaltyStartTime}>Started: {penalty.startTime}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recently Completed */}
            <View style={styles.recentPenaltiesSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recently Completed</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllButton}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.recentPenaltiesList}>
                        {recentPenalties.map(penalty => (
                            <View key={penalty.id} style={[styles.recentPenaltyItem, { backgroundColor: penalty.bgColor, borderLeftColor: penalty.borderColor }]}>
                                <View style={[styles.recentPenaltyIcon, { backgroundColor: penalty.iconColor }]}>
                                    <Ionicons name={penalty.icon as any} size={16} color="white" />
                                </View>
                                <Image source={{ uri: penalty.avatar }} style={styles.recentPenaltyAvatar} />
                                <View style={styles.recentPenaltyInfo}>
                                    <Text style={styles.recentPenaltyTitle}>{penalty.penalty}</Text>
                                    <Text style={styles.recentPenaltySubtitle}>{penalty.member} • {penalty.status}</Text>
                                </View>
                                <View style={styles.recentPenaltyDuration}>
                                    <Text style={styles.recentPenaltyDurationTime}>{penalty.duration}</Text>
                                    <Text style={[styles.recentPenaltyDurationType, { color: penalty.durationTypeColor || '#9CA3AF' }]}>{penalty.durationType}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickActionButton} onPress={handleNewPenalty}>
                        <LinearGradient
                            colors={['#EF4444', '#DC2626'] as unknown as readonly [string, string, ...string[]]}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="add" size={24} color="white" />
                            </View>
                            <Text style={styles.quickActionText}>New Penalty</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton} onPress={handleViewHistory}>
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB'] as unknown as readonly [string, string, ...string[]]}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="time" size={24} color="white" />
                            </View>
                            <Text style={styles.quickActionText}>History</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom spacing for navigation */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60, // Adjusted for hidden status bar
        paddingBottom: 24,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: 8,
    },
    statsSection: {
        paddingHorizontal: 16,
        marginTop: -24, // Overlap with header
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    activePenaltiesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    activeCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    },
    penaltyCard: {
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        marginBottom: 16,
    },
    penaltyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    penaltyMemberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    penaltyAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        marginRight: 12,
    },
    penaltyMemberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    penaltyDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    penaltyTimer: {
        alignItems: 'flex-end',
    },
    penaltyTime: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    penaltyTimeLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    penaltyProgress: {
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    progressPercent: {
        fontSize: 14,
        color: '#6B7280',
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    penaltyActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeAdjustButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    adjustButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    adjustButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
        marginLeft: 4,
    },
    endEarlyButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    endEarlyButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
    penaltyDetails: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    penaltyReason: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    penaltyStartTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    recentPenaltiesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    viewAllButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    recentPenaltiesList: {
        gap: 12,
    },
    recentPenaltyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    recentPenaltyIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recentPenaltyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    recentPenaltyInfo: {
        flex: 1,
    },
    recentPenaltyTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 2,
    },
    recentPenaltySubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    recentPenaltyDuration: {
        alignItems: 'flex-end',
    },
    recentPenaltyDurationTime: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    recentPenaltyDurationType: {
        fontSize: 12,
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 80,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
    },
    quickActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionIconBg: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quickActionText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default PenaltiesScreen;




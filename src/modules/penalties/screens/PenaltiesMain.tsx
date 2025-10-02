import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePenaltiesStore } from '../store/penaltiesStore';
import PenaltyCard from '../components/PenaltyCard';
import { penaltyCategories, penaltyReasons } from '../mock/penaltiesData';

interface PenaltiesMainProps {
    navigation: any;
}

const PenaltiesMain: React.FC<PenaltiesMainProps> = ({ navigation }) => {
    const {
        penalties,
        familyMembers,
        addPenalty,
        endPenalty,
        adjustTime,
        updatePenaltyTimer,
        getActivePenalties,
        getStats
    } = usePenaltiesStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newPenalty, setNewPenalty] = useState({
        memberId: '',
        memberName: '',
        memberAvatar: '',
        reason: '',
        duration: 15,
        remaining: 15,
        isActive: true,
        category: 'behavior' as const,
        createdBy: 'mom'
    });

    const activePenalties = getActivePenalties();
    const stats = getStats();

    // Update timers every minute
    useEffect(() => {
        const interval = setInterval(() => {
            activePenalties.forEach(penalty => {
                if (penalty.remaining > 0) {
                    updatePenaltyTimer(penalty.id);
                }
            });
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [activePenalties, updatePenaltyTimer]);

    const handleAddPenalty = () => {
        if (!newPenalty.memberId || !newPenalty.reason) {
            Alert.alert('Error', 'Please select a family member and enter a reason.');
            return;
        }

        addPenalty(newPenalty);
        setShowAddModal(false);
        setNewPenalty({
            memberId: '',
            memberName: '',
            memberAvatar: '',
            reason: '',
            duration: 15,
            remaining: 15,
            isActive: true,
            category: 'behavior',
            createdBy: 'mom'
        });
    };

    const handleEndPenalty = (id: string) => {
        Alert.prompt(
            'End Penalty',
            'Would you like to add a reflection about what was learned?',
            [
                { text: 'Skip', onPress: () => endPenalty(id) },
                {
                    text: 'Add Reflection',
                    onPress: (reflection?: string) => endPenalty(id, reflection)
                }
            ],
            'plain-text',
            '',
            'default'
        );
    };

    const selectMember = (member: any) => {
        setNewPenalty({
            ...newPenalty,
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Active Penalties</Text>
                        <Text style={styles.headerSubtitle}>
                            {stats.activePenalties} active • {stats.completedPenalties} completed
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('PenaltyHistory')}
                    >
                        <Ionicons name="time" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.activePenalties}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.averageDuration}m</Text>
                    <Text style={styles.statLabel}>Avg Duration</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{Math.floor(stats.totalTimeServed / 60)}h</Text>
                    <Text style={styles.statLabel}>Time Served</Text>
                </View>
            </View>

            {/* Active Penalties List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activePenalties.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                        <Text style={styles.emptyTitle}>No Active Penalties</Text>
                        <Text style={styles.emptySubtitle}>
                            Great job! Everyone is following the rules.
                        </Text>
                    </View>
                ) : (
                    activePenalties.map((penalty) => (
                        <PenaltyCard
                            key={penalty.id}
                            penalty={penalty}
                            onAdjustTime={adjustTime}
                            onEndEarly={handleEndPenalty}
                            onPress={(id) => navigation.navigate('PenaltyDetails', { penaltyId: id })}
                        />
                    ))
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Add Penalty Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Penalty</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Select Member */}
                        <Text style={styles.sectionTitle}>Select Family Member</Text>
                        <View style={styles.memberGrid}>
                            {familyMembers.filter(m => m.role !== 'parent').map((member) => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[
                                        styles.memberOption,
                                        newPenalty.memberId === member.id && styles.memberSelected
                                    ]}
                                    onPress={() => selectMember(member)}
                                >
                                    <Text style={styles.memberEmoji}>
                                        {member.name === 'Ariella' ? '👧' : '👦'}
                                    </Text>
                                    <Text style={styles.memberOptionName}>{member.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Quick Reasons */}
                        <Text style={styles.sectionTitle}>Quick Reasons</Text>
                        <View style={styles.reasonsGrid}>
                            {penaltyReasons.slice(0, 6).map((reason) => (
                                <TouchableOpacity
                                    key={reason}
                                    style={[
                                        styles.reasonOption,
                                        newPenalty.reason === reason && styles.reasonSelected
                                    ]}
                                    onPress={() => setNewPenalty({ ...newPenalty, reason })}
                                >
                                    <Text style={styles.reasonText}>{reason}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Duration */}
                        <Text style={styles.sectionTitle}>Duration</Text>
                        <View style={styles.durationOptions}>
                            {[10, 15, 20, 30].map((duration) => (
                                <TouchableOpacity
                                    key={duration}
                                    style={[
                                        styles.durationOption,
                                        newPenalty.duration === duration && styles.durationSelected
                                    ]}
                                    onPress={() => setNewPenalty({ ...newPenalty, duration })}
                                >
                                    <Text style={styles.durationText}>{duration}m</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Add Button */}
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddPenalty}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.addButtonGradient}
                            >
                                <Text style={styles.addButtonText}>Add Penalty</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        marginTop: 16,
    },
    memberGrid: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    memberOption: {
        minWidth: 80,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
        marginBottom: 8,
    },
    memberSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3F4F6',
    },
    memberEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    memberOptionName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    reasonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    reasonOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    reasonSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3F4F6',
    },
    reasonText: {
        fontSize: 14,
        color: '#374151',
    },
    durationOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    durationOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    durationSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3F4F6',
    },
    durationText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    addButton: {
        marginTop: 16,
        borderRadius: 12,
    },
    addButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default PenaltiesMain;

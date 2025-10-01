import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePenalties } from '../hooks/usePenalties';

interface PenaltyDetailsProps {
    navigation: any;
    route: {
        params: {
            penaltyId: string;
        };
    };
}

const PenaltyDetails: React.FC<PenaltyDetailsProps> = ({ navigation, route }) => {
    const { penaltyId } = route.params;
    const {
        getPenaltyById,
        addTimeToPenalty,
        subtractTimeFromPenalty,
        endPenaltyEarly,
        togglePenaltyPause,
        formatTimeRemaining,
        formatDuration,
        addReflection
    } = usePenalties();

    const penalty = getPenaltyById(penaltyId);
    const [reflectionText, setReflectionText] = useState('');
    const [learnedItems, setLearnedItems] = useState<string[]>([]);
    const [parentNote, setParentNote] = useState('Jake showed good understanding about the importance of completing homework first. Consider reducing future penalties if behavior improves.');

    const learnedOptions = [
        'Do homework right after school',
        'Ask for help when I don\'t understand',
        'Set a timer for homework time',
        'Take breaks between subjects',
        'Ask parents to check my work',
        'Use a quiet study space'
    ];

    useEffect(() => {
        if (!penalty) {
            Alert.alert('Error', 'Penalty not found');
            navigation.goBack();
        }
    }, [penalty, navigation]);

    if (!penalty) {
        return null;
    }

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddTime = () => {
        addTimeToPenalty(penaltyId, 5);
    };

    const handleSubtractTime = () => {
        subtractTimeFromPenalty(penaltyId, 5);
    };

    const handleEndEarly = () => {
        Alert.alert(
            'End Penalty Early',
            'Are you sure you want to end this penalty early?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Early',
                    style: 'destructive',
                    onPress: () => {
                        endPenaltyEarly(penaltyId);
                        Alert.alert('Success', 'Penalty ended early');
                    }
                }
            ]
        );
    };

    const handleTogglePause = () => {
        togglePenaltyPause(penaltyId);
    };

    const handleSaveReflection = () => {
        if (!reflectionText.trim()) {
            Alert.alert('Error', 'Please enter your reflection');
            return;
        }

        const reflectionData = {
            penaltyId: penaltyId,
            memberId: penalty.memberId,
            memberName: penalty.memberName,
            memberAvatar: penalty.memberAvatar,
            penaltyTitle: penalty.penaltyType,
            reflectionText: reflectionText.trim(),
            learnedItems: learnedItems
        };

        addReflection(reflectionData);
        Alert.alert('Success', 'Reflection saved successfully!');
        setReflectionText('');
        setLearnedItems([]);
    };

    const toggleLearnedItem = (item: string) => {
        setLearnedItems(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    const isPenaltyComplete = penalty.status === 'completed';
    const isPenaltyActive = penalty.status === 'active';

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Active Penalty</Text>
                        <Text style={styles.headerSubtitle}>Penalty Details</Text>
                    </View>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="hourglass" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Penalty Member Info */}
            <View style={styles.memberSection}>
                <View style={styles.memberCard}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.memberAvatar, { borderColor: penalty.color }]}>
                            <Text style={styles.memberAvatarText}>
                                {penalty.memberName.charAt(0)}
                            </Text>
                        </View>
                        {isPenaltyActive && (
                            <View style={styles.activeBadge}>
                                <Ionicons name="ban" size={16} color="white" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.memberName}>{penalty.memberName}</Text>
                    <Text style={styles.memberAge}>{penalty.memberAge} years old</Text>
                    <View style={styles.penaltyStatusBadge}>
                        <Text style={styles.penaltyStatusText}>Currently serving penalty</Text>
                    </View>
                </View>
            </View>

            {/* Penalty Details */}
            <View style={styles.detailsSection}>
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>Penalty Details</Text>
                        <View style={[styles.statusBadge, { backgroundColor: penalty.color }]}>
                            <Text style={styles.statusBadgeText}>ACTIVE</Text>
                        </View>
                    </View>

                    <View style={styles.penaltyInfo}>
                        <View style={styles.penaltyTypeRow}>
                            <View style={[styles.penaltyIcon, { backgroundColor: penalty.color }]}>
                                <Ionicons name={penalty.icon as any} size={20} color="white" />
                            </View>
                            <Text style={styles.penaltyType}>{penalty.penaltyType}</Text>
                        </View>

                        <Text style={styles.penaltyDescription}>{penalty.description}</Text>

                        <View style={styles.penaltyDetails}>
                            <Text style={styles.detailItem}>Reason: {penalty.reason}</Text>
                            <Text style={styles.detailItem}>Started: {penalty.startedAt}</Text>
                            <Text style={styles.detailItem}>Duration: {formatDuration(penalty.duration)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Countdown Timer Section */}
            {isPenaltyActive && (
                <View style={styles.timerSection}>
                    <View style={styles.timerCard}>
                        <View style={styles.timerDisplay}>
                            <Text style={[styles.timerText, { color: penalty.color }]}>
                                {formatTimeRemaining(penalty.remainingTime)}
                            </Text>
                            <Text style={styles.timerLabel}>remaining</Text>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressText}>{Math.round(penalty.progress)}% complete</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${penalty.progress}%`,
                                            backgroundColor: penalty.color
                                        }
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={styles.timerActions}>
                            <TouchableOpacity style={styles.pauseButton} onPress={handleTogglePause}>
                                <Ionicons name="pause" size={16} color="white" />
                                <Text style={styles.pauseButtonText}>Pause</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.infoButton}>
                                <Ionicons name="information-circle" size={16} color="#3B82F6" />
                                <Text style={styles.infoButtonText}>Info</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Penalty Complete Banner */}
            {isPenaltyComplete && (
                <View style={styles.completeBanner}>
                    <Ionicons name="checkmark-circle" size={48} color="white" />
                    <Text style={styles.completeTitle}>Penalty Complete!</Text>
                    <Text style={styles.completeSubtitle}>
                        {penalty.memberName} can now use his tablet again
                    </Text>
                </View>
            )}

            {/* Reflection Section */}
            <View style={styles.reflectionSection}>
                <View style={styles.reflectionCard}>
                    <View style={styles.reflectionHeader}>
                        <Ionicons name="bulb" size={24} color="#F59E0B" />
                        <Text style={styles.reflectionTitle}>Reflection Time</Text>
                    </View>

                    <View style={styles.reflectionInput}>
                        <Text style={styles.inputLabel}>What did you learn from this?</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="I learned that I should..."
                            value={reflectionText}
                            onChangeText={setReflectionText}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.learnedItemsSection}>
                        <Text style={styles.inputLabel}>How will you do better next time?</Text>
                        <View style={styles.learnedItemsList}>
                            {learnedOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.learnedItem,
                                        learnedItems.includes(option) && styles.learnedItemSelected
                                    ]}
                                    onPress={() => toggleLearnedItem(option)}
                                >
                                    <Ionicons
                                        name={learnedItems.includes(option) ? "checkmark-circle" : "ellipse-outline"}
                                        size={20}
                                        color={learnedItems.includes(option) ? "#10B981" : "#6B7280"}
                                    />
                                    <Text style={[
                                        styles.learnedItemText,
                                        learnedItems.includes(option) && styles.learnedItemTextSelected
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            reflectionText.trim() && styles.saveButtonActive
                        ]}
                        onPress={handleSaveReflection}
                    >
                        <Ionicons name="save" size={16} color="white" />
                        <Text style={styles.saveButtonText}>Save Reflection</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Parent Actions */}
            <View style={styles.parentActionsSection}>
                <View style={styles.parentActionsCard}>
                    <Text style={styles.parentActionsTitle}>Parent Actions</Text>

                    <View style={styles.parentActionsButtons}>
                        <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                            <Ionicons name="add-circle" size={20} color="white" />
                            <Text style={styles.addTimeButtonText}>Add Time</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.endEarlyButton} onPress={handleEndEarly}>
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                            <Text style={styles.endEarlyButtonText}>End Early</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.parentNoteCard}>
                        <View style={styles.parentNoteHeader}>
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <Text style={styles.parentNoteTitle}>Parent Note</Text>
                        </View>
                        <Text style={styles.parentNoteText}>{parentNote}</Text>
                    </View>
                </View>
            </View>

            {/* Bottom spacing */}
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
        paddingTop: 60,
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
        flex: 1,
        marginHorizontal: 16,
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
    memberSection: {
        paddingHorizontal: 16,
        marginTop: -20,
    },
    memberCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    memberAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
    },
    memberAvatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    activeBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    memberAge: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 12,
    },
    penaltyStatusBadge: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    penaltyStatusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    detailsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    detailsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    penaltyInfo: {
        gap: 12,
    },
    penaltyTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    penaltyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    penaltyType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    penaltyDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    penaltyDetails: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        gap: 4,
    },
    detailItem: {
        fontSize: 14,
        color: '#374151',
    },
    timerSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    timerCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    timerDisplay: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    timerLabel: {
        fontSize: 16,
        color: '#6B7280',
    },
    progressSection: {
        width: '100%',
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    progressFill: {
        height: 8,
        borderRadius: 4,
    },
    timerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    pauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    pauseButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    infoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    infoButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    completeBanner: {
        backgroundColor: '#10B981',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    completeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 12,
        marginBottom: 4,
    },
    completeSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    reflectionSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    reflectionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    reflectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    reflectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    reflectionInput: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#374151',
        textAlignVertical: 'top',
        minHeight: 80,
    },
    learnedItemsSection: {
        marginBottom: 16,
    },
    learnedItemsList: {
        gap: 8,
    },
    learnedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    learnedItemSelected: {
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    learnedItemText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    learnedItemTextSelected: {
        color: '#374151',
        fontWeight: '500',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonActive: {
        backgroundColor: '#10B981',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    parentActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    parentActionsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    parentActionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
    },
    parentActionsButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    addTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    addTimeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    endEarlyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    endEarlyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    parentNoteCard: {
        backgroundColor: '#EBF8FF',
        borderWidth: 1,
        borderColor: '#3B82F6',
        padding: 12,
        borderRadius: 8,
    },
    parentNoteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    parentNoteTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    parentNoteText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 80,
    },
});

export default PenaltyDetails;

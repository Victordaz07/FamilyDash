import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePenaltiesStore } from '../store/penaltiesStore';
import PenaltyTimer from '../components/PenaltyTimer';

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
        adjustTime,
        endPenalty,
        addReflection,
        updatePenaltyTimer
    } = usePenaltiesStore();

    const [reflectionText, setReflectionText] = useState('');
    const penalty = getPenaltyById(penaltyId);

    useEffect(() => {
        if (penalty?.reflection) {
            setReflectionText(penalty.reflection);
        }
    }, [penalty?.reflection]);

    // Update timer every second for this penalty
    useEffect(() => {
        if (!penalty?.isActive) return;

        const interval = setInterval(() => {
            if (penalty.remaining > 0) {
                updatePenaltyTimer();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [penalty, updatePenaltyTimer]);

    if (!penalty) {
        return (
            <View style={styles.container}>
                <Text>Penalty not found</Text>
            </View>
        );
    }

    const handleEndPenalty = () => {
        Alert.alert(
            'End Penalty',
            `Are you sure you want to end ${penalty.memberName}'s penalty?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Penalty',
                    style: 'destructive',
                    onPress: () => {
                        endPenalty(penalty.id, reflectionText || undefined);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const handleSaveReflection = () => {
        if (reflectionText.trim()) {
            addReflection(penalty.id, reflectionText.trim());
            Alert.alert('Saved', 'Reflection has been saved.');
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const getCategoryColor = () => {
        const colors = {
            behavior: '#EF4444',
            chores: '#F59E0B',
            screen_time: '#8B5CF6',
            homework: '#3B82F6',
            other: '#6B7280'
        };
        return colors[penalty.category] || colors.other;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[getCategoryColor(), getCategoryColor() + 'CC']}
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
                        <Text style={styles.headerTitle}>{penalty.memberName}'s Penalty</Text>
                        <Text style={styles.headerSubtitle}>
                            {penalty.isActive ? 'Active' : 'Completed'}
                        </Text>
                    </View>

                    <View style={styles.placeholder} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Timer Section */}
                <View style={styles.timerSection}>
                    <PenaltyTimer
                        remainingMinutes={penalty.remaining}
                        totalMinutes={penalty.duration}
                        size={200}
                        strokeWidth={12}
                    />

                    <View style={styles.timerInfo}>
                        <Text style={styles.reasonText}>{penalty.reason}</Text>
                        <Text style={styles.categoryText}>
                            {penalty.category.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Penalty Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Started:</Text>
                        <Text style={styles.detailValue}>{formatTime(penalty.startTime)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Duration:</Text>
                        <Text style={styles.detailValue}>{penalty.duration} minutes</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Remaining:</Text>
                        <Text style={[styles.detailValue, { color: getCategoryColor() }]}>
                            {penalty.remaining} minutes
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Assigned by:</Text>
                        <Text style={styles.detailValue}>{penalty.createdBy}</Text>
                    </View>

                    {penalty.endTime && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Completed:</Text>
                            <Text style={styles.detailValue}>{formatTime(penalty.endTime)}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                {penalty.isActive && (
                    <View style={styles.actionsCard}>
                        <Text style={styles.cardTitle}>Actions</Text>

                        <View style={styles.timeAdjustments}>
                            <TouchableOpacity
                                style={[styles.adjustButton, { borderColor: '#10B981' }]}
                                onPress={() => adjustTime(penalty.id, -5)}
                            >
                                <Ionicons name="remove" size={20} color="#10B981" />
                                <Text style={[styles.adjustText, { color: '#10B981' }]}>-5 min</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.adjustButton, { borderColor: '#EF4444' }]}
                                onPress={() => adjustTime(penalty.id, 5)}
                            >
                                <Ionicons name="add" size={20} color="#EF4444" />
                                <Text style={[styles.adjustText, { color: '#EF4444' }]}>+5 min</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.endButton}
                            onPress={handleEndPenalty}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.endButtonGradient}
                            >
                                <Ionicons name="checkmark" size={20} color="white" />
                                <Text style={styles.endButtonText}>End Penalty Early</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reflection Section */}
                <View style={styles.reflectionCard}>
                    <Text style={styles.cardTitle}>
                        {penalty.isActive ? 'Add Reflection' : 'Reflection'}
                    </Text>

                    <TextInput
                        style={styles.reflectionInput}
                        placeholder="What did you learn from this experience?"
                        multiline
                        numberOfLines={4}
                        value={reflectionText}
                        onChangeText={setReflectionText}
                        editable={penalty.isActive || !penalty.reflection}
                    />

                    {penalty.isActive && (
                        <TouchableOpacity
                            style={styles.saveReflectionButton}
                            onPress={handleSaveReflection}
                        >
                            <Text style={styles.saveReflectionText}>Save Reflection</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    timerSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    timerInfo: {
        alignItems: 'center',
        marginTop: 24,
    },
    reasonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        letterSpacing: 1,
    },
    detailsCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    actionsCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    timeAdjustments: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    adjustButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        backgroundColor: 'white',
    },
    adjustText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    endButton: {
        borderRadius: 12,
    },
    endButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    endButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    reflectionCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 32,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    reflectionInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
        backgroundColor: '#F9FAFB',
    },
    saveReflectionButton: {
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
        alignItems: 'center',
    },
    saveReflectionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PenaltyDetails;
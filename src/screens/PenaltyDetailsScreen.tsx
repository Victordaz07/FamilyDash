import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PenaltyDetailsScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const { penalty } = route.params || {}; // Get penalty details from navigation params

    const [timeRemaining, setTimeRemaining] = useState(15 * 60 + 42); // 15 minutes 42 seconds
    const [totalTime] = useState(20 * 60); // 20 minutes total
    const [isCompleted, setIsCompleted] = useState(false);
    const [reflectionText, setReflectionText] = useState('');
    const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
    const [isReflectionSaved, setIsReflectionSaved] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    setIsCompleted(true);
                    return 0;
                }
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        return ((totalTime - timeRemaining) / totalTime) * 100;
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handlePause = () => {
        Alert.alert('Pause Penalty', 'Penalty timer paused');
    };

    const handleInfo = () => {
        Alert.alert('Penalty Info', 'Additional information about this penalty');
    };

    const handleAddTime = () => {
        Alert.alert(
            'Add Time',
            'How many minutes would you like to add?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: '+5 min', onPress: () => setTimeRemaining(prev => prev + 5 * 60) },
                { text: '+10 min', onPress: () => setTimeRemaining(prev => prev + 10 * 60) },
                { text: '+15 min', onPress: () => setTimeRemaining(prev => prev + 15 * 60) }
            ]
        );
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
                        setTimeRemaining(0);
                        setIsCompleted(true);
                        Alert.alert('Penalty Ended', 'Penalty has been ended early');
                    }
                }
            ]
        );
    };

    const handleImprovementToggle = (improvement: string) => {
        setSelectedImprovements(prev =>
            prev.includes(improvement)
                ? prev.filter(item => item !== improvement)
                : [...prev, improvement]
        );
    };

    const handleSaveReflection = () => {
        if (reflectionText.trim() || selectedImprovements.length > 0) {
            setIsReflectionSaved(true);
            Alert.alert('Reflection Saved', 'Great job on reflecting!');
            setTimeout(() => setIsReflectionSaved(false), 2000);
        } else {
            Alert.alert('Empty Reflection', 'Please add some thoughts or select improvements');
        }
    };

    // Mock data for demonstration
    const currentPenalty = penalty || {
        id: 'jake-tablet-penalty',
        member: 'Jake',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        age: '8 years old',
        penalty: 'No Tablet Time',
        description: 'Jake cannot use his tablet or any screen devices during this penalty period.',
        reason: 'Didn\'t complete homework',
        startTime: 'Today 4:18 PM',
        duration: '20 minutes',
        icon: 'tablet-portrait',
        color: '#EF4444',
        bgColor: '#FEF2F2',
        borderColor: '#EF4444'
    };

    const improvements = [
        'Do homework right after school',
        'Ask for help when I don\'t understand',
        'Set a timer for homework time'
    ];

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
                    <View style={styles.headerButton}>
                        <Ionicons name="hourglass" size={20} color="white" />
                    </View>
                </View>
            </LinearGradient>

            {/* Penalty Member Info */}
            <View style={styles.memberInfoSection}>
                <View style={styles.card}>
                    <View style={styles.memberInfoContent}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: currentPenalty.avatar }}
                                style={[styles.memberAvatar, { borderColor: currentPenalty.borderColor }]}
                            />
                            <View style={[styles.penaltyBadge, { backgroundColor: currentPenalty.color }]}>
                                <Ionicons name="ban" size={16} color="white" />
                            </View>
                        </View>
                        <Text style={styles.memberName}>{currentPenalty.member}</Text>
                        <Text style={styles.memberAge}>{currentPenalty.age}</Text>
                        <View style={[styles.penaltyStatus, { backgroundColor: currentPenalty.bgColor, borderColor: currentPenalty.borderColor }]}>
                            <Text style={[styles.penaltyStatusText, { color: currentPenalty.color }]}>
                                Currently serving penalty
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Penalty Details */}
            <View style={styles.penaltyDetailsSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Penalty Details</Text>
                        <View style={[styles.activeBadge, { backgroundColor: currentPenalty.color }]}>
                            <Text style={styles.activeBadgeText}>ACTIVE</Text>
                        </View>
                    </View>

                    <View style={styles.penaltyInfo}>
                        <View style={styles.penaltyHeader}>
                            <View style={[styles.penaltyIconBg, { backgroundColor: currentPenalty.color }]}>
                                <Ionicons name={currentPenalty.icon as any} size={20} color="white" />
                            </View>
                            <View style={styles.penaltyTextContent}>
                                <Text style={styles.penaltyTitle}>{currentPenalty.penalty}</Text>
                                <Text style={styles.penaltyDescription}>{currentPenalty.description}</Text>
                            </View>
                        </View>

                        <View style={styles.penaltyMeta}>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Reason:</Text>
                                <Text style={styles.metaValue}>{currentPenalty.reason}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Started:</Text>
                                <Text style={styles.metaValue}>{currentPenalty.startTime}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Duration:</Text>
                                <Text style={styles.metaValue}>{currentPenalty.duration}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Countdown Timer */}
            <View style={styles.timerSection}>
                {isCompleted ? (
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.completedCard}
                    >
                        <View style={styles.completedContent}>
                            <Ionicons name="checkmark-circle" size={48} color="white" />
                            <Text style={styles.completedTitle}>Penalty Complete!</Text>
                            <Text style={styles.completedSubtitle}>{currentPenalty.member} can now use his tablet again</Text>
                        </View>
                    </LinearGradient>
                ) : (
                    <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        style={styles.timerCard}
                    >
                        <View style={styles.timerContent}>
                            <Text style={styles.timerTitle}>Time Remaining</Text>
                            <View style={styles.timerDisplay}>
                                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                                <Text style={styles.timerSubtext}>minutes:seconds</Text>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>Progress</Text>
                                    <Text style={styles.progressValue}>{Math.round(getProgress())}%</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
                                </View>
                            </View>

                            <View style={styles.timerActions}>
                                <TouchableOpacity style={styles.timerActionButton} onPress={handlePause}>
                                    <Ionicons name="pause" size={16} color="white" />
                                    <Text style={styles.timerActionText}>Pause</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.timerActionButton} onPress={handleInfo}>
                                    <Ionicons name="information-circle" size={16} color="white" />
                                    <Text style={styles.timerActionText}>Info</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                )}
            </View>

            {/* Reflection Section */}
            <View style={styles.reflectionSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.reflectionIconBg}>
                            <Ionicons name="bulb" size={24} color="white" />
                        </View>
                        <Text style={styles.sectionTitle}>Reflection Time</Text>
                    </View>

                    <View style={styles.reflectionContent}>
                        <View style={styles.reflectionQuestion}>
                            <Text style={styles.questionLabel}>What did you learn from this?</Text>
                            <TextInput
                                style={styles.reflectionInput}
                                value={reflectionText}
                                onChangeText={setReflectionText}
                                placeholder="I learned that I should..."
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.improvementsSection}>
                            <Text style={styles.questionLabel}>How will you do better next time?</Text>
                            <View style={styles.improvementsList}>
                                {improvements.map((improvement, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.improvementItem}
                                        onPress={() => handleImprovementToggle(improvement)}
                                    >
                                        <View style={[
                                            styles.checkbox,
                                            selectedImprovements.includes(improvement) && styles.checkboxChecked
                                        ]}>
                                            {selectedImprovements.includes(improvement) && (
                                                <Ionicons name="checkmark" size={12} color="white" />
                                            )}
                                        </View>
                                        <Text style={styles.improvementText}>{improvement}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.saveReflectionButton,
                                isReflectionSaved && styles.saveReflectionButtonSaved
                            ]}
                            onPress={handleSaveReflection}
                        >
                            <Ionicons
                                name={isReflectionSaved ? "checkmark" : "save"}
                                size={16}
                                color="white"
                            />
                            <Text style={styles.saveReflectionText}>
                                {isReflectionSaved ? 'Reflection Saved!' : 'Save Reflection'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Parent Actions */}
            <View style={styles.parentActionsSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Parent Actions</Text>

                    <View style={styles.parentActionsGrid}>
                        <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                            <Ionicons name="add-circle" size={24} color="white" />
                            <Text style={styles.parentActionText}>Add Time</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.endEarlyButton} onPress={handleEndEarly}>
                            <Ionicons name="checkmark-circle" size={24} color="white" />
                            <Text style={styles.parentActionText}>End Early</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.parentNote}>
                        <View style={styles.parentNoteHeader}>
                            <Ionicons name="information-circle" size={16} color="#3B82F6" />
                            <Text style={styles.parentNoteTitle}>Parent Note</Text>
                        </View>
                        <Text style={styles.parentNoteText}>
                            {currentPenalty.member} showed good understanding about the importance of completing homework first.
                            Consider reducing future penalties if behavior improves.
                        </Text>
                    </View>
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
    memberInfoSection: {
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
    memberInfoContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    memberAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
    },
    penaltyBadge: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    memberAge: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    penaltyStatus: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        width: '100%',
        alignItems: 'center',
    },
    penaltyStatusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    penaltyDetailsSection: {
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
    activeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    activeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    penaltyInfo: {
        gap: 16,
    },
    penaltyHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    penaltyIconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    penaltyTextContent: {
        flex: 1,
    },
    penaltyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    penaltyDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    penaltyMeta: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    timerSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    timerCard: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    completedCard: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    timerContent: {
        alignItems: 'center',
    },
    completedContent: {
        alignItems: 'center',
    },
    timerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    completedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    timerDisplay: {
        alignItems: 'center',
        marginBottom: 16,
    },
    timerText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    timerSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    completedSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    progressContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: 'white',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    progressBar: {
        width: '100%',
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 6,
    },
    timerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    timerActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    timerActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    reflectionSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    reflectionIconBg: {
        width: 40,
        height: 40,
        backgroundColor: '#F59E0B',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reflectionContent: {
        gap: 16,
    },
    reflectionQuestion: {
        gap: 8,
    },
    questionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    reflectionInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#374151',
        backgroundColor: 'white',
        minHeight: 80,
    },
    improvementsSection: {
        gap: 8,
    },
    improvementsList: {
        gap: 8,
    },
    improvementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    improvementText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    saveReflectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    saveReflectionButtonSaved: {
        backgroundColor: '#10B981',
    },
    saveReflectionText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    parentActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 80,
    },
    parentActionsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    addTimeButton: {
        flex: 1,
        backgroundColor: '#F59E0B',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    endEarlyButton: {
        flex: 1,
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    parentActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    parentNote: {
        backgroundColor: '#EBF8FF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    parentNoteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    parentNoteTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3B82F6',
    },
    parentNoteText: {
        fontSize: 14,
        color: '#6B7280',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default PenaltyDetailsScreen;





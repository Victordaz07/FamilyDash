import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRoom } from '../hooks/useSafeRoom';
import FeelingCard from '../components/FeelingCard';
import ResourceCard from '../components/ResourceCard';
import StickyNote from '../components/StickyNote';

interface SafeRoomTabsProps {
    navigation: any;
    route: any;
}

const SafeRoomTabs: React.FC<SafeRoomTabsProps> = ({ navigation, route }) => {
    const { initialTab = 'express' } = route.params || {};
    const [activeTab, setActiveTab] = useState<'express' | 'reflections' | 'guided' | 'board'>(initialTab);

    const {
        feelings,
        resources,
        solutionNotes,
        selectedMood,
        newFeelingText,
        isRecording,
        setSelectedMood,
        setNewFeelingText,
        addFeeling,
        addReaction,
        addSolutionNote,
        toggleSolutionNote,
        deleteSolutionNote,
        startRecording,
        stopRecording,
        getRecentFeelings,
        getActiveSolutionNotes,
        getCompletedSolutionNotes,
        moodEmojis,
        moodColors
    } = useSafeRoom();

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddFeeling = () => {
        if (!newFeelingText.trim()) {
            Alert.alert('Error', 'Please write something before sharing');
            return;
        }
        addFeeling('text', newFeelingText, selectedMood);
        setNewFeelingText('');
    };

    const handleAddSolutionNote = () => {
        if (!newFeelingText.trim()) {
            Alert.alert('Error', 'Please write an agreement');
            return;
        }
        const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#DDA0DD', '#F0E68C'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        addSolutionNote(newFeelingText, randomColor);
        setNewFeelingText('');
    };

    const handleResourcePress = (resource: any) => {
        Alert.alert('Resource', `Opening ${resource.title}`);
    };

    const tabs = [
        { id: 'express', label: 'Express', icon: 'heart-outline' },
        { id: 'reflections', label: 'Reflections', icon: 'people-outline' },
        { id: 'guided', label: 'Guided', icon: 'book-outline' },
        { id: 'board', label: 'Board', icon: 'bulb-outline' }
    ];

    const moods = [
        { id: 'happy', emoji: '😃', label: 'Happy' },
        { id: 'excited', emoji: '🤩', label: 'Excited' },
        { id: 'neutral', emoji: '😐', label: 'Neutral' },
        { id: 'worried', emoji: '😟', label: 'Worried' },
        { id: 'sad', emoji: '😢', label: 'Sad' },
        { id: 'angry', emoji: '😡', label: 'Angry' }
    ];

    const renderExpressTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Mood Selector */}
            <View style={styles.moodSection}>
                <Text style={styles.sectionTitle}>How are you feeling?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScrollView}>
                    {moods.map((mood) => (
                        <TouchableOpacity
                            key={mood.id}
                            style={[
                                styles.moodOption,
                                { backgroundColor: selectedMood === mood.id ? moodColors[mood.id as keyof typeof moodColors] : '#F3F4F6' }
                            ]}
                            onPress={() => setSelectedMood(mood.id as any)}
                        >
                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                            <Text style={[
                                styles.moodLabel,
                                { color: selectedMood === mood.id ? 'white' : '#374151' }
                            ]}>
                                {mood.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Expression Methods */}
            <View style={styles.methodsSection}>
                <Text style={styles.sectionTitle}>How would you like to express yourself?</Text>

                <View style={styles.methodsGrid}>
                    <TouchableOpacity style={styles.methodCard}>
                        <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.methodGradient}>
                            <Ionicons name="chatbubble-outline" size={24} color="white" />
                            <Text style={styles.methodLabel}>Text</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.methodCard}
                        onPress={isRecording ? stopRecording : startRecording}
                    >
                        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.methodGradient}>
                            <Ionicons name={isRecording ? "stop" : "mic-outline"} size={24} color="white" />
                            <Text style={styles.methodLabel}>{isRecording ? 'Stop' : 'Voice'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.methodCard}>
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.methodGradient}>
                            <Ionicons name="videocam-outline" size={24} color="white" />
                            <Text style={styles.methodLabel}>Video</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Text Input */}
            <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Share your feelings</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="What's on your heart? Share it with your family..."
                        value={newFeelingText}
                        onChangeText={setNewFeelingText}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={handleAddFeeling}>
                    <LinearGradient colors={['#FF6B9D', '#FF8E9B']} style={styles.shareButtonGradient}>
                        <Ionicons name="heart" size={20} color="white" />
                        <Text style={styles.shareButtonText}>Share with Family</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Safety Message */}
            <View style={styles.safetyMessage}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text style={styles.safetyText}>No one will judge you here. This is a safe space.</Text>
            </View>
        </ScrollView>
    );

    const renderReflectionsTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.reflectionsHeader}>
                <Text style={styles.sectionTitle}>Family Reflections</Text>
                <Text style={styles.reflectionsSubtitle}>Support each other with love</Text>
            </View>

            {getRecentFeelings().map((feeling) => (
                <FeelingCard
                    key={feeling.id}
                    feeling={feeling}
                    onReaction={addReaction}
                    onSupport={(feelingId) => addReaction(feelingId, 'support')}
                />
            ))}

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );

    const renderGuidedTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.guidedHeader}>
                <Text style={styles.sectionTitle}>Guided Help</Text>
                <Text style={styles.guidedSubtitle}>Learn and grow together</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourcesScrollView}>
                {resources.map((resource) => (
                    <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onPress={handleResourcePress}
                    />
                ))}
            </ScrollView>

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );

    const renderBoardTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.boardHeader}>
                <Text style={styles.sectionTitle}>Solutions Board</Text>
                <Text style={styles.boardSubtitle}>Family agreements & commitments</Text>
            </View>

            {/* Add New Agreement */}
            <View style={styles.addAgreementSection}>
                <TextInput
                    style={styles.agreementInput}
                    placeholder="Add a new family agreement..."
                    value={newFeelingText}
                    onChangeText={setNewFeelingText}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddSolutionNote}>
                    <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Active Agreements */}
            <Text style={styles.subsectionTitle}>Active Agreements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesScrollView}>
                {getActiveSolutionNotes().map((note) => (
                    <StickyNote
                        key={note.id}
                        note={note}
                        onToggle={toggleSolutionNote}
                        onDelete={deleteSolutionNote}
                    />
                ))}
            </ScrollView>

            {/* Completed Agreements */}
            <Text style={styles.subsectionTitle}>Completed Agreements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesScrollView}>
                {getCompletedSolutionNotes().map((note) => (
                    <StickyNote
                        key={note.id}
                        note={note}
                        onToggle={toggleSolutionNote}
                        onDelete={deleteSolutionNote}
                    />
                ))}
            </ScrollView>

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#FF6B9D', '#FF8E9B']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Safe Room</Text>
                        <Text style={styles.headerSubtitle}>Emotional Support Space</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons name="heart" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tab,
                                activeTab === tab.id && styles.activeTab
                            ]}
                            onPress={() => setActiveTab(tab.id as any)}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={activeTab === tab.id ? '#FF6B9D' : '#9CA3AF'}
                            />
                            <Text style={[
                                styles.tabLabel,
                                activeTab === tab.id && styles.activeTabLabel
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tab Content */}
            {activeTab === 'express' && renderExpressTab()}
            {activeTab === 'reflections' && renderReflectionsTab()}
            {activeTab === 'guided' && renderGuidedTab()}
            {activeTab === 'board' && renderBoardTab()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabsContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 16,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#FEF2F2',
    },
    tabLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        marginLeft: 6,
        fontWeight: '500',
    },
    activeTabLabel: {
        color: '#FF6B9D',
        fontWeight: '600',
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    moodSection: {
        marginTop: 20,
        marginBottom: 24,
    },
    moodScrollView: {
        marginTop: 12,
    },
    moodOption: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 12,
        minWidth: 80,
    },
    moodEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    methodsSection: {
        marginBottom: 24,
    },
    methodsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    methodCard: {
        width: '30%',
    },
    methodGradient: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    methodLabel: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
        marginTop: 6,
    },
    inputSection: {
        marginBottom: 24,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    textInput: {
        padding: 16,
        fontSize: 14,
        color: '#374151',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    shareButton: {
        marginTop: 16,
    },
    shareButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    safetyMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    safetyText: {
        fontSize: 14,
        color: '#059669',
        marginLeft: 8,
        flex: 1,
    },
    reflectionsHeader: {
        marginTop: 20,
        marginBottom: 16,
    },
    reflectionsSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    guidedHeader: {
        marginTop: 20,
        marginBottom: 16,
    },
    guidedSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    resourcesScrollView: {
        marginBottom: 20,
    },
    boardHeader: {
        marginTop: 20,
        marginBottom: 16,
    },
    boardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    addAgreementSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    agreementInput: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B9D',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        marginTop: 20,
    },
    notesScrollView: {
        marginBottom: 20,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default SafeRoomTabs;

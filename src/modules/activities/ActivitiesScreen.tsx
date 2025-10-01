import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ActivitiesScreen = ({ navigation }: { navigation: any }) => {
    const [selectedVote, setSelectedVote] = useState('frozen2');
    const [currentWeek, setCurrentWeek] = useState('This Week');
    const [suggestions, setSuggestions] = useState([
        { id: '1', title: 'Visit the zoo', author: 'Emma', time: '3 days ago', likes: 3, isLiked: true },
        { id: '2', title: 'Mini golf tournament', author: 'Jake', time: '1 week ago', likes: 2, isLiked: false },
        { id: '3', title: 'Camping weekend', author: 'Dad', time: '2 weeks ago', likes: 4, isLiked: true },
    ]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleVote = (voteId: string) => {
        setSelectedVote(voteId);
        Alert.alert('Vote Cast', 'Your vote has been recorded!');
    };

    const handleWeekNavigation = (direction: 'prev' | 'next') => {
        if (direction === 'next') {
            setCurrentWeek('Next Week');
        } else {
            setCurrentWeek('Last Week');
        }

        setTimeout(() => {
            setCurrentWeek('This Week');
        }, 2000);
    };

    const handleNewEvent = () => {
        Alert.alert('New Event', 'Create new event functionality would go here');
    };

    const handleStartVote = () => {
        Alert.alert('Start Vote', 'Start new voting session functionality would go here');
    };

    const handleSchedule = () => {
        Alert.alert('Schedule', 'Schedule activity functionality would go here');
    };

    const handleSeeAllActivities = () => {
        Alert.alert('All Activities', 'View all activities functionality would go here');
    };

    const handleAddSuggestion = () => {
        Alert.alert('Add Suggestion', 'Add your suggestion functionality would go here');
    };

    const handleLikeSuggestion = (suggestionId: string) => {
        setSuggestions(prev => prev.map(suggestion =>
            suggestion.id === suggestionId
                ? {
                    ...suggestion,
                    isLiked: !suggestion.isLiked,
                    likes: suggestion.isLiked ? suggestion.likes - 1 : suggestion.likes + 1
                }
                : suggestion
        ));
    };

    const weekDays = [
        { day: 'Mon', date: '15', isToday: false, hasActivity: false },
        { day: 'Tue', date: '16', isToday: false, hasActivity: false },
        { day: 'Wed', date: '17', isToday: false, hasActivity: false },
        { day: 'Thu', date: '18', isToday: true, hasActivity: false },
        { day: 'Fri', date: '19', isToday: false, hasActivity: true, activityColor: '#8B5CF6' },
        { day: 'Sat', date: '20', isToday: false, hasActivity: true, activityColor: '#F59E0B' },
        { day: 'Sun', date: '21', isToday: false, hasActivity: false },
    ];

    const upcomingActivities = [
        {
            id: '1',
            title: 'Movie Night',
            time: 'Friday 7:00 PM',
            organizer: 'Mom',
            organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            status: 'voting',
            statusColor: '#8B5CF6',
            icon: 'film',
            iconColor: '#3B82F6',
            bgColor: '#EBF8FF',
            borderColor: '#3B82F6'
        },
        {
            id: '2',
            title: 'Emma\'s Birthday Party',
            time: 'Saturday 2:00 PM',
            organizer: 'Mom',
            organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            status: 'confirmed',
            statusColor: '#10B981',
            icon: 'gift',
            iconColor: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#F59E0B'
        },
        {
            id: '3',
            title: 'Park Picnic',
            time: 'Sunday 11:00 AM',
            organizer: 'Dad',
            organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            status: 'planning',
            statusColor: '#9CA3AF',
            icon: 'leaf',
            iconColor: '#10B981',
            bgColor: '#F0FDF4',
            borderColor: '#10B981'
        }
    ];

    const votingOptions = [
        {
            id: 'frozen2',
            title: 'Frozen 2',
            icon: 'film',
            votes: 2,
            voters: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
            ]
        },
        {
            id: 'walle',
            title: 'Wall-E',
            icon: 'hardware-chip',
            votes: 1,
            voters: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
            ]
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Family Activities</Text>
                        <Text style={styles.headerSubtitle}>Plan & Vote Together</Text>
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

            {/* Week Navigator */}
            <View style={styles.weekNavigatorSection}>
                <View style={styles.card}>
                    <View style={styles.weekNavigatorHeader}>
                        <TouchableOpacity style={styles.weekNavButton} onPress={() => handleWeekNavigation('prev')}>
                            <Ionicons name="chevron-back" size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.weekTitle}>{currentWeek}</Text>
                        <TouchableOpacity style={styles.weekNavButton} onPress={() => handleWeekNavigation('next')}>
                            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysGrid}>
                        {weekDays.map((day, index) => (
                            <View key={index} style={styles.dayItem}>
                                <Text style={styles.dayLabel}>{day.day}</Text>
                                <View style={[
                                    styles.dayNumber,
                                    day.isToday && styles.todayDay,
                                    day.hasActivity && styles.activityDay,
                                    day.hasActivity && { backgroundColor: day.activityColor + '20', borderColor: day.activityColor }
                                ]}>
                                    <Text style={[
                                        styles.dayNumberText,
                                        day.isToday && styles.todayDayText,
                                        day.hasActivity && { color: day.activityColor }
                                    ]}>
                                        {day.date}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Active Voting */}
            <View style={styles.activeVotingSection}>
                <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.votingCard}
                >
                    <View style={styles.votingHeader}>
                        <Text style={styles.votingTitle}>Vote Now!</Text>
                        <View style={styles.timeLeftContainer}>
                            <Ionicons name="time" size={14} color="white" />
                            <Text style={styles.timeLeftText}>2h left</Text>
                        </View>
                    </View>

                    <Text style={styles.votingPrompt}>Choose Friday night movie</Text>

                    <View style={styles.votingOptions}>
                        {votingOptions.map(option => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.votingOption,
                                    selectedVote === option.id ? styles.selectedVotingOption : styles.unselectedVotingOption
                                ]}
                                onPress={() => handleVote(option.id)}
                            >
                                <View style={styles.votingOptionIcon}>
                                    <Ionicons name={option.icon as any} size={20} color="white" />
                                </View>
                                <View style={styles.votingOptionContent}>
                                    <Text style={styles.votingOptionTitle}>{option.title}</Text>
                                    <View style={styles.votingOptionVotes}>
                                        <View style={styles.voterAvatars}>
                                            {option.voters.map((avatar, index) => (
                                                <Image
                                                    key={index}
                                                    source={{ uri: avatar }}
                                                    style={[styles.voterAvatar, { marginLeft: index > 0 ? -4 : 0 }]}
                                                />
                                            ))}
                                        </View>
                                        <Text style={styles.voteCount}>{option.votes} votes</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.votingOptionAction,
                                    selectedVote === option.id ? styles.selectedVotingAction : styles.unselectedVotingAction
                                ]}>
                                    <Ionicons
                                        name={selectedVote === option.id ? "checkmark" : "add"}
                                        size={14}
                                        color={selectedVote === option.id ? "#8B5CF6" : "white"}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>
            </View>

            {/* Upcoming Activities */}
            <View style={styles.upcomingActivitiesSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Activities</Text>
                        <TouchableOpacity onPress={handleSeeAllActivities}>
                            <Text style={styles.seeAllButton}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activitiesList}>
                        {upcomingActivities.map(activity => (
                            <View key={activity.id} style={[styles.activityItem, { backgroundColor: activity.bgColor, borderLeftColor: activity.borderColor }]}>
                                <View style={[styles.activityIcon, { backgroundColor: activity.iconColor }]}>
                                    <Ionicons name={activity.icon as any} size={20} color="white" />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityTime}>{activity.time}</Text>
                                    <View style={styles.activityOrganizer}>
                                        <Image source={{ uri: activity.organizerAvatar }} style={styles.organizerAvatar} />
                                        <Text style={styles.organizerText}>{activity.organizer} organizing</Text>
                                    </View>
                                </View>
                                <View style={styles.activityStatus}>
                                    <View style={[styles.statusIndicator, { backgroundColor: activity.statusColor }]} />
                                    <Text style={styles.statusText}>
                                        {activity.status === 'voting' ? 'Vote active' :
                                            activity.status === 'confirmed' ? 'Confirmed' : 'Planning'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickActionButton} onPress={handleNewEvent}>
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="add" size={24} color="white" />
                            </View>
                            <Text style={styles.quickActionText}>New Event</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton} onPress={handleStartVote}>
                        <LinearGradient
                            colors={['#8B5CF6', '#7C3AED']}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="bar-chart" size={24} color="white" />
                            </View>
                            <Text style={styles.quickActionText}>Start Vote</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton} onPress={handleSchedule}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="calendar" size={24} color="white" />
                            </View>
                            <Text style={styles.quickActionText}>Schedule</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Family Suggestions */}
            <View style={styles.familySuggestionsSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Family Suggestions</Text>
                        <TouchableOpacity onPress={handleAddSuggestion}>
                            <Text style={styles.addYoursButton}>Add Yours</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.suggestionsList}>
                        {suggestions.map(suggestion => (
                            <View key={suggestion.id} style={styles.suggestionItem}>
                                <Image source={{ uri: `https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${suggestion.author === 'Emma' ? '5' : suggestion.author === 'Jake' ? '3' : '2'}.jpg` }} style={styles.suggestionAvatar} />
                                <View style={styles.suggestionContent}>
                                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                                    <Text style={styles.suggestionMeta}>{suggestion.author} • {suggestion.time}</Text>
                                </View>
                                <View style={styles.suggestionActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.likeButton,
                                            suggestion.isLiked ? styles.likedButton : styles.unlikedButton
                                        ]}
                                        onPress={() => handleLikeSuggestion(suggestion.id)}
                                    >
                                        <Ionicons
                                            name="heart"
                                            size={14}
                                            color={suggestion.isLiked ? "#EF4444" : "#9CA3AF"}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.likeCount}>{suggestion.likes}</Text>
                                </View>
                            </View>
                        ))}
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
    weekNavigatorSection: {
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
    weekNavigatorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    weekNavButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    weekDaysGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    dayNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    todayDay: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    activityDay: {
        borderWidth: 2,
    },
    dayNumberText: {
        fontSize: 14,
        color: '#374151',
    },
    todayDayText: {
        color: 'white',
        fontWeight: 'bold',
    },
    activeVotingSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    votingCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    votingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    votingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    timeLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeLeftText: {
        fontSize: 14,
        color: 'white',
    },
    votingPrompt: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
    },
    votingOptions: {
        gap: 12,
    },
    votingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    selectedVotingOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    unselectedVotingOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    votingOptionIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    votingOptionContent: {
        flex: 1,
    },
    votingOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    votingOptionVotes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    voterAvatars: {
        flexDirection: 'row',
    },
    voterAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
    },
    voteCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    votingOptionAction: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedVotingAction: {
        backgroundColor: 'white',
    },
    unselectedVotingAction: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    upcomingActivitiesSection: {
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
    seeAllButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    activitiesList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    activityOrganizer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    organizerAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    organizerText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activityStatus: {
        alignItems: 'flex-end',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#6B7280',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
    },
    quickActionGradient: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    quickActionIconBg: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    familySuggestionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 80,
    },
    addYoursButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    suggestionsList: {
        gap: 12,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    suggestionAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 2,
    },
    suggestionMeta: {
        fontSize: 12,
        color: '#6B7280',
    },
    suggestionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    likeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    likedButton: {
        backgroundColor: '#FEF2F2',
    },
    unlikedButton: {
        backgroundColor: '#F3F4F6',
    },
    likeCount: {
        fontSize: 12,
        color: '#6B7280',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default ActivitiesScreen;
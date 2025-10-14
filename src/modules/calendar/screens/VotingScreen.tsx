import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '@/hooks/useCalendar';
import VoteOption from '@/components/VoteOption';

interface VotingScreenProps {
    navigation: any;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ navigation }) => {
    const { familyMembers, getVotingProgress } = useCalendar();
    const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleMovieVote = (movieId: string) => {
        setSelectedMovie(movieId);
        Alert.alert('Vote Cast', 'Your movie vote has been recorded!');
    };

    const handleActivityVote = (activityId: string) => {
        setSelectedActivity(activityId);
        Alert.alert('Vote Cast', 'Your activity vote has been recorded!');
    };

    const handleCastVote = () => {
        if (!selectedMovie) {
            Alert.alert('Select Movie', 'Please select a movie before voting');
            return;
        }
        Alert.alert('Vote Submitted', 'Your vote has been submitted successfully!');
    };

    const votingProgress = getVotingProgress();

    const movieOptions = [
        {
            id: 'movie1',
            title: 'The Super Pets',
            description: 'Animated • 1h 45m',
            votes: 2,
            voters: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
            ],
            poster: 'https://image.tmdb.org/t/p/w500/r7XifzvtezNtI5d1sOKdJ0j1tG0.jpg',
            rating: 8.2,
            duration: '1h 45m',
            genre: 'Animation',
            tags: ['Family Friendly']
        },
        {
            id: 'movie2',
            title: 'Space Adventure',
            description: 'Adventure • 2h 10m',
            votes: 1,
            voters: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
            ],
            poster: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
            rating: 8.7,
            duration: '2h 10m',
            genre: 'Adventure',
            tags: ['Adventure']
        },
        {
            id: 'movie3',
            title: 'Funny Family',
            description: 'Comedy • 1h 30m',
            votes: 0,
            voters: [],
            poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
            rating: 7.9,
            duration: '1h 30m',
            genre: 'Comedy',
            tags: ['Comedy']
        }
    ];

    const weekendActivities = [
        {
            id: 'park',
            title: 'Park Visit',
            description: 'Outdoor fun',
            icon: 'leaf',
            color: '#10B981'
        },
        {
            id: 'games',
            title: 'Game Center',
            description: 'Indoor games',
            icon: 'game-controller',
            color: '#8B5CF6'
        },
        {
            id: 'swimming',
            title: 'Swimming',
            description: 'Pool time',
            icon: 'water',
            color: '#F59E0B'
        },
        {
            id: 'art',
            title: 'Art Class',
            description: 'Creative time',
            icon: 'color-palette',
            color: '#EC4899'
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
                        <Text style={styles.headerSubtitle}>Vote for this week</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons name="notifications" size={16} color="white" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                            style={styles.headerAvatar}
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Voting Progress */}
            <View style={styles.votingProgressSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Voting Progress</Text>
                        <Text style={styles.progressText}>{votingProgress.votedCount} of {votingProgress.totalCount} voted</Text>
                    </View>

                    <View style={styles.familyMembersContainer}>
                        {familyMembers.map(member => (
                            <View key={member.id} style={styles.familyMemberItem}>
                                <Image source={{ uri: member.avatar }} style={styles.familyMemberAvatar} />
                                <Text style={styles.familyMemberName}>{member.name}</Text>
                                <View style={[
                                    styles.voteStatusIcon,
                                    { backgroundColor: member.hasVoted ? '#10B981' : '#F59E0B' }
                                ]}>
                                    <Ionicons
                                        name={member.hasVoted ? 'checkmark' : 'time'}
                                        size={12}
                                        color="white"
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${(votingProgress.votedCount / votingProgress.totalCount) * 100}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Movie Night Voting */}
            <View style={styles.movieVotingSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Movie Night - Friday</Text>
                        <View style={styles.timeLeftContainer}>
                            <Ionicons name="time" size={14} color="#6B7280" />
                            <Text style={styles.timeLeftText}>2h left</Text>
                        </View>
                    </View>

                    <View style={styles.movieOptions}>
                        {movieOptions.map(movie => (
                            <VoteOption
                                key={movie.id}
                                option={movie}
                                isSelected={selectedMovie === movie.id}
                                onPress={() => setSelectedMovie(movie.id)}
                                showVoteButton={false}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.castVoteButton,
                            { backgroundColor: selectedMovie ? '#3B82F6' : '#9CA3AF' }
                        ]}
                        onPress={handleCastVote}
                        disabled={!selectedMovie}
                    >
                        <Text style={styles.castVoteButtonText}>Cast Your Vote</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Weekend Activity Voting */}
            <View style={styles.weekendActivitySection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Weekend Activity</Text>
                        <View style={styles.votingSoonTag}>
                            <Text style={styles.votingSoonText}>Voting Soon</Text>
                        </View>
                    </View>

                    <View style={styles.weekendActivitiesGrid}>
                        {weekendActivities.map(activity => (
                            <TouchableOpacity
                                key={activity.id}
                                style={[
                                    styles.weekendActivityCard,
                                    { backgroundColor: `${activity.color}20` },
                                    selectedActivity === activity.id && { borderColor: activity.color, borderWidth: 2 }
                                ]}
                                onPress={() => handleActivityVote(activity.id)}
                            >
                                <View style={[styles.weekendActivityIcon, { backgroundColor: activity.color }]}>
                                    <Ionicons name={activity.icon as any} size={24} color="white" />
                                </View>
                                <Text style={styles.weekendActivityTitle}>{activity.title}</Text>
                                <Text style={styles.weekendActivityDescription}>{activity.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.votingScheduleContainer}>
                        <Ionicons name="time" size={14} color="#6B7280" />
                        <Text style={styles.votingScheduleText}>Voting opens tomorrow at 9:00 AM</Text>
                    </View>
                </View>
            </View>

            {/* Recent Decisions */}
            <View style={styles.recentDecisionsSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Recent Decisions</Text>
                    <View style={styles.decisionsList}>
                        <View style={styles.decisionItem}>
                            <View style={[styles.decisionIcon, { backgroundColor: '#10B981' }]}>
                                <Ionicons name="pizza" size={20} color="white" />
                            </View>
                            <View style={styles.decisionContent}>
                                <Text style={styles.decisionTitle}>Pizza Night</Text>
                                <Text style={styles.decisionDetails}>Won with 4/4 votes • Last Friday</Text>
                            </View>
                            <Ionicons name="trophy" size={20} color="#F59E0B" />
                        </View>

                        <View style={styles.decisionItem}>
                            <View style={[styles.decisionIcon, { backgroundColor: '#3B82F6' }]}>
                                <Ionicons name="bowling-ball" size={20} color="white" />
                            </View>
                            <View style={styles.decisionContent}>
                                <Text style={styles.decisionTitle}>Bowling</Text>
                                <Text style={styles.decisionDetails}>Won with 3/4 votes • Last Weekend</Text>
                            </View>
                            <Ionicons name="trophy" size={20} color="#F59E0B" />
                        </View>

                        <View style={styles.decisionItem}>
                            <View style={[styles.decisionIcon, { backgroundColor: '#8B5CF6' }]}>
                                <Ionicons name="book" size={20} color="white" />
                            </View>
                            <View style={styles.decisionContent}>
                                <Text style={styles.decisionTitle}>Library Visit</Text>
                                <Text style={styles.decisionDetails}>Won with 3/4 votes • 2 weeks ago</Text>
                            </View>
                            <Ionicons name="trophy" size={20} color="#F59E0B" />
                        </View>
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'white',
    },
    votingProgressSection: {
        paddingHorizontal: 16,
        marginTop: 16,
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
    progressText: {
        fontSize: 14,
        color: '#6B7280',
    },
    familyMembersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    familyMemberItem: {
        alignItems: 'center',
        flex: 1,
    },
    familyMemberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
    },
    familyMemberName: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
        marginBottom: 4,
    },
    voteStatusIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        marginTop: 8,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    movieVotingSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    timeLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLeftText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    movieOptions: {
        marginBottom: 16,
    },
    castVoteButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    castVoteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    weekendActivitySection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    votingSoonTag: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    votingSoonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    weekendActivitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    weekendActivityCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    weekendActivityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    weekendActivityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    weekendActivityDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    votingScheduleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    votingScheduleText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    recentDecisionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    decisionsList: {
        gap: 12,
    },
    decisionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    decisionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    decisionContent: {
        flex: 1,
    },
    decisionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    decisionDetails: {
        fontSize: 12,
        color: '#6B7280',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default VotingScreen;

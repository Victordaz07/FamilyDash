import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '@/hooks/useCalendar';
import VoteOption from '@/components/VoteOption';
import ResponsibilityItem from '@/components/ResponsibilityItem';
import ChatMessage from '@/components/ChatMessage';

interface ActivityDetailScreenProps {
    navigation: any;
    route: {
        params: {
            activityId: string;
        };
    };
}

const ActivityDetailScreen: React.FC<ActivityDetailScreenProps> = ({ navigation, route }) => {
    const { activityId } = route.params;
    const { getActivityById, addVote, completeResponsibility, addChatMessage } = useCalendar();
    const [newMessage, setNewMessage] = useState('');
    const [selectedVote, setSelectedVote] = useState<string | null>(null);

    const activity = getActivityById(activityId);

    if (!activity) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Activity not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBack = () => {
        navigation.goBack();
    };

    const handleShare = () => {
        Alert.alert('Share', 'Share activity functionality would go here');
    };

    const handleEdit = () => {
        Alert.alert('Edit', 'Edit activity functionality would go here');
    };

    const handleVote = (optionId: string) => {
        setSelectedVote(optionId);
        addVote(activityId, optionId, 'current-user');
        Alert.alert('Vote Cast', 'Your vote has been recorded!');
    };

    const handleSuggestAnother = () => {
        Alert.alert('Suggest Movie', 'Suggest another movie functionality would go here');
    };

    const handleResponsibilityPress = (responsibilityId: string) => {
        completeResponsibility(activityId, responsibilityId);
        Alert.alert('Completed', 'Responsibility marked as completed');
    };

    const handleRemindResponsibility = (title: string) => {
        Alert.alert('Reminder Sent', `Reminder sent for ${title}`);
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            addChatMessage(activityId, {
                author: 'You',
                authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                message: newMessage.trim(),
                timestamp: 'now'
            });
            setNewMessage('');
        }
    };

    const getActivityIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            'movie': 'film',
            'birthday': 'gift',
            'doctor': 'medical',
            'shopping': 'cart',
            'reading': 'book',
            'picnic': 'leaf',
            'bowling': 'bowling-ball',
            'library': 'library'
        };
        return icons[type] || 'calendar';
    };

    const getActivityColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'movie': '#EC4899',
            'birthday': '#8B5CF6',
            'doctor': '#F59E0B',
            'shopping': '#3B82F6',
            'reading': '#F59E0B',
            'picnic': '#10B981',
            'bowling': '#3B82F6',
            'library': '#8B5CF6'
        };
        return colors[type] || '#6B7280';
    };

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
                        <Text style={styles.headerTitle}>{activity.title}</Text>
                        <Text style={styles.headerSubtitle}>{activity.date} {activity.time}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                            <Ionicons name="share" size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
                            <Ionicons name="create" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Activity Details Card */}
            <View style={styles.activityDetailsSection}>
                <View style={styles.card}>
                    <View style={styles.activityInfo}>
                        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                            <Ionicons name={getActivityIcon(activity.type) as any} size={24} color="white" />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityDateTime}>{activity.date}, Dec 15 • {activity.time}</Text>
                            <View style={styles.locationContainer}>
                                <Ionicons name="location" size={14} color="#6B7280" />
                                <Text style={styles.locationText}>{activity.location}</Text>
                            </View>
                            <View style={styles.organizerContainer}>
                                <Image source={{ uri: activity.organizerAvatar }} style={styles.organizerAvatar} />
                                <Text style={styles.organizerText}>Organized by {activity.organizer}</Text>
                                <TouchableOpacity style={styles.organizerButton}>
                                    <Text style={styles.organizerButtonText}>Organizer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Voting Section */}
            {activity.votingOptions && activity.votingOptions.length > 0 && (
                <View style={styles.votingSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Choose Our Movie</Text>
                            <View style={styles.timeLeftContainer}>
                                <Ionicons name="time" size={14} color="#6B7280" />
                                <Text style={styles.timeLeftText}>2 days left</Text>
                            </View>
                        </View>

                        <View style={styles.votingOptions}>
                            {activity.votingOptions.map((option, index) => (
                                <VoteOption
                                    key={option.id}
                                    option={option}
                                    isSelected={selectedVote === option.id}
                                    onPress={() => setSelectedVote(option.id)}
                                    onVote={() => handleVote(option.id)}
                                    showVoteButton={index === 1} // Show vote button on second option
                                />
                            ))}
                        </View>

                        <TouchableOpacity style={styles.suggestButton} onPress={handleSuggestAnother}>
                            <Ionicons name="add" size={16} color="white" />
                            <Text style={styles.suggestButtonText}>Suggest Another Movie</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Responsibilities Section */}
            {activity.responsibilities && activity.responsibilities.length > 0 && (
                <View style={styles.responsibilitiesSection}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Responsibilities</Text>
                        <View style={styles.responsibilitiesList}>
                            {activity.responsibilities.map(responsibility => (
                                <ResponsibilityItem
                                    key={responsibility.id}
                                    responsibility={responsibility}
                                    onPress={() => handleResponsibilityPress(responsibility.id)}
                                    onRemind={() => handleRemindResponsibility(responsibility.title)}
                                />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.addResponsibilityButton}>
                            <Ionicons name="add" size={16} color="#3B82F6" />
                            <Text style={styles.addResponsibilityText}>Add Responsibility</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Family Chat Section */}
            <View style={styles.chatSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Family Chat</Text>
                    <View style={styles.chatMessages}>
                        {activity.chatMessages?.map(message => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                    </View>
                    <View style={styles.chatInputContainer}>
                        <Image
                            source={{ uri: activity.organizerAvatar }}
                            style={styles.chatInputAvatar}
                        />
                        <TextInput
                            style={styles.chatInput}
                            placeholder="Add a comment..."
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Ionicons
                                name="send"
                                size={16}
                                color={newMessage.trim() ? 'white' : '#9CA3AF'}
                            />
                        </TouchableOpacity>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontWeight: '600',
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
    activityDetailsSection: {
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
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    activityDateTime: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
    },
    organizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    organizerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    organizerText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    organizerButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    organizerButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    votingSection: {
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
    timeLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLeftText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    votingOptions: {
        marginBottom: 16,
    },
    suggestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    suggestButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    responsibilitiesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    responsibilitiesList: {
        marginBottom: 16,
    },
    addResponsibilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    addResponsibilityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
    },
    chatSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    chatMessages: {
        marginBottom: 16,
    },
    chatInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    chatInputAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default ActivityDetailScreen;





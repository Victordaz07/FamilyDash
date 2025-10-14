import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent, FamilyMember } from '@/types/calendarTypes';
import { categoryConfig } from '../mock/expandedCalendarData';

interface EventCardProps {
    event: CalendarEvent;
    familyMembers: FamilyMember[];
    onRemind: (eventId: string, reminder: '10m' | '1h' | '1d') => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, familyMembers, onRemind }) => {
    const category = categoryConfig[event.category];

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getParticipantAvatars = () => {
        if (event.participants.includes('all')) {
            return familyMembers.map(member => member.avatar);
        }
        return event.participants
            .map(id => familyMembers.find(member => member.id === id))
            .filter(Boolean)
            .map(member => member!.avatar);
    };

    const handleRemindPress = () => {
        Alert.alert(
            'Set Reminder',
            'Choose when to be reminded:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: '10 min before', onPress: () => onRemind(event.id, '10m') },
                { text: '1 hour before', onPress: () => onRemind(event.id, '1h') },
                { text: '1 day before', onPress: () => onRemind(event.id, '1d') }
            ]
        );
    };

    return (
        <View style={[styles.card, { borderLeftColor: category.color }]}>
            <View style={styles.cardHeader}>
                <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                        <Ionicons name={category.icon as any} size={16} color="white" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                </View>

                <TouchableOpacity style={styles.remindButton} onPress={handleRemindPress}>
                    <Ionicons name="notifications" size={16} color="#3B82F6" />
                    <Text style={styles.remindText}>Remind</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.eventTitle}>{event.title}</Text>

            <View style={styles.eventDetails}>
                <View style={styles.timeLocation}>
                    <View style={styles.timeRow}>
                        <Ionicons name="time" size={14} color="#6B7280" />
                        <Text style={styles.timeText}>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </Text>
                    </View>

                    {event.location && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={14} color="#6B7280" />
                            <Text style={styles.locationText}>{event.location}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.participants}>
                    <View style={styles.avatarStack}>
                        {getParticipantAvatars().slice(0, 4).map((avatar, index) => (
                            <Image
                                key={index}
                                source={{ uri: avatar }}
                                style={[
                                    styles.avatar,
                                    { marginLeft: index > 0 ? -8 : 0 }
                                ]}
                            />
                        ))}
                        {getParticipantAvatars().length > 4 && (
                            <View style={[styles.avatar, styles.moreAvatars, { marginLeft: -8 }]}>
                                <Text style={styles.moreText}>+{getParticipantAvatars().length - 4}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {event.reminder && (
                <View style={styles.reminderBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.reminderText}>
                        Reminder set ({event.reminder === '10m' ? '10 min' : event.reminder === '1h' ? '1 hour' : '1 day'} before)
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    remindButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#F0F9FF',
    },
    remindText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#3B82F6',
        marginLeft: 4,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    eventDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeLocation: {
        flex: 1,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },
    participants: {
        alignItems: 'flex-end',
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    moreAvatars: {
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
    },
    reminderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    reminderText: {
        fontSize: 12,
        color: '#10B981',
        marginLeft: 4,
    },
});

export default EventCard;





import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarEvent, FamilyMember, ActivityCategory } from '@/types/calendarTypes';
import { mockCalendarEvents, mockFamilyMembers, categoryConfig } from '../mock/expandedCalendarData';
import EventCard from '@/components/EventCard';
import { useNotifications } from '@/hooks/useNotifications';

interface ExpandedCalendarProps {
    navigation: any;
}

const ExpandedCalendar: React.FC<ExpandedCalendarProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { unreadCount } = useNotifications();
    const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);

    // Calendar navigation
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const getMonthYear = () => {
        return selectedDate.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
    };

    // Get calendar days for current month
    const getCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push({
                date: new Date(currentDate),
                isCurrentMonth: currentDate.getMonth() === month,
                isToday: currentDate.toDateString() === new Date().toDateString(),
                dayNumber: currentDate.getDate()
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return events.filter(event => event.date === dateString);
    };

    // Get events for selected date
    const selectedDateEvents = useMemo(() => {
        return getEventsForDate(selectedDate);
    }, [selectedDate, events]);

    // Get events for current week (agenda view)
    const weekEvents = useMemo(() => {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const weekEvents = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateEvents = getEventsForDate(date);
            if (dateEvents.length > 0) {
                weekEvents.push({
                    date,
                    events: dateEvents
                });
            }
        }
        return weekEvents;
    }, [selectedDate, events]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = {
            ...eventData,
            id: `event_${Date.now()}`
        };
        setEvents(prev => [...prev, newEvent]);
        Alert.alert('Success', 'Event added successfully!');
    };

    const handleRemind = (eventId: string, reminder: '10m' | '1h' | '1d') => {
        setEvents(prev => prev.map(event =>
            event.id === eventId ? { ...event, reminder } : event
        ));
        Alert.alert('Reminder Set', `You'll be reminded ${reminder === '10m' ? '10 minutes' : reminder === '1h' ? '1 hour' : '1 day'} before the event.`);
    };

    const formatSelectedDate = () => {
        return selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calendarDays = getCalendarDays();

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Monthly Calendar</Text>
                        <Text style={styles.headerSubtitle}>{getMonthYear()}</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setViewMode(viewMode === 'calendar' ? 'agenda' : 'calendar')}
                        >
                            <Ionicons
                                name={viewMode === 'calendar' ? 'list' : 'calendar'}
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}
                        >
                            <Ionicons name="notifications" size={20} color="white" />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {viewMode === 'calendar' ? (
                    // Calendar View
                    <>
                        {/* Calendar Grid */}
                        <View style={styles.calendarCard}>
                            {/* Month Navigation */}
                            <View style={styles.monthNavigation}>
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => navigateMonth('prev')}
                                >
                                    <Ionicons name="chevron-back" size={20} color="#6B7280" />
                                </TouchableOpacity>

                                <Text style={styles.monthTitle}>{getMonthYear()}</Text>

                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => navigateMonth('next')}
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Day Headers */}
                            <View style={styles.dayHeaders}>
                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                                    <Text key={day} style={styles.dayHeader}>{day}</Text>
                                ))}
                            </View>

                            {/* Calendar Grid */}
                            <View style={styles.calendarGrid}>
                                {calendarDays.map((day, index) => {
                                    const dayEvents = getEventsForDate(day.date);
                                    const isSelected = day.date.toDateString() === selectedDate.toDateString();

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.calendarDay,
                                                !day.isCurrentMonth && styles.calendarDayInactive,
                                                day.isToday && styles.calendarDayToday,
                                                isSelected && styles.calendarDaySelected
                                            ]}
                                            onPress={() => handleDateSelect(day.date)}
                                        >
                                            <Text style={[
                                                styles.calendarDayText,
                                                !day.isCurrentMonth && styles.calendarDayTextInactive,
                                                day.isToday && styles.calendarDayTextToday,
                                                isSelected && styles.calendarDayTextSelected
                                            ]}>
                                                {day.dayNumber}
                                            </Text>

                                            {/* Event indicators */}
                                            <View style={styles.eventIndicators}>
                                                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                                    <View
                                                        key={eventIndex}
                                                        style={[
                                                            styles.eventDot,
                                                            { backgroundColor: categoryConfig[event.category].color }
                                                        ]}
                                                    />
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Selected Date Events */}
                        <View style={styles.eventsSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {formatSelectedDate()}
                                </Text>
                                <Text style={styles.eventsCount}>
                                    {selectedDateEvents.length} events
                                </Text>
                            </View>

                            {selectedDateEvents.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                                    <Text style={styles.emptyTitle}>No events</Text>
                                    <Text style={styles.emptySubtitle}>
                                        No events scheduled for this date
                                    </Text>
                                </View>
                            ) : (
                                selectedDateEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        familyMembers={mockFamilyMembers}
                                        onRemind={handleRemind}
                                    />
                                ))
                            )}
                        </View>
                    </>
                ) : (
                    // Agenda View
                    <View style={styles.agendaSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Weekly Agenda</Text>
                            <Text style={styles.eventsCount}>
                                {weekEvents.reduce((total, day) => total + day.events.length, 0)} events
                            </Text>
                        </View>

                        {weekEvents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="list-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyTitle}>No events this week</Text>
                                <Text style={styles.emptySubtitle}>
                                    No events scheduled for this week
                                </Text>
                            </View>
                        ) : (
                            weekEvents.map((dayData, index) => (
                                <View key={index} style={styles.agendaDay}>
                                    <Text style={styles.agendaDayTitle}>
                                        {dayData.date.toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                    {dayData.events.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            familyMembers={mockFamilyMembers}
                                            onRemind={handleRemind}
                                        />
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom + 24 }]}
                onPress={() => navigation.navigate('EventEditor', {
                    selectedDate: selectedDate.toISOString().split('T')[0],
                    mode: 'create'
                })}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    calendarCard: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    navButton: {
        padding: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    dayHeaders: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        paddingVertical: 8,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    calendarDayInactive: {
        backgroundColor: '#F9FAFB',
    },
    calendarDayToday: {
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
    },
    calendarDaySelected: {
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
    },
    calendarDayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    calendarDayTextInactive: {
        color: '#9CA3AF',
    },
    calendarDayTextToday: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    calendarDayTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
    eventIndicators: {
        position: 'absolute',
        bottom: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    moreEventsText: {
        fontSize: 8,
        color: '#6B7280',
        marginLeft: 2,
    },
    eventsSection: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    agendaSection: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    eventsCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    agendaDay: {
        marginBottom: 24,
    },
    agendaDayTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    fab: {
        position: 'absolute',
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
});

export default ExpandedCalendar;

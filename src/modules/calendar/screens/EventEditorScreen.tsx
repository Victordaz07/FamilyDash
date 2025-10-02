import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarEvent, FamilyMember, ActivityCategory } from '../types/calendarTypes';
import { categoryConfig } from '../mock/expandedCalendarData';
import { theme } from '../../../styles/simpleTheme';

interface EventEditorScreenProps {
    navigation: any;
    route: {
        params: {
            selectedDate: string;
            event?: CalendarEvent; // Si viene un evento, es modo edición
            mode: 'create' | 'edit';
        };
    };
}

const EventEditorScreen: React.FC<EventEditorScreenProps> = ({ navigation, route }) => {
    const { selectedDate, event, mode } = route.params;
    const insets = useSafeAreaInsets();

    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        category: event?.category || 'other' as ActivityCategory,
        startTime: event?.startTime || '',
        endTime: event?.endTime || '',
        location: event?.location || '',
        participants: event?.participants || [] as string[],
        reminder: event?.reminder || undefined as '10m' | '1h' | '1d' | undefined,
        isRecurring: event?.isRecurring || false,
        recurringType: event?.recurringType || 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
        priority: event?.priority || 'medium' as 'low' | 'medium' | 'high',
        color: event?.color || '#8B5CF6'
    });

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(mode === 'create');

    // Plantillas predefinidas
    const eventTemplates = [
        {
            id: 'family-dinner',
            name: 'Family Dinner',
            icon: 'restaurant',
            color: '#F59E0B',
            category: 'family' as ActivityCategory,
            defaultDuration: 90,
            description: 'Weekly family dinner time'
        },
        {
            id: 'homework-time',
            name: 'Homework Time',
            icon: 'book',
            color: '#3B82F6',
            category: 'education' as ActivityCategory,
            defaultDuration: 60,
            description: 'Dedicated study time'
        },
        {
            id: 'chores',
            name: 'Chores',
            icon: 'brush',
            color: '#10B981',
            category: 'chores' as ActivityCategory,
            defaultDuration: 30,
            description: 'Household cleaning tasks'
        },
        {
            id: 'screen-time',
            name: 'Screen Time',
            icon: 'phone-portrait',
            color: '#8B5CF6',
            category: 'entertainment' as ActivityCategory,
            defaultDuration: 45,
            description: 'Allowed screen time'
        },
        {
            id: 'bedtime',
            name: 'Bedtime',
            icon: 'moon',
            color: '#6B7280',
            category: 'health' as ActivityCategory,
            defaultDuration: 0,
            description: 'Sleep time routine'
        },
        {
            id: 'playtime',
            name: 'Play Time',
            icon: 'game-controller',
            color: '#EF4444',
            category: 'entertainment' as ActivityCategory,
            defaultDuration: 60,
            description: 'Free play time'
        }
    ];

    const familyMembers = [
        { id: 'dad', name: 'Dad', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 'mom', name: 'Mom', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: 'ariella', name: 'Ariella', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: 'noah', name: 'Noah', avatar: 'https://i.pravatar.cc/150?img=4' }
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const applyTemplate = (template: typeof eventTemplates[0]) => {
        setFormData(prev => ({
            ...prev,
            title: template.name,
            category: template.category,
            color: template.color,
            description: template.description,
            isRecurring: template.id === 'family-dinner' || template.id === 'bedtime'
        }));
        setSelectedTemplate(template.id);
        setShowTemplates(false);
    };

    const handleSave = () => {
        if (!formData.title || !formData.startTime || !formData.endTime) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const newEvent: Omit<CalendarEvent, 'id'> = {
            ...formData,
            date: selectedDate,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Aquí llamarías a la función para guardar el evento
        Alert.alert('Success', 'Event saved successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Aquí llamarías a la función para eliminar el evento
                        Alert.alert('Success', 'Event deleted successfully!', [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {mode === 'create' ? 'Create Event' : 'Edit Event'}
                </Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Selected Date */}
                <View style={styles.dateCard}>
                    <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                    <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                </View>

                {/* Templates Section */}
                {showTemplates && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Quick Templates</Text>
                            <TouchableOpacity onPress={() => setShowTemplates(false)}>
                                <Text style={styles.hideText}>Hide</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
                            {eventTemplates.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    style={[styles.templateCard, { backgroundColor: template.color }]}
                                    onPress={() => applyTemplate(template)}
                                >
                                    <Ionicons name={template.icon as any} size={32} color="white" />
                                    <Text style={styles.templateName}>{template.name}</Text>
                                    <Text style={styles.templateDuration}>{template.defaultDuration}m</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Event Details Form */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Event Details</Text>

                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter event title"
                            value={formData.title}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Add event description"
                            multiline
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        />
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {Object.entries(categoryConfig).map(([key, config]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.categoryOption,
                                        { backgroundColor: config.color },
                                        formData.category === key && styles.categorySelected
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, category: key as ActivityCategory }))}
                                >
                                    <Ionicons name={config.icon as any} size={20} color="white" />
                                    <Text style={styles.categoryText}>{config.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Time */}
                    <View style={styles.timeRow}>
                        <View style={styles.timeGroup}>
                            <Text style={styles.inputLabel}>Start Time *</Text>
                            <TextInput
                                style={styles.timeInput}
                                placeholder="09:00"
                                value={formData.startTime}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
                            />
                        </View>
                        <View style={styles.timeGroup}>
                            <Text style={styles.inputLabel}>End Time *</Text>
                            <TextInput
                                style={styles.timeInput}
                                placeholder="10:00"
                                value={formData.endTime}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: text }))}
                            />
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Location</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Where will this take place?"
                            value={formData.location}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                        />
                    </View>

                    {/* Participants */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Participants</Text>
                        <View style={styles.participantsGrid}>
                            {familyMembers.map((member) => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[
                                        styles.participantOption,
                                        formData.participants.includes(member.id) && styles.participantSelected
                                    ]}
                                    onPress={() => {
                                        const isSelected = formData.participants.includes(member.id);
                                        setFormData(prev => ({
                                            ...prev,
                                            participants: isSelected
                                                ? prev.participants.filter(id => id !== member.id)
                                                : [...prev.participants, member.id]
                                        }));
                                    }}
                                >
                                    <Image source={{ uri: member.avatar }} style={styles.participantAvatar} />
                                    <Text style={styles.participantName}>{member.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Reminder */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Reminder</Text>
                        <View style={styles.reminderRow}>
                            {[
                                { value: undefined, label: 'None' },
                                { value: '10m', label: '10 min before' },
                                { value: '1h', label: '1 hour before' },
                                { value: '1d', label: '1 day before' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value || 'none'}
                                    style={[
                                        styles.reminderOption,
                                        formData.reminder === option.value && styles.reminderSelected
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, reminder: option.value as "1d" | "10m" | "1h" | undefined }))}
                                >
                                    <Text style={[
                                        styles.reminderText,
                                        formData.reminder === option.value && styles.reminderTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Recurring */}
                    <View style={styles.inputGroup}>
                        <View style={styles.recurringHeader}>
                            <Text style={styles.inputLabel}>Recurring Event</Text>
                            <TouchableOpacity
                                style={[styles.toggle, formData.isRecurring && styles.toggleActive]}
                                onPress={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                            >
                                <View style={[styles.toggleThumb, formData.isRecurring && styles.toggleThumbActive]} />
                            </TouchableOpacity>
                        </View>
                        {formData.isRecurring && (
                            <View style={styles.recurringOptions}>
                                {[
                                    { value: 'daily', label: 'Daily' },
                                    { value: 'weekly', label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' }
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.recurringOption,
                                            formData.recurringType === option.value && styles.recurringOptionSelected
                                        ]}
                                        onPress={() => setFormData(prev => ({ ...prev, recurringType: option.value as any }))}
                                    >
                                        <Text style={[
                                            styles.recurringText,
                                            formData.recurringType === option.value && styles.recurringTextSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Priority */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Priority</Text>
                        <View style={styles.priorityRow}>
                            {[
                                { value: 'low', label: 'Low', color: '#10B981' },
                                { value: 'medium', label: 'Medium', color: '#F59E0B' },
                                { value: 'high', label: 'High', color: '#EF4444' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.priorityOption,
                                        { borderColor: option.color },
                                        formData.priority === option.value && { backgroundColor: option.color }
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, priority: option.value as any }))}
                                >
                                    <Text style={[
                                        styles.priorityText,
                                        { color: formData.priority === option.value ? 'white' : option.color }
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {mode === 'edit' && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                            <Text style={styles.deleteButtonText}>Delete Event</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButtonMain} onPress={handleSave}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryDark]}
                            style={styles.saveButtonGradient}
                        >
                            <Text style={styles.saveButtonMainText}>Save Event</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
        paddingHorizontal: theme.spacing.medium,
        ...theme.shadows.medium,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.white,
    },
    saveButton: {
        padding: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.white,
    },
    content: {
        flex: 1,
    },
    dateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        margin: theme.spacing.medium,
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
        ...theme.shadows.small,
    },
    dateText: {
        fontSize: theme.typography.fontSize.large,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.text,
        marginLeft: theme.spacing.small,
        textTransform: 'capitalize',
    },
    section: {
        marginHorizontal: theme.spacing.medium,
        marginBottom: theme.spacing.large,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.medium,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.large,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.text,
    },
    hideText: {
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.medium as any,
    },
    templatesScroll: {
        marginBottom: theme.spacing.medium,
    },
    templateCard: {
        alignItems: 'center',
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
        marginRight: theme.spacing.small,
        minWidth: 100,
        ...theme.shadows.small,
    },
    templateName: {
        fontSize: theme.typography.fontSize.small,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: 'white',
        marginTop: theme.spacing.small,
        textAlign: 'center',
    },
    templateDuration: {
        fontSize: theme.typography.fontSize.small,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    inputGroup: {
        marginBottom: theme.spacing.medium,
    },
    inputLabel: {
        fontSize: theme.typography.fontSize.medium,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.text,
        marginBottom: theme.spacing.small,
    },
    input: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.small,
        padding: theme.spacing.medium,
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    categoryScroll: {
        marginBottom: theme.spacing.small,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.small,
        borderRadius: theme.borderRadius.large,
        marginRight: theme.spacing.small,
        backgroundColor: theme.colors.gray,
    },
    categorySelected: {
        ...theme.shadows.small,
    },
    categoryText: {
        fontSize: theme.typography.fontSize.small,
        color: 'white',
        marginLeft: theme.spacing.small,
        fontWeight: theme.typography.fontWeight.medium as any,
    },
    timeRow: {
        flexDirection: 'row',
        gap: theme.spacing.medium,
    },
    timeGroup: {
        flex: 1,
    },
    timeInput: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.small,
        padding: theme.spacing.medium,
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
        textAlign: 'center',
    },
    participantsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.small,
    },
    participantOption: {
        alignItems: 'center',
        padding: theme.spacing.small,
        borderRadius: theme.borderRadius.medium,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
        minWidth: 80,
    },
    participantSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    participantAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: theme.spacing.small,
    },
    participantName: {
        fontSize: theme.typography.fontSize.small,
        fontWeight: theme.typography.fontWeight.medium as any,
        color: theme.colors.text,
        textAlign: 'center',
    },
    reminderRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.small,
    },
    reminderOption: {
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.small,
        borderRadius: theme.borderRadius.medium,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
    },
    reminderSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    reminderText: {
        fontSize: theme.typography.fontSize.small,
        color: theme.colors.text,
    },
    reminderTextSelected: {
        color: 'white',
    },
    recurringHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'white',
        alignSelf: 'flex-start',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    recurringOptions: {
        flexDirection: 'row',
        gap: theme.spacing.small,
        marginTop: theme.spacing.medium,
    },
    recurringOption: {
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.small,
        borderRadius: theme.borderRadius.medium,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
    },
    recurringOptionSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    recurringText: {
        fontSize: theme.typography.fontSize.small,
        color: theme.colors.text,
    },
    recurringTextSelected: {
        color: 'white',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: theme.spacing.small,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
        borderWidth: 2,
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
    },
    priorityText: {
        fontSize: theme.typography.fontSize.medium,
        fontWeight: theme.typography.fontWeight.semibold as any,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: theme.spacing.medium,
        marginBottom: theme.spacing.large,
        gap: theme.spacing.medium,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.medium,
        paddingHorizontal: theme.spacing.large,
        borderRadius: theme.borderRadius.medium,
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: theme.colors.cardBackground,
    },
    deleteButtonText: {
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.error,
        marginLeft: theme.spacing.small,
        fontWeight: theme.typography.fontWeight.medium as any,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.medium as any,
    },
    saveButtonMain: {
        flex: 1,
        borderRadius: theme.borderRadius.medium,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        paddingVertical: theme.spacing.medium,
        alignItems: 'center',
    },
    saveButtonMainText: {
        fontSize: theme.typography.fontSize.medium,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.white,
    },
});

export default EventEditorScreen;

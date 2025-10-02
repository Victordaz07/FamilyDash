import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoalCategory, Goal } from '../types/goalTypes';
import { goalTemplates, goalCategories, mockFamilyMembers } from '../mock/goalsData';
import { theme } from '../../../styles/simpleTheme';

interface AddGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (goalData: NewGoalData) => void;
}

interface NewGoalData {
    title: string;
    description?: string;
    category: GoalCategory;
    assignedTo: string[];
    dueDate: string;
    reward?: string;
    milestones: number;
    priority?: 'low' | 'medium' | 'high';
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ visible, onClose, onSubmit }) => {
    const insets = useSafeAreaInsets();

    const [formData, setFormData] = useState<NewGoalData>({
        title: '',
        description: '',
        category: 'personal',
        assignedTo: ['all'],
        dueDate: '',
        reward: '',
        milestones: 1,
        priority: 'medium',
    });

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a goal title');
            return;
        }
        if (!formData.dueDate) {
            Alert.alert('Error', 'Please select a due date');
            return;
        }

        onSubmit(formData);
        onClose();
    };

    const selectTemplate = (template: any) => {
        setSelectedTemplate(template.id);
        setFormData({
            ...formData,
            title: template.title,
            description: template.description,
            category: template.category,
            milestones: template.milestones,
            reward: template.defaultReward,
        });
    };

    const selectCategory = (category: GoalCategory) => {
        setFormData({
            ...formData,
            category,
        });
    };

    const selectPriority = (priority: 'low' | 'medium' | 'high') => {
        setFormData({
            ...formData,
            priority,
        });
    };

    const selectMember = (memberId: string) => {
        if (memberId === 'all') {
            setFormData({
                ...formData,
                assignedTo: ['all'],
            });
        } else {
            const currentAssigned = formData.assignedTo.includes('all')
                ? []
                : formData.assignedTo;

            if (currentAssigned.includes(memberId)) {
                setFormData({
                    ...formData,
                    assignedTo: currentAssigned.filter(id => id !== memberId),
                });
            } else {
                setFormData({
                    ...formData,
                    assignedTo: [...currentAssigned, memberId],
                });
            }
        }
    };

    const getCategoryConfig = (categoryId: string) => {
        return goalCategories.find(c => c.id === categoryId);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return theme.colors.gray;
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#F59E0B', '#FBBF24']}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>Add New Goal 🎯</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Quick Templates */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🌟 Quick Templates</Text>
                            <View style={styles.templatesContainer}>
                                {goalTemplates.map((template) => {
                                    const categoryConfig = getCategoryConfig(template.category);
                                    return (
                                        <TouchableOpacity
                                            key={template.id}
                                            style={[
                                                styles.templateCard,
                                                selectedTemplate === template.id && styles.templateCardSelected,
                                                { borderColor: categoryConfig?.color || theme.colors.border }
                                            ]}
                                            onPress={() => selectTemplate(template)}
                                        >
                                            <LinearGradient
                                                colors={categoryConfig?.gradient as [string, string] || [theme.colors.primary, theme.colors.primaryDark]}
                                                style={styles.templateIcon}
                                            >
                                                <Text style={styles.templateEmoji}>{template.emoji}</Text>
                                            </LinearGradient>
                                            <View style={styles.templateContent}>
                                                <Text style={styles.templateTitle}>{template.title}</Text>
                                                <Text style={styles.templateDescription}>{template.description}</Text>
                                                <Text style={styles.templateDetails}>
                                                    {template.milestones} milestones • {categoryConfig?.name}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Custom Goal Form */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>✨ Create Custom Goal</Text>

                            {/* Goal Title */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Goal Title</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Learn Piano"
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="Describe your goal..."
                                    multiline
                                    numberOfLines={3}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                />
                            </View>

                            {/* Category Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <View style={styles.categoryGrid}>
                                    {goalCategories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.categoryOption,
                                                { borderColor: category.color },
                                                formData.category === category.id && {
                                                    backgroundColor: category.color,
                                                    borderColor: category.color
                                                }
                                            ]}
                                            onPress={() => selectCategory(category.id as GoalCategory)}
                                        >
                                            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                            <Text style={[
                                                styles.categoryText,
                                                { color: formData.category === category.id ? 'white' : category.color }
                                            ]}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Assigned To */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Assigned To</Text>
                                <View style={styles.membersContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.memberOption,
                                            formData.assignedTo.includes('all') && styles.memberSelected
                                        ]}
                                        onPress={() => selectMember('all')}
                                    >
                                        <Text style={styles.memberText}>👨‍👩‍👧‍👦 All Family</Text>
                                    </TouchableOpacity>
                                    {mockFamilyMembers.filter(m => m.role !== 'parent').map((member) => (
                                        <TouchableOpacity
                                            key={member.id}
                                            style={[
                                                styles.memberOption,
                                                formData.assignedTo.includes(member.id) && styles.memberSelected
                                            ]}
                                            onPress={() => selectMember(member.id)}
                                        >
                                            <Text style={styles.memberText}>{member.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Due Date */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Due Date</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="YYYY-MM-DD"
                                    value={formData.dueDate}
                                    onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                                />
                            </View>

                            {/* Milestones */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Number of Milestones</Text>
                                <View style={styles.milestonesContainer}>
                                    {[1, 3, 5, 7, 10, 15, 30].map((count) => (
                                        <TouchableOpacity
                                            key={count}
                                            style={[
                                                styles.milestoneOption,
                                                formData.milestones === count && styles.milestoneSelected
                                            ]}
                                            onPress={() => setFormData({ ...formData, milestones: count })}
                                        >
                                            <Text style={[
                                                styles.milestoneText,
                                                formData.milestones === count && styles.milestoneTextSelected
                                            ]}>
                                                {count}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Priority */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Priority</Text>
                                <View style={styles.priorityContainer}>
                                    {(['low', 'medium', 'high'] as const).map((priority) => (
                                        <TouchableOpacity
                                            key={priority}
                                            style={[
                                                styles.priorityOption,
                                                { borderColor: getPriorityColor(priority) },
                                                formData.priority === priority && {
                                                    backgroundColor: getPriorityColor(priority),
                                                    borderColor: getPriorityColor(priority)
                                                }
                                            ]}
                                            onPress={() => selectPriority(priority)}
                                        >
                                            <Text style={[
                                                styles.priorityText,
                                                { color: formData.priority === priority ? 'white' : getPriorityColor(priority) }
                                            ]}>
                                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Reward */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Reward 🎁</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Movie night, Ice cream"
                                    value={formData.reward}
                                    onChangeText={(text) => setFormData({ ...formData, reward: text })}
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                <LinearGradient
                                    colors={['#F59E0B', '#FBBF24']}
                                    style={styles.submitButtonGradient}
                                >
                                    <Ionicons name="rocket" size={20} color="white" />
                                    <Text style={styles.submitButtonText}>Create Goal 🚀</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalContent: {
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 16,
    },
    templatesContainer: {
        gap: 12,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    templateCardSelected: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#F59E0B',
    },
    templateIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    templateEmoji: {
        fontSize: 24,
    },
    templateContent: {
        flex: 1,
    },
    templateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    templateDescription: {
        fontSize: 14,
        color: theme.colors.gray,
        marginBottom: 4,
    },
    templateDetails: {
        fontSize: 12,
        color: theme.colors.gray,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        minWidth: '45%',
    },
    categoryEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    membersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    memberOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    memberSelected: {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
    },
    memberText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
    },
    milestonesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    milestoneOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        minWidth: 50,
        alignItems: 'center',
    },
    milestoneSelected: {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
    },
    milestoneText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    milestoneTextSelected: {
        color: 'white',
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '600',
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 8,
    },
});

export default AddGoalModal;

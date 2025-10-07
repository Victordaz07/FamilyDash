/**
 * AddTaskScreen - Create new text-based task
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';
import { createTask } from '../../services/tasks';

export default function AddTaskScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const themeGradient = useThemeGradient();

    // Ensure gradient has at least 2 colors for LinearGradient
    const gradient = themeGradient.length >= 2
        ? themeGradient as [string, string, ...string[]]
        : ['#667eea', '#764ba2'] as [string, string];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState('0');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a task title.');
            return;
        }

        setLoading(true);

        try {
            console.log('📋 Creating new task:', title);

            await createTask({
                title: title.trim(),
                description: description.trim() || undefined,
                type: 'text',
                points: Number(points) || 0,
            });

            Alert.alert(
                'Success!',
                'Task created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('❌ Error creating task:', error);
            Alert.alert(
                'Error',
                'Failed to create task. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <LinearGradient
                colors={gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>New Task</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textInverseSecondary }]}>
                            Create a text-based task
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Task Form */}
                <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                        Task Details
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text, fontSize: fonts.body }]}>
                            Title *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.inputBackground,
                                    fontSize: fonts.body
                                }
                            ]}
                            placeholder="Enter task title..."
                            placeholderTextColor={colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text, fontSize: fonts.body }]}>
                            Description
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                {
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.inputBackground,
                                    fontSize: fonts.body
                                }
                            ]}
                            placeholder="Enter task description (optional)..."
                            placeholderTextColor={colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text, fontSize: fonts.body }]}>
                            Points Reward
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.inputBackground,
                                    fontSize: fonts.body
                                }
                            ]}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={[styles.inputHint, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                            Points earned when task is completed
                        </Text>
                    </View>
                </View>

                {/* Preview Card */}
                {(title || description) && (
                    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                            Preview
                        </Text>
                        <View style={styles.previewContent}>
                            <View style={styles.previewHeader}>
                                <Text style={[styles.previewTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                    {title || 'Task Title'}
                                </Text>
                                <View style={[styles.previewStatus, { backgroundColor: colors.warning }]}>
                                    <Text style={[styles.previewStatusText, { fontSize: fonts.caption }]}>PENDING</Text>
                                </View>
                            </View>
                            {description && (
                                <Text style={[styles.previewDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                    {description}
                                </Text>
                            )}
                            <View style={styles.previewMeta}>
                                <View style={styles.previewMetaItem}>
                                    <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.previewMetaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                        TEXT
                                    </Text>
                                </View>
                                {Number(points) > 0 && (
                                    <View style={styles.previewMetaItem}>
                                        <Ionicons name="star" size={16} color={colors.warning} />
                                        <Text style={[styles.previewMetaText, { color: colors.warning, fontSize: fonts.caption }]}>
                                            {points} pts
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Create Button */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleSave}
                    disabled={loading || !title.trim()}
                >
                    <LinearGradient
                        colors={gradient}
                        style={[
                            styles.createButtonGradient,
                            (!title.trim() || loading) && styles.createButtonDisabled
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons
                            name={loading ? "hourglass" : "add-circle"}
                            size={20}
                            color="white"
                            style={styles.buttonIcon}
                        />
                        <Text style={[styles.createButtonText, { fontSize: fonts.button }]}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    formCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputHint: {
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    previewContent: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    previewTitle: {
        flex: 1,
        fontWeight: 'bold',
        marginRight: 10,
    },
    previewStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    previewStatusText: {
        color: 'white',
        fontWeight: 'bold',
    },
    previewDescription: {
        marginBottom: 12,
        lineHeight: 18,
    },
    previewMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    previewMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewMetaText: {
        marginLeft: 4,
        fontWeight: '500',
    },
    createButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    buttonIcon: {
        marginRight: 10,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

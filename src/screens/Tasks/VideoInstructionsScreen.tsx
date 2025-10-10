/**
 * VideoInstructionsScreen - Create task with video attachment
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
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';
import { uploadVideoAndCreateTask } from '../../services/tasks';

export default function VideoInstructionsScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    const [title, setTitle] = useState('Video Instructions');
    const [description, setDescription] = useState('Please follow these video instructions.');
    const [points, setPoints] = useState('5');
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant permission to access your media library to add video instructions.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickVideo = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                setVideoUri(result.assets[0].uri);
                console.log('🎥 Video selected:', result.assets[0].uri);
            }
        } catch (error) {
            console.error('❌ Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video. Please try again.');
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a task title.');
            return;
        }

        if (!videoUri) {
            Alert.alert('Video Required', 'Please select a video for the instructions.');
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            console.log('🎥 Creating video instruction task:', title);

            await uploadVideoAndCreateTask({
                localUri: videoUri,
                title: title.trim(),
                description: description.trim() || undefined,
                points: Number(points) || 0,
            });

            Alert.alert(
                'Success!',
                'Video instruction task created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('❌ Error creating video task:', error);
            Alert.alert(
                'Error',
                'Failed to create video instruction task. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <LinearGradient
                colors={gradient as readonly [string, string]}
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
                        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>Video Instructions</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textInverseSecondary }]}>
                            Attach video instructions to a task
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Video Selection */}
                <View style={[styles.videoCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                        Video Instructions
                    </Text>

                    <View style={styles.videoContainer}>
                        <View style={[styles.videoIconContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="videocam" size={48} color="white" />
                        </View>

                        {videoUri ? (
                            <View style={styles.videoSelectedContainer}>
                                <Text style={[styles.videoSelectedText, { color: colors.success, fontSize: fonts.body }]}>
                                    ✓ Video Selected
                                </Text>
                                <TouchableOpacity
                                    style={[styles.changeVideoButton, { backgroundColor: colors.secondary }]}
                                    onPress={pickVideo}
                                >
                                    <Ionicons name="refresh" size={16} color="white" />
                                    <Text style={[styles.changeVideoText, { fontSize: fonts.caption }]}>Change Video</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.videoNotSelectedContainer}>
                                <Text style={[styles.videoNotSelectedText, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                    No video selected
                                </Text>
                                <TouchableOpacity
                                    style={[styles.pickVideoButton, { backgroundColor: colors.primary }]}
                                    onPress={pickVideo}
                                >
                                    <Ionicons name="videocam" size={20} color="white" />
                                    <Text style={[styles.pickVideoText, { fontSize: fonts.body }]}>Select Video</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.videoHint, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        Choose a video file from your device to attach as instructions
                    </Text>
                </View>

                {/* Task Details */}
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
                            placeholder="Describe what needs to be done..."
                            placeholderTextColor={colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            maxLength={300}
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
                            placeholder="5"
                            placeholderTextColor={colors.textSecondary}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={[styles.inputHint, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                            Points earned when video instructions are followed
                        </Text>
                    </View>
                </View>

                {/* Preview */}
                {(title || videoUri) && (
                    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                            Preview
                        </Text>
                        <View style={styles.previewContent}>
                            <View style={styles.previewHeader}>
                                <Text style={[styles.previewTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                    {title || 'Video Instruction Task'}
                                </Text>
                                <View style={[styles.previewStatus, { backgroundColor: colors.warning }]}>
                                    <Text style={[styles.previewStatusText, { fontSize: fonts.caption }]}>PENDING</Text>
                                </View>
                            </View>

                            <View style={[styles.previewVideoContainer, { backgroundColor: colors.border }]}>
                                <Ionicons name="videocam" size={32} color={colors.textSecondary} />
                                <Text style={[styles.previewVideoText, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                    {videoUri ? 'Video instructions attached' : 'No video selected'}
                                </Text>
                            </View>

                            {description && (
                                <Text style={[styles.previewDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                    {description}
                                </Text>
                            )}

                            <View style={styles.previewMeta}>
                                <View style={styles.previewMetaItem}>
                                    <Ionicons name="videocam" size={16} color={colors.primary} />
                                    <Text style={[styles.previewMetaText, { color: colors.primary, fontSize: fonts.caption }]}>
                                        VIDEO
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
                    disabled={loading || !title.trim() || !videoUri}
                >
                    <LinearGradient
                        colors={gradient as readonly [string, string]}
                        style={[
                            styles.createButtonGradient,
                            (!title.trim() || !videoUri || loading) && styles.createButtonDisabled
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {uploading ? (
                            <Ionicons name="cloud-upload" size={20} color="white" style={styles.buttonIcon} />
                        ) : (
                            <Ionicons name="videocam" size={20} color="white" style={styles.buttonIcon} />
                        )}
                        <Text style={[styles.createButtonText, { fontSize: fonts.button }]}>
                            {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Video Task'}
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
    videoCard: {
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
    videoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    videoIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    videoSelectedContainer: {
        alignItems: 'center',
    },
    videoSelectedText: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    changeVideoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    changeVideoText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    videoNotSelectedContainer: {
        alignItems: 'center',
    },
    videoNotSelectedText: {
        marginBottom: 12,
    },
    pickVideoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    pickVideoText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    videoHint: {
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 18,
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
        height: 80,
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
        marginBottom: 12,
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
    previewVideoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
    },
    previewVideoText: {
        marginTop: 8,
        textAlign: 'center',
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

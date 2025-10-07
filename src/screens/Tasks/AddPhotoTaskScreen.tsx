/**
 * AddPhotoTaskScreen - Create task with photo attachment
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
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';
import { uploadPhotoAndCreateTask } from '../../services/tasks';

export default function AddPhotoTaskScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState('0');
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant permission to access your photo library to add photo tasks.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        try {
            console.log('📸 Starting image picker...');

            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                console.log('📸 Permission denied');
                return;
            }

            console.log('📸 Permission granted, launching image picker...');

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            console.log('📸 Image picker result:', result);

            if (!result.canceled && result.assets && result.assets[0]) {
                setLocalUri(result.assets[0].uri);
                console.log('📸 Photo selected successfully:', result.assets[0].uri);
            } else {
                console.log('📸 Image picker was canceled or no assets');
            }
        } catch (error) {
            console.error('❌ Error picking image:', error);
            Alert.alert(
                'Error',
                `Failed to pick image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
            );
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a task title.');
            return;
        }

        if (!localUri) {
            Alert.alert('Photo Required', 'Please select a photo for this task.');
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            console.log('📸 Creating photo task:', title);
            console.log('📸 Local URI:', localUri);
            console.log('📸 Description:', description);
            console.log('📸 Points:', points);

            await uploadPhotoAndCreateTask({
                localUri,
                title: title.trim(),
                description: description.trim() || undefined,
                points: Number(points) || 0,
            });

            console.log('✅ Photo task created successfully');

            Alert.alert(
                'Success!',
                'Photo task created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('❌ Error creating photo task:', error);

            let errorMessage = 'Failed to create photo task. Please try again.';
            if (error instanceof Error) {
                errorMessage = `Failed to create photo task: ${error.message}`;
            }

            Alert.alert(
                'Error',
                errorMessage,
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
                        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>Photo Task</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textInverseSecondary }]}>
                            Create a task with photo
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo Selection */}
                <View style={[styles.photoCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                        Photo
                    </Text>

                    {localUri ? (
                        <View style={styles.photoContainer}>
                            <Image source={{ uri: localUri }} style={styles.photoPreview} />
                            <TouchableOpacity
                                style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
                                onPress={pickImage}
                            >
                                <Ionicons name="camera" size={16} color="white" />
                                <Text style={[styles.changePhotoText, { fontSize: fonts.caption }]}>Change Photo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.pickPhotoButton, { backgroundColor: colors.border }]}
                            onPress={pickImage}
                        >
                            <Ionicons name="camera" size={48} color={colors.textSecondary} />
                            <Text style={[styles.pickPhotoText, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                Tap to Select Photo
                            </Text>
                            <Text style={[styles.pickPhotoSubtext, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                Choose from your photo library
                            </Text>
                        </TouchableOpacity>
                    )}
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
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={[styles.inputHint, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                            Points earned when photo task is completed
                        </Text>
                    </View>
                </View>

                {/* Preview */}
                {(title || localUri) && (
                    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                            Preview
                        </Text>
                        <View style={styles.previewContent}>
                            <View style={styles.previewHeader}>
                                <Text style={[styles.previewTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                    {title || 'Photo Task Title'}
                                </Text>
                                <View style={[styles.previewStatus, { backgroundColor: colors.warning }]}>
                                    <Text style={[styles.previewStatusText, { fontSize: fonts.caption }]}>PENDING</Text>
                                </View>
                            </View>

                            {localUri && (
                                <View style={styles.previewPhotoContainer}>
                                    <Image source={{ uri: localUri }} style={styles.previewPhoto} />
                                    <View style={[styles.photoOverlay, { backgroundColor: colors.primary }]}>
                                        <Ionicons name="camera" size={16} color="white" />
                                        <Text style={[styles.photoOverlayText, { fontSize: fonts.caption }]}>PHOTO TASK</Text>
                                    </View>
                                </View>
                            )}

                            {description && (
                                <Text style={[styles.previewDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                    {description}
                                </Text>
                            )}

                            <View style={styles.previewMeta}>
                                <View style={styles.previewMetaItem}>
                                    <Ionicons name="camera" size={16} color={colors.primary} />
                                    <Text style={[styles.previewMetaText, { color: colors.primary, fontSize: fonts.caption }]}>
                                        PHOTO
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
                    disabled={loading || !title.trim() || !localUri}
                >
                    <LinearGradient
                        colors={gradient}
                        style={[
                            styles.createButtonGradient,
                            (!title.trim() || !localUri || loading) && styles.createButtonDisabled
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {uploading ? (
                            <Ionicons name="cloud-upload" size={20} color="white" style={styles.buttonIcon} />
                        ) : (
                            <Ionicons name="camera" size={20} color="white" style={styles.buttonIcon} />
                        )}
                        <Text style={[styles.createButtonText, { fontSize: fonts.button }]}>
                            {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Photo Task'}
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
    photoCard: {
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
    photoContainer: {
        alignItems: 'center',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    changePhotoText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    pickPhotoButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ccc',
    },
    pickPhotoText: {
        marginTop: 12,
        fontWeight: '600',
    },
    pickPhotoSubtext: {
        marginTop: 4,
        textAlign: 'center',
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
    previewPhotoContainer: {
        position: 'relative',
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    previewPhoto: {
        width: '100%',
        height: 120,
    },
    photoOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    photoOverlayText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
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

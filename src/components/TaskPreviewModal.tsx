/**
 * TaskPreviewModal - Modal for previewing task details with media
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../contexts/ThemeContext';
import { Task } from '../services/tasks';
import { VideoErrorBoundary } from '../video/VideoErrorBoundary';
import { VideoPlayerViewSimple } from '../video/VideoPlayerViewSimple';
import ShoppingListModalNew from './shopping/ShoppingListModalNew';

const { width, height } = Dimensions.get('window');

// Video Preview Component using the new robust VideoPlayerView
const VideoPreview: React.FC<{ uri: string; onPress: () => void }> = ({ uri, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.videoContainer}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <VideoPlayerViewSimple
                uri={uri}
                visible={true}
                autoPlay={false}
                loop={false}
                muted={true}
                stallTimeoutMs={12000}
                maxRetries={2}
                onError={(error) => {
                    console.warn('Video preview error:', error);
                }}
                style={styles.mediaVideo}
            />
            <View style={styles.mediaOverlay}>
                <Ionicons name="play" size={32} color="white" />
            </View>
        </TouchableOpacity>
    );
};

interface TaskPreviewModalProps {
    visible: boolean;
    task: Task | null;
    onClose: () => void;
    onEdit?: () => void;
    onComplete?: () => void;
    onRestore?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

export default function TaskPreviewModal({
    visible,
    task,
    onClose,
    onEdit,
    onComplete,
    onRestore,
    onDelete,
    showActions = true
}: TaskPreviewModalProps) {
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const themeGradient = useThemeGradient();

    // Video modal state - Hooks must be at the top
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
    
    // Shopping list modal state
    const [shoppingOpen, setShoppingOpen] = useState(false);

    // Ensure gradient has at least 2 colors for LinearGradient
    const gradient = themeGradient.length >= 2
        ? themeGradient as [string, string, ...string[]]
        : ['#667eea', '#764ba2'] as [string, string];

    if (!task) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return colors.success;
            case 'overdue': return colors.error;
            case 'pending': return colors.warning;
            default: return colors.textSecondary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return 'checkmark-circle';
            case 'overdue': return 'warning';
            case 'pending': return 'time';
            default: return 'ellipse-outline';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'No date';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleImagePress = (imageUrl: string) => {
        Alert.alert(
            'Image Preview',
            'Full screen image preview would open here',
            [{ text: 'OK' }]
        );
    };

    const handleVideoPress = (videoUrl: string) => {
        console.log('Opening video modal with URL:', videoUrl);
        console.log('Video URL type:', typeof videoUrl);
        console.log('Video URL length:', videoUrl?.length);
        setSelectedVideoUri(videoUrl);
        setVideoModalVisible(true);
    };

    const closeVideoModal = () => {
        setVideoModalVisible(false);
        setSelectedVideoUri(null);
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <LinearGradient
                    colors={gradient}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                style={styles.closeButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
                                Task Preview
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textInverseSecondary }]}>
                                {task.type.toUpperCase()} Task
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Task Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.taskHeader}>
                            <Text style={[styles.taskTitle, { color: colors.text, fontSize: fonts.h2 }]}>
                                {task.title}
                            </Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(task.status) }
                            ]}>
                                <Ionicons
                                    name={getStatusIcon(task.status) as any}
                                    size={16}
                                    color="white"
                                />
                                <Text style={[styles.statusText, { fontSize: fonts.caption }]}>
                                    {task.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {task.description && (
                            <Text style={[styles.taskDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                {task.description}
                            </Text>
                        )}

                        <View style={styles.taskMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons
                                    name={task.type === 'photo' ? 'camera' : 'document-text'}
                                    size={16}
                                    color={colors.textSecondary}
                                />
                                <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                    {task.type.toUpperCase()}
                                </Text>
                            </View>

                            {task.points > 0 && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="star" size={16} color={colors.warning} />
                                    <Text style={[styles.metaText, { color: colors.warning, fontSize: fonts.caption }]}>
                                        {task.points} pts
                                    </Text>
                                </View>
                            )}

                            <View style={styles.metaItem}>
                                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                                <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                    Created: {formatDate(task.createdAt)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Media Attachments */}
                    {task.attachments && task.attachments.length > 0 && (
                        <View style={[styles.mediaCard, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                Attachments ({task.attachments.length})
                            </Text>

                            <View style={styles.mediaGrid}>
                                {task.attachments.map((attachment, index) => (
                                    <View key={index} style={styles.mediaItem}>
                                        {attachment.kind === 'photo' ? (
                                            <TouchableOpacity
                                                style={styles.imageContainer}
                                                onPress={() => handleImagePress(attachment.url)}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={{ uri: attachment.url }}
                                                    style={styles.mediaImage}
                                                    resizeMode="cover"
                                                />
                                                <View style={styles.mediaOverlay}>
                                                    <Ionicons name="expand" size={24} color="white" />
                                                </View>
                                            </TouchableOpacity>
                                        ) : (
                                            <VideoErrorBoundary
                                                fallback={
                                                    <View style={styles.videoContainer}>
                                                        <View style={styles.errorContainer}>
                                                            <Ionicons name="videocam-off" size={32} color="#666" />
                                                            <Text style={styles.errorText}>Error de video</Text>
                                                        </View>
                                                    </View>
                                                }
                                                onError={(error, errorInfo) => {
                                                    console.error('Video Error Boundary triggered:', error, errorInfo);
                                                }}
                                            >
                                                <VideoPreview
                                                    uri={attachment.url}
                                                    onPress={() => handleVideoPress(attachment.url)}
                                                />
                                            </VideoErrorBoundary>
                                        )}
                                        <Text style={[styles.mediaLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                            {attachment.kind.toUpperCase()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    {showActions && (
                        <View style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.actionButtons}>
                                {onEdit && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.editButton]}
                                        onPress={onEdit}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={[colors.primary, colors.secondary || colors.primary]}
                                            style={styles.actionButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <View style={styles.actionButtonContent}>
                                                <View style={styles.actionIconContainer}>
                                                    <Ionicons name="create-outline" size={20} color="white" />
                                                </View>
                                                <Text style={[styles.actionButtonText, { fontSize: fonts.body }]}>
                                                    Edit Task
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {onComplete && task.status !== 'completed' && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.completeButton]}
                                        onPress={onComplete}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={[colors.success, '#059669']}
                                            style={styles.actionButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <View style={styles.actionButtonContent}>
                                                <View style={styles.actionIconContainer}>
                                                    <Ionicons name="checkmark-outline" size={20} color="white" />
                                                </View>
                                                <Text style={[styles.actionButtonText, { fontSize: fonts.body }]}>
                                                    Complete Task
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {onRestore && task.archived && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.restoreButton]}
                                        onPress={onRestore}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={[colors.info, '#2563eb']}
                                            style={styles.actionButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <View style={styles.actionButtonContent}>
                                                <View style={styles.actionIconContainer}>
                                                    <Ionicons name="refresh-outline" size={20} color="white" />
                                                </View>
                                                <Text style={[styles.actionButtonText, { fontSize: fonts.body }]}>
                                                    Restore Task
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {onDelete && task.archived && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={onDelete}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={[colors.error, '#dc2626']}
                                            style={styles.actionButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <View style={styles.actionButtonContent}>
                                                <View style={styles.actionIconContainer}>
                                                    <Ionicons name="trash-outline" size={20} color="white" />
                                                </View>
                                                <Text style={[styles.actionButtonText, { fontSize: fonts.body }]}>
                                                    Delete Task
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                                
                                {/* Shopping List Button */}
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.shoppingButton]}
                                    onPress={() => setShoppingOpen(true)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#7c3aed', '#6d28d9']}
                                        style={styles.actionButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <View style={styles.actionButtonContent}>
                                            <View style={styles.actionIconContainer}>
                                                <Ionicons name="cart" size={20} color="white" />
                                            </View>
                                            <Text style={[styles.actionButtonText, { fontSize: fonts.body }]}>
                                                Shopping List
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Video Player Modal */}
            <Modal
                visible={videoModalVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={closeVideoModal}
            >
                <View style={styles.videoModalContainer}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.videoModalCloseButton}
                        onPress={closeVideoModal}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                            style={styles.videoModalCloseButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Video Player */}
                    <VideoErrorBoundary
                        fallback={
                            <View style={styles.videoModalFallback}>
                                <Ionicons name="videocam-off" size={64} color="#666" />
                                <Text style={styles.videoModalFallbackText}>
                                    No se pudo reproducir el video
                                </Text>
                                <TouchableOpacity
                                    style={styles.videoModalRetryButton}
                                    onPress={closeVideoModal}
                                >
                                    <Text style={styles.videoModalRetryButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        onError={(error, errorInfo) => {
                            console.error('Video Modal Error Boundary triggered:', error, errorInfo);
                        }}
                    >
                        {selectedVideoUri && (
                            <VideoPlayerViewSimple
                                uri={selectedVideoUri}
                                visible={videoModalVisible}
                                autoPlay={true}
                                loop={false}
                                muted={false}
                                stallTimeoutMs={15000}
                                maxRetries={3}
                                onError={(error) => {
                                    console.error('Video modal error:', error);
                                    console.error('Video URI:', selectedVideoUri);
                                    console.error('Error details:', JSON.stringify(error, null, 2));
                                }}
                                onReady={() => {
                                    console.log('Video modal is ready to play');
                                    console.log('Video URI:', selectedVideoUri);
                                }}
                                style={styles.videoModalPlayer}
                            />
                        )}
                    </VideoErrorBoundary>
                </View>
            </Modal>
            
            {/* Shopping List Modal */}
            <ShoppingListModalNew
                visible={shoppingOpen}
                onClose={() => setShoppingOpen(false)}
                taskId={task?.id || ''}
                familyId="default_family"
                userId="default_user"
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        overflow: 'hidden',
    },
    closeButtonGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
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
        padding: 24,
        paddingTop: 20,
    },
    infoCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskTitle: {
        flex: 1,
        fontWeight: 'bold',
        marginRight: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    taskDescription: {
        marginBottom: 16,
        lineHeight: 20,
    },
    taskMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 12,
    },
    metaText: {
        marginLeft: 4,
        fontWeight: '500',
    },
    mediaCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    mediaItem: {
        width: (width - 80) / 2,
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    videoContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    mediaImage: {
        width: (width - 80) / 2,
        height: (width - 80) / 2,
    },
    mediaVideo: {
        width: (width - 80) / 2,
        height: (width - 80) / 2,
    },
    mediaOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaLabel: {
        marginTop: 8,
        fontWeight: '500',
    },
    actionsCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    actionButtons: {
        gap: 16,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    actionButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    editButton: {
        // Additional styles for edit button if needed
    },
    completeButton: {
        // Additional styles for complete button if needed
    },
    restoreButton: {
        // Additional styles for restore button if needed
    },
    deleteButton: {
        // Additional styles for delete button if needed
    },
    shoppingButton: {
        // Additional styles for shopping button if needed
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
    },
    errorText: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    // Video Modal Styles
    videoModalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoModalCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    videoModalCloseButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoModalPlayer: {
        width: '100%',
        height: '100%',
    },
    videoModalFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    videoModalFallbackText: {
        marginTop: 20,
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    videoModalRetryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    videoModalRetryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

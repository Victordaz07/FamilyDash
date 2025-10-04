/**
 * Advanced SafeRoom Types
 * Comprehensive types for voice/video recording, sharing, and multimedia management
 */

export type MediaType = 'audio' | 'video' | 'image' | 'text';
export type RecordStatus = 'idle' | 'recording' | 'paused' | 'processing' | 'completed' | 'error';
export type ShareStatus = 'idle' | 'preparing' | 'sharing' | 'completed' | 'error';

export interface SafeRoomMessage {
    id: string;
    type: MediaType;
    content: string; // Text content or file path
    metadata: MediaMetadata | TextMetadata;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    createdAt: Date;
    updatedAt?: Date;
    reactions: MessageReaction[];
    comments: Comment[];
    tags?: string[];
    isPublic: boolean;
    isEncrypted?: boolean;
}

export interface MediaMetadata {
    duration?: number; // Duration in seconds
    size: number; // File size in bytes
    width?: number;
    height?: number;
    format: string; // e.g., 'mp3', 'mp4', 'jpg'
    thumbnail?: string; // Path to thumbnail image
    waveform?: number[]; // Audio waveform data
    quality: 'low' | 'medium' | 'high';
    caption?: string;
}

export interface TextMetadata {
    wordCount?: number;
    language?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface MessageReaction {
    id: string;
    authorId: string;
    authorName: string;
    type: ReactionType;
    createdAt: Date;
}

export type ReactionType =
    | 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
    | 'support' | 'prayer' | 'hug' | 'kiss' | 'thumbsup' | 'heart';

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    reactions: CommentReaction[];
}

export interface CommentReaction {
    id: string;
    authorId: string;
    type: ReactionType;
    createdAt: Date;
}

// Recording Configuration
export interface RecordingConfig {
    audio: {
        quality: 'low' | 'medium' | 'high';
        sampleRate?: number;
        channels?: number;
        format: 'mp3' | 'wav' | 'aac';
    };
    video: {
        quality: 'low' | 'medium' | 'high';
        resolution?: { width: number; height: number };
        frameRate?: number;
        format: 'mp4' | 'mov';
        audioEnabled: boolean;
    };
}

// Recording Action Types
export interface RecordingAction {
    type: 'start' | 'stop' | 'pause' | 'resume' | 'cancel';
    mediaType: MediaType;
    config?: RecordingConfig;
    duration?: number;
    filePath?: string;
}

// Recording State
export interface RecordingState {
    status: RecordStatus;
    mediaType: MediaType | null;
    startTime: Date | null;
    pauseTime: Date | null;
    currentDuration: number; // milliseconds
    totalDuration: number; // milliseconds
    filePath: string | null;
    config: RecordingConfig | null;
    error?: string;
}

// Media Player State
export interface MediaPlayerState {
    isPlaying: boolean;
    isPaused: boolean;
    currentTime: number; // seconds
    duration: number; // seconds
    volume: number; // 0.0 to 1.0
    playbackRate: number;
    loop: boolean;
    shuffle: boolean;
    isLoading: boolean;
    error?: string;
}

// Safe Room Settings
export interface SafeRoomSettings {
    recording: RecordingConfig;
    audio: {
        autoStart: boolean;
        maxDuration: number; // seconds
        noiseReduction: boolean;
        echoCancellation: boolean;
    };
    video: {
        autoStart: boolean;
        maxDuration: number; // seconds
        stabilizationEnabled: boolean;
        hdrEnabled: boolean;
    };
    sharing: {
        autoSaveToGallery: boolean;
        maxFileSize: number; // bytes
        allowedFormats: string[];
    };
    privacy: {
        defaultVisibility: 'private' | 'family' | 'public';
        encryptSensitiveContent: boolean;
        autoDeleteAfterDays: number;
    };
}

// Filter and Search Options
export interface SafeRoomFilters {
    mediaType?: MediaType[];
    authorIds?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    tags?: string[];
    isPublic?: boolean;
    hasReactions?: boolean;
    hasComments?: boolean;
}

export interface SafeRoomSortOptions {
    field: 'createdAt' | 'updatedAt' | 'reactionCount' | 'duration' | 'size';
    direction: 'asc' | 'desc';
}

// Analytics and Stats
export interface SafeRoomStats {
    totalMessages: number;
    totalAudioDuration: number; // seconds
    totalVideoDuration: number; // seconds
    totalStorageUsed: number; // bytes
    messagesByType: Record<MediaType, number>;
    topReactions: Array<{ type: ReactionType; count: number }>;
    mostActiveMembers: Array<{ id: string; name: string; count: number }>;
    weeklyActivity: Array<{ date: string; messages: number }>;
}

// Export request/response types
export interface ExportRequest {
    format: 'pdf' | 'zip' | 'json';
    includeMedia: boolean;
    dateRange?: { start: Date; end: Date };
    includeMetadata: boolean;
    password?: string; // For encrypted exports
}

export interface ExportResult {
    success: boolean;
    filePath?: string;
    fileSize?: number;
    error?: string;
    exports?: number; // Number of items exported
}

// Permission types
export type SafeRoomPermission =
    | 'create_messages'
    | 'react_to_messages'
    | 'comment_on_messages'
    | 'delete_own_messages'
    | 'download_media'
    | 'export_data'
    | 'view_analytics'
    | 'manage_settings'
    | 'moderate_content';

export interface SafeRoomMemberPermission {
    memberId: string;
    permissions: SafeRoomPermission[];
}

// Notification types for SafeRoom
export interface SafeRoomNotification {
    id: string;
    type: 'new_message' | 'new_reaction' | 'new_comment' | 'recording_completed' | 'shared_by_member';
    messageId?: string;
    authorId?: string;
    authorName?: string;
    content?: string;
    timestamp: Date;
    isRead: boolean;
    actionData?: Record<string, any>;
}

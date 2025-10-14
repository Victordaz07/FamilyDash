/**
 * SafeRoom Types - Multimedia support
 * Based on Task multimedia structure
 */

export type SafeRoomMessageType = "text" | "voice" | "video" | "image" | "audio";

export interface SafeRoomAttachment {
  type: "video" | "image" | "audio" | "voice";
  title: string;
  url: string;
  duration?: string;
  thumbnailUrl?: string;
  metadata?: {
    size?: number;
    format?: string;
    resolution?: string;
    codec?: string;
  };
}

export interface SafeRoomMessage {
  id: string;
  type: SafeRoomMessageType;
  content: string;
  attachments?: SafeRoomAttachment[];
  sender: string;
  senderId: string;
  timestamp: Date;
  mood?: string;
  isRead?: boolean;
  reactions?: SafeRoomReaction[];
  duration?: number; // For voice/audio messages
}

export interface SafeRoomReaction {
  id: string;
  userId: string;
  userName: string;
  type: "heart" | "support" | "listen" | "care";
  timestamp: Date;
}

export interface SafeRoomMediaConfig {
  maxFileSize: number; // in MB
  allowedFormats: string[];
  maxDuration: number; // in seconds
  quality: "low" | "medium" | "high";
}

export interface SafeRoomUploadProgress {
  messageId: string;
  attachmentId: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

// Existing types (keeping for compatibility)
export interface EmotionalMessage {
  id: string;
  type: 'text' | 'voice' | 'audio' | 'video' | 'image';
  content: string;
  sender: string;
  timestamp: Date;
  mood?: string;
  attachments?: SafeRoomAttachment[];
  duration?: number;
}

export interface SafeRoomStats {
  messagesShared: number;
  heartsGiven: number;
  weeklyGoal: number;
  totalMediaShared: number;
  voiceMessagesSent: number;
  videoMessagesSent: number;
}





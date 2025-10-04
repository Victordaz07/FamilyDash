/**
 * Real-time Services Index
 * Central export for all real-time functionality
 */

// Core services
export { WebSocketManager } from './WebSocketManager';
export { RealTimeSync } from './RealTimeSync';

// Components
export { RealTimeStatus } from '../../components/realtime/RealTimeStatus';
export { RealTimeDashboard } from '../../components/realtime/RealTimeDashboard';

// Hooks
export {
    useRealTime,
    useRealTimeData,
    useRealTimeEntity,
    useRealTimeFamilyStatus,
} from '../../hooks/useRealTime';

// Types
export type {
    WebSocketConfig,
    RealTimeMessage,
    ConnectionState,
} from './WebSocketManager';

export type {
    SyncState,
    SyncOperation,
    ConflictResolution,
} from './RealTimeSync';

export type {
    RealTimeHookConfig,
    ConnectionStatus,
    RealTimeData,
} from '../../hooks/useRealTime';

export type {
    RealTimeStatusProps,
} from '../../components/realtime/RealTimeStatus';

export type {
    ActivityUpdate,
    ActivityFeedItemProps,
} from '../../components/realtime/RealTimeDashboard';

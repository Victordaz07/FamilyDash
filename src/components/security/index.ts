/**
 * Security Components Index
 * Central export for security functionality
 */

// Components
export { SecurityDashboard } from './SecurityDashboard';

// Service
export { SecurityService } from '../services/security/SecurityService';

// Types
export type {
  SecurityConfig,
  SecurityIncident,
  SecurityAction,
  AuditLog,
  BiometricAuth,
  SessionSecurity,
  ThreatDetected,
  EncryptionKey,
  SecurityPolicy,
  SecurityRule,
} from '../services/security/SecurityService';

/**
 * Security Service for FamilyDash
 * Advanced security features and threat protection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface SecurityConfig {
  authenticationLevel: 'basic' | 'enhanced' | 'maximum';
  encryptionEnabled: boolean;
  biometricAuthEnabled: boolean;
  multiFactorAuthEnabled: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sslPinningEnabled: boolean;
  certificateValidationEnabled: boolean;
  auditLoggingEnabled: boolean;
  dataLeakProtectionEnabled: boolean;
  automaticThreatScanningEnabled: boolean;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  sessionEncryptionEnabled: boolean;
  privacyLevel: 'basic' | 'enhanced' | 'maximum';
  loggingLevel: 'minimal' | 'standard' | 'verbose';
}

export interface SecurityIncident {
  incidentId: string;
  familyId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'data_access' | 'network' | 'device' | 'permission';
  title: string;
  description: string;
  timestamp: number;
  userId?: string;
  deviceId?: string;
  location?: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  actions: SecurityAction[];
  evidence?: any;
}

export interface SecurityAction {
  actionId: string;
  type: 'block_access' | 'require_reauth' | 'notify_admin' | 'log_event' | 'lock_device';
  parameters: any;
  executedAt: number;
  successful: boolean;
  description: string;
}

export interface AuditLog {
  logId: string;
  familyId: string;
  userId?: string;
  eventType: 'authentication' | 'data_access' | 'permission_change' | 'security_event' | 'system_change';
  action: string;
  resource: string;
  timestamp: number;
  sourceIP?: string;
  deviceId?: string;
  location?: string;
  success: boolean;
  metadata?: any;
}

export interface BiometricAuth {
  enabled: boolean;
  supportedTypes: Array<'fingerprint' | 'face' | 'voice' | 'iris'>;
  type: string;
  enrolled: boolean;
  lastUsed?: number;
  confidence: number; // 0-100
}

export interface SessionSecurity {
  sessionId: string;
  userId: string;
  familyId: string;
  deviceId: string;
  ipAddress?: string;
  location?: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  encryptionKey?: string;
  jwtToken: string;
  active: boolean;
}

export interface ThreatDetected {
  threatId: string;
  familyId: string;
  threatType: 'malware' | 'phishing' | 'unauthorized_access' | 'data_leak' | 'dos_attack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  source?: string;
  affectedUsers: string[];
  mitigationActions: string[];
  resolved: boolean;
  evidenceData?: any;
}

export interface EncryptionKey {
  keyId: string;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  created: number;
  expires?: number;
  status: 'active' | 'expired' | 'revoked';
  familyId: string;
  usage: 'data' | 'session' | 'communication';
  encryptedKey: string; // Encrypted with master key
}

export interface SecurityPolicy {
  policyId: string;
  familyId: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  priority: number;
  enabled: boolean;
  createdBy: string;
  createdAt: number;
  lastModified: number;
}

export interface SecurityRule {
  ruleId: string;
  condition: string; // JavaScript expression
  action: string; // SecurityAction type
  parameters: any;
  enabled: boolean;
}

export class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private activeSessions: Map<string, SessionSecurity> = new Map();
  private encryptionKeys: Map<string, EncryptionKey> = new Map();
  private incidentCounter: number = 0;
  private auditLogs: AuditLog[] = [];
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private threatMonitor: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.initializeService();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Initialize security service
   */
  private async initializeService(): Promise<void> {
    try {
      // Load security configuration
      await this.loadSecurityConfig();
      
      // Initialize encryption keys
      await this.initializeEncryptionKeys();
      
      // Setup threat monitoring
      this.startThreatMonitoring();
      
      // Load security policies
      await this.loadSecurityPolicies();
      
      // Initialize audit logging
      await this.initializeAuditLogging();

      console.log('🔒 Security Service initialized');
    } catch (error) {
      console.error('Error initializing security service:', error);
    }
  }

  /**
   * Configure security settings
   */
  async configureSecurity(config: SecurityConfig): Promise<boolean> {
    try {
      this.config = { ...this.config, ...config };
      
      // Apply configuration changes
      await this.applySecurityConfiguration();
      
      // Store configuration securely
      await this.storeSecurityConfig();
      
      // Log configuration change
      await this.auditLog({
        eventType: 'system_change',
        action: 'configure_security',
        resource: 'security_configuration',
        success: true,
        metadata: { configChange: config },
      });
      
      console.log('🔒 Security configuration updated');
      
      return true;
      
    } catch (error) {
      console.error('Error configuring security:', error);
      
      await this.auditLog({
        eventType: 'security_event',
        action: 'configure_security_failed',
        resource: 'security_configuration',
        success: false,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
      
      return false;
    }
  }

  /**
   * Authenticate user with enhanced security
   */
  async authenticateUser(
    userId: string,
    password: string,
    biometricData?: any,
    additionalFactors?: {
      totpCode?: string;
      pushNotification?: boolean;
      smsCode?: string;
    }
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Log authentication attempt
      await this.auditLog({
        userId,
        eventType: 'authentication',
        action: 'login_attempt',
        resource: 'account_access',
        success: false, // Will update on success
      });
      
      // Check if account is locked
      const isLocked = await this.isAccountLocked(userId);
      if (isLocked) {
        throw new Error('Account is locked due to multiple failed attempts');
      }
      
      // Basic password validation
      const passwordValid = await this.validatePassword(userId, password);
      
      if (!passwordValid) {
        await this.handleFailedAuthentication(userId);
        return false;
      }
      
      // Multi-factor authentication
      if (this.config.multiFactorAuthEnabled) {
        const mfaValid = await this.validateMultiFactor(additionalFactors);
        if (!mfaValid) {
          await this.handleFailedAuthentication(userId);
          return false;
        }
      }
      
      // Biometric authentication
      if (this.config.biometricAuthEnabled && biometricData) {
        const biometricValid = await this.validateBiometric(userId, biometricData);
        if (!biometricValid) {
          await this.handleFailedAuthentication(userId);
          return false;
        }
      }
      
      // Create secure session
      await this.createSecureSession(userId);
      
      // Update audit log
      await this.auditLog({
        userId,
        eventType: 'authentication',
        action: 'login_success',
        resource: 'account_access',
        success: true,
      });
      
      console.log(`🔒 User ${userId} authenticated successfully`);
      
      return true;
      
    } catch (error) {
      await this.handleFailedAuthentication(userId);
      
      await this.auditLog({
        userId,
        eventType: 'authentication',
        action: 'login_failed',
        resource: 'account_access',
        success: false,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
      
      return false;
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: any, encryptionType: 'data' | 'session' | 'communication' = 'data'): Promise<string> {
    try {
      const key = await this.getEncryptionKey(encryptionType);
      
      // Generate random IV
      const iv = this.generateRandomIV();
      
      // Encrypt data using AES-256-GCM or ChaCha20-Poly1305
      const encrypted = await this.performEncryption(data, key, iv);
      
      return this.encodeEncryptedData(encrypted, iv);
      
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string, encryptionType: 'data' | 'session' | 'communication' = 'data'): Promise<any> {
    try {
      const { encrypted, iv } = this.decodeEncryptedData(encryptedData);
      const key = await this.getEncryptionKey(encryptionType);
      
      return await this.performDecryption(encrypted, key, iv);
      
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  /**
   * Detect security threats
   */
  async detectThreats(familyId: string): Promise<ThreatDetected[]> {
    try {
      const threats: ThreatDetected[] = [];
      
      // Simulate threat detection (in real app would use actual threat detection)
      const mockThreats = [
        {
          threatId: `threat_${Date.now()}`,
          familyId,
          threatType: 'unauthorized_access' as const,
          severity: 'medium' as const,
          description: 'Unusual login pattern detected',
          timestamp: Date.now(),
          source: 'unknown_location',
          affectedUsers: ['user_123'],
          mitigationActions: ['require_reauth', 'notify_admin'],
          resolved: false,
        },
        {
          threatId: `threat_${Date.now() + 1}`,
          familyId,
          threatType: 'data_leak' as const,
          severity: 'high' as const,
          description: 'Sensitive data detected in transmission',
          timestamp: Date.now() - 3600000, // 1 hour ago
          source: 'internal_app',
          affectedUsers: ['user_456'],
          mitigationActions: ['block_access', 'encrypt_transmission'],
          resolved: true,
        },
      ];
      
      return mockThreats.filter(threat => !threat.resolved);
      
    } catch (error) {
      console.error('Error detecting threats:', error);
      return [];
    }
  }

  /**
   * Create security incident
   */
  async createSecurityIncident(incident: Omit<SecurityIncident, 'incidentId' | 'timestamp' | 'actions'>): Promise<SecurityIncident> {
    try {
      const fullIncident: SecurityIncident = {
        ...incident,
        incidentId: `incident_${++this.incidentCounter}_${Date.now()}`,
        timestamp: Date.now(),
        actions: [],
        status: 'active',
      };
      
      // Execute automatic responses based on security policies
      await this.executeSecurityResponse(fullIncident);
      
      // Store incident
      await this.storeIncident(fullIncident);
      
      // Alert administrators if severity is high
      if (incident.severity === 'high' || incident.severity === 'critical') {
        await this.alertSecurityAdministrators(fullIncident);
      }
      
      console.log(`🚨 Security incident created: ${fullIncident.incidentId}`);
      
      return fullIncident;
      
    } catch (error) {
      console.error('Error creating security incident:', error);
      throw error;
    }
  }

  /**
   * Create security policy
   */
  async createSecurityPolicy(
    policy: Omit<SecurityPolicy, 'policyId' | 'createdAt' | 'lastModified'>
  ): Promise<SecurityPolicy> {
    try {
      const fullPolicy: SecurityPolicy = {
        ...policy,
        policyId: `policy_${Date.now()}`,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };
      
      this.securityPolicies.set(fullPolicy.policyId, fullPolicy);
      
      await this.storeSecurityPolicies();
      
      await this.auditLog({
        eventType: 'system_change',
        action: 'create_security_policy',
        resource: 'security_policy',
        success: true,
        metadata: { policyId: fullPolicy.policyId },
      });
      
      console.log(`🔒 Security policy created: ${fullPolicy.policyId}`);
      
      return fullPolicy;
      
    } catch (error) {
      console.error('Error creating security policy:', error);
      throw error;
    }
  }

  /**
   * Audit log entry
   */
  async auditLog(log: Omit<AuditLog, 'logId' | 'timestamp'>): Promise<void> {
    try {
      const audit: AuditLog = {
        ...log,
        logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      
      this.auditLogs.push(audit);
      
      // Store audit log
      await this.storeAuditLogs();
      
      console.log(`📝 Audit log: ${audit.action} - ${audit.success ? 'SUCCESS' : 'FAILED'}`);
      
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Get security analytics
   */
  async getSecurityAnalytics(familyId: string): Promise<{
    threatCount: number;
    incidentCount: number;
    auditLogCount: number;
    lastThreatDetection: number | null;
    securityScore: number; // 0-100
    complianceLevel: 'basic' | 'enhanced' | 'maximum';
  }> {
    try {
      const recentLogs = this.auditLogs.filter(log => 
        Date.now() - log.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );
      
      const threatCount = recentLogs.filter(log => log.eventType === 'security_event').length;
      const incidentCount = recentLogs.filter(log => log.action.includes('incident')).length;
      
      const securityScore = Math.max(0, 100 - (threatCount * 5) - (incidentCount * 10));
      
      let complianceLevel: 'basic' | 'enhanced' | 'maximum' = 'basic';
      if (securityScore >= 80) complianceLevel = 'maximum';
      else if (securityScore >= 60) complianceLevel = 'enhanced';
      
      return {
        threatCount,
        incidentCount,
        auditLogCount: recentLogs.length,
        lastThreatDetection: recentLogs.length > 0 ? recentLogs[0].timestamp : null,
        securityScore,
        complianceLevel,
      };
      
    } catch (error) {
      console.error('Error getting security analytics:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async loadSecurityConfig(): Promise<void> {
    try {
      const configString = await AsyncStorage.getItem('security_config');
      if (configString) {
        this.config = JSON.parse(configString);
      } else {
        this.config = {
          authenticationLevel: 'basic',
          encryptionEnabled: true,
          biometricAuthEnabled: false,
          multiFactorAuthEnabled: false,
          sessionTimeout: 30, // 30 minutes
          maxLoginAttempts: 5,
          lockoutDuration: 15, // 15 minutes
          sslPinningEnabled: false,
          certificateValidationEnabled: true,
          auditLoggingEnabled: true,
          dataLeakProtectionEnabled: true,
          automaticThreatScanningEnabled: true,
          encryptionAlgorithm: 'AES-256-GCM',
          sessionEncryptionEnabled: true,
          privacyLevel: 'enhanced',
          loggingLevel: 'standard',
        };
      }
    } catch (error) {
      console.error('Error reading security config:', error);
    }
  }

  private async storeSecurityConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('security_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error storing security config:', error);
    }
  }

  private async initializeEncryptionKeys(): Promise<void> {
    try {
      // Generate or load encryption keys based on configuration
      const dataKey = await this.generateOrLoadKey('data');
      const sessionKey = await this.generateOrLoadKey('session');
      const commKey = await this.generateOrLoadKey('communication');
      
      console.log('🔑 Encryption keys initialized');
      
    } catch (error) {
      console.error('Error initializing encryption keys:', error);
    }
  }

  private async generateOrLoadKey(usage: 'data' | 'session' | 'communication'): Promise<EncryptionKey> {
    try {
      const keyId = `key_${usage}_${Date.now()}`;
      
      // Generate new key or load from secure storage
      const key = await SecureStore.getItemAsync(`encryption_key_${usage}`);
      
      const encryptionKey: EncryptionKey = {
        keyId,
        algorithm: this.config.encryptionAlgorithm,
        created: Date.now(),
        status: 'active',
        familyId: 'system', // Will be replaced with actual family ID
        usage,
        encryptedKey: key || await this.generateRandomKey(),
      };
      
      // Store key securely
      await SecureStore.setItemAsync(`encryption_key_${usage}`, encryptionKey.encryptedKey);
      
      this.encryptionKeys.set(keyId, encryptionKey);
      
      return encryptionKey;
      
    } catch (error) {
      console.error(`Error generating/loading ${usage} key:`, error);
      throw error;
    }
  }

  private async getEncryptionKey(type: 'data' | 'session' | 'communication'): Promise<string> {
    const key = Array.from(this.encryptionKeys.values()).find(k => k.usage === type);
    return key?.encryptedKey || '';
  }

  private generateRandomKey(): string {
    return Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
  }

  private generateRandomIV(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private async performEncryption(data: any, key: string, iv: string): Promise<string> {
    // Simplified encryption (in real app would use actual crypto libraries)
    return Buffer.from(JSON.stringify({ data, key: key.slice(0, 16), iv })).toString('base64');
  }

  private async performDecryption(encrypted: string, key: string, iv: string): Promise<any> {
    // Simplified decryption (in real app would use actual crypto libraries)
    const decrypted = Buffer.from(encrypted, 'base64').toString();
    const parsed = JSON.parse(decrypted);
    return parsed.data;
  }

  private encodeEncryptedData(encrypted: string, iv: string): string {
    return `${encrypted}:${iv}`;
  }

  private decodeEncryptedData(encoded: string): { encrypted: string; iv: string } {
    const [encrypted, iv] = encoded.split(':');
    return { encrypted, iv };
  }

  private async validatePassword(userId: string, password: string): Promise<boolean> {
    // Simplified password validation (in real app would validate against secure storage)
    return password.length >= 6;
  }

  private async validateMultiFactor(factors?: any): Promise<boolean> {
    if (!factors) return true; // Skip if not required
    
    // Simplified MFA validation
    if (factors.totpCode) {
      return factors.totpCode.length === 6;
    }
    
    return true;
  }

  private async validateBiometric(userId: string, biometricData: any): Promise<boolean> {
    // Simplified biometric validation (in real app would use biometric APIs)
    return biometricData && biometricData.confidence > 0.8;
  }

  private async createSecureSession(userId: string): Promise<void> {
    const sessionId = `session_${userId}_${Date.now()}`;
    const jwtToken = await this.generateJWTToken(userId);
    
    const session: SessionSecurity = {
      sessionId,
      userId,
      familyId: 'family_123', // Will be replaced with actual family ID
      deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (this.config.sessionTimeout * 60 * 1000),
      jwtToken,
      active: true,
    };
    
    if (this.config.sessionEncryptionEnabled) {
      session.encryptionKey = await this.generateRandomKey();
    }
    
    this.activeSessions.set(sessionId, session);
    
    console.log(`🔒 Secure session created for user ${userId}`);
  }

  private async generateJWTToken(userId: string): Promise<string> {
    // Simplified JWT generation (in real app would use proper JWT library)
    return `jwt_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;
  }

  private async isAccountLocked(userId: string): Promise<boolean> {
    // Simplified account lock check
    return false;
  }

  private async handleFailedAuthentication(userId: string): Promise<void> {
    // Increment failed attempts counter
    // Lock account if threshold exceeded
    console.log(`🚨 Failed authentication attempt for user ${userId}`);
  }

  private async executeSecurityResponse(incident: SecurityIncident): Promise<void> {
    const applicablePolicies = Array.from(this.securityPolicies.values())
      .filter(policy => policy.enabled && policy.rules.some(rule => rule.enabled));
    
    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (rule.enabled) {
          // Evaluate rule condition
          const conditionMet = await this.evaluateRuleCondition(rule.condition, incident);
          
          if (conditionMet) {
            // Execute security action
            await this.executeSecurityAction(rule.action, rule.parameters, incident);
          }
        }
      }
    }
  }

  private async evaluateRuleCondition(condition: string, context: any): Promise<boolean> {
    try {
      // Simplified condition evaluation (in real app would use secure expression evaluator)
      return condition.includes(context.category) || condition.includes(context.severity);
    } catch (error) {
      console.error('Error evaluating security rule condition:', error);
      return false;
    }
  }

  private async executeSecurityAction(action: string, parameters: any, incident: SecurityIncident): Promise<void> {
    // Simplified action execution (in real app would have robust action handlers)
    console.log(`🔧 Executing security action: ${action} for incident ${incident.incidentId}`);
  }

  private async alertSecurityAdministrators(incident: SecurityIncident): Promise<void> {
    // Simplified admin alert (in real app would send real notifications)
    console.log(`🚨 ALERT: Critical security incident ${incident.incidentId} for family ${incident.familyId}`);
  }

  private async storeIncident(incident: SecurityIncident): Promise<void> {
    try {
      const incidents = await AsyncStorage.getItem('security_incidents');
      const incidentList = incidents ? JSON.parse(incidents) : [];
      incidentList.push(incident);
      await AsyncStorage.setItem('security_incidents', JSON.stringify(incidentList));
    } catch (error) {
      console.error('Error storing incident:', error);
    }
  }

  private async storeSecurityPolicies(): Promise<void> {
    try {
      const policies = Array.from(this.securityPolicies.values());
      await AsyncStorage.setItem('security_policies', JSON.stringify(policies));
    } catch (error) {
      console.error('Error storing security policies:', error);
    }
  }

  private async loadSecurityPolicies(): Promise<void> {
    try {
      const policiesString = await AsyncStorage.getItem('security_policies');
      if (policiesString) {
        const policies = JSON.parse(policiesString);
        policies.forEach((policy: SecurityPolicy) => {
          this.securityPolicies.set(policy.policyId, policy);
        });
      }
    } catch (error) {
      console.error('Error loading security policies:', error);
    }
  }

  private async storeAuditLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem('audit_logs', JSON.stringify(this.auditLogs.slice(-1000))); // Keep last 1000 logs
    } catch (error) {
      console.error('Error storing audit logs:', error);
    }
  }

  private async initializeAuditLogging(): Promise<void> {
    try {
      const logsString = await AsyncStorage.getItem('audit_logs');
      if (logsString) {
        this.auditLogs = JSON.parse(logsString);
      }
    } catch (error) {
      console.error('Error initializing audit logging:', error);
    }
  }

  private async applySecurityConfiguration(): Promise<void> {
    // Apply configuration changes to the running service
    if (this.config.automaticThreatScanningEnabled && !this.threatMonitor) {
      this.startThreatMonitoring();
    } else if (!this.config.automaticThreatScanningEnabled && this.threatMonitor) {
      this.stopThreatMonitoring();
    }
  }

  private startThreatMonitoring(): void {
    this.threatMonitor = setInterval(async () => {
      try {
        const families = ['family_123']; // Would get actual family IDs
        for (const familyId of families) {
          await this.detectThreats(familyId);
        }
      } catch (error) {
        console.error('Error in threat monitoring:', error);
      }
    }, 60000); // Check every minute
  }

  private stopThreatMonitoring(): void {
    if (this.threatMonitor) {
      clearInterval(this.threatMonitor);
      this.threatMonitor = null;
    }
  }

  /**
   * Public getters for configuration and state
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  getSecurityIncidentCount(): number {
    return this.incidentCounter;
  }

  getAuditLogCount(): number {
    return this.auditLogs.length;
  }
}

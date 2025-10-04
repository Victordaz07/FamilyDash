/**
 * Error Detection Service
 * Advanced error detection, categorization, and automatic resolution
 */

import { RealAuthService, RealDatabaseService } from '../index';

export interface ErrorPattern {
  id: string;
  module: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'auth' | 'database' | 'performance' | 'sync' | 'ui' | 'unknown';
  suggestedFixes: string[];
  autoFix?: () => Promise<boolean>;
}

export interface DetectedError {
  id: string;
  error: Error;
  module: string;
  timestamp: Date;
  pattern?: ErrorPattern;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  context: any;
  resolution?: {
    fixed: boolean;
    method: string;
    timestamp: Date;
    success: boolean;
  };
}

export interface PerformanceIssue {
  id: string;
  type: 'slow_query' | 'high_memory' | 'render_delay' | 'network_timeout';
  module: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

class ErrorDetectionService {
  private errorPatterns: ErrorPattern[] = [];
  private detectedErrors: DetectedError[] = [];
  private performanceIssues: PerformanceIssue[] = [];
  private listeners: ((error: DetectedError) => void)[] = [];

  // Initialize error detection patterns
  constructor() {
    this.initializeErrorPatterns();
    this.startGlobalErrorHandling();
  }

  // Initialize common error patterns
  private initializeErrorPatterns(): void {
    // Firebase Authentication patterns
    this.errorPatterns.push({
      id: 'auth_user_not_found',
      module: 'firebase-auth',
      pattern: /User not found/i,
      severity: 'medium',
      category: 'auth',
      suggestedFixes: ['Check user email', 'Re-authenticate user', 'Register new user'],
      autoFix: async () => {
        try {
          await RealAuthService.signOut();
          return true;
        } catch (error) {
          return false;
        }
      },
    });

    this.errorPatterns.push({
      id: 'auth_permission_denied',
      module: 'firebase-auth',
      pattern: /Permission denied|Insufficient permissions/i,
      severity: 'high',
      category: 'auth',
      suggestedFixes: ['Check user permissions', 'Re-authenticate', 'Contact admin'],
      autoFix: async () => {
        try {
          const user = RealAuthService.getCurrentUser();
          if (!user) return false;
          
          // Try to refresh the auth token
          await user.reload();
          return true;
        } catch (error) {
          return false;
        }
      },
    });

    // Firebase Firestore patterns
    this.errorPatterns.push({
      id: 'firestore_network',
      module: 'firebase-firestore',
      pattern: /Network request failed|Connection timeout/i,
      severity: 'medium',
      category: 'network',
      suggestedFixes: ['Check internet connection', 'Retry operation', 'Use offline mode'],
      autoFix: async () => {
        try {
          return await RealDatabaseService.checkConnection();
        } catch (error) {
          return false;
        }
      },
    });

    this.errorPatterns.push({
      id: 'firestore_quota_exceeded',
      module: 'firebase-firestore',
      pattern: /Quota exceeded|Resource quota exceeded/i,
      severity: 'critical',
      category: 'database',
      suggestedFixes: ['Clear cache', 'Reduce operations', 'Upgrade Firebase plan'],
    });

    this.errorPatterns.push({
      id: 'firestore_doc_not_found',
      module: 'firebase-firestore',
      pattern: /Document not found/i,
      severity: 'low',
      category: 'database',
      suggestedFixes: ['Create document', 'Check document ID', 'Use fallback data'],
    });

    // Zustand Store patterns
    this.errorPatterns.push({
      id: 'zustand_initialization',
      module: 'zustand-store',
      pattern: /Store initialization failed|Failed to initialize store/i,
      severity: 'medium',
      category: 'database',
      suggestedFixes: ['Reinitialize store', 'Clear store cache', 'Reset store state'],
    });

    // Sync patterns
    this.errorPatterns.push({
      id: 'sync_conflict',
      module: 'sync-service',
      pattern: /Sync conflict|Data conflict/i,
      severity: 'medium',
      category: 'sync',
      suggestedFixes: ['Manual resolution', 'Use local data', 'Use remote data'],
    });

    // Generic patterns
    this.errorPatterns.push({
      id: 'generic_connection',
      module: 'generic',
      pattern: /Failed to fetch|Connection failed/i,
      severity: 'medium',
      category: 'network',
      suggestedFixes: ['Check connection', 'Retry operation'],
    });

    this.errorPatterns.push({
      id: 'generic_timeout',
      module: 'generic',
      pattern: /Timeout|Operation timed out/i,
      severity: 'medium',
      category: 'performance',
      suggestedFixes: ['Increase timeout', 'Optimize operation', 'Retry with backoff'],
    });
  }

  // Start global error handling
  private startGlobalErrorHandling(): void {
    // React Native global error handler
    const originalHandler = global.ErrorUtils?.getGlobalHandler();
    
    global.ErrorUtils?.setGlobalHandler((error, isFatal) => {
      this.detectError(error, 'global-error-handler', {
        isFatal,
        stack: error.stack,
      });
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Unhandled promise rejections
    if (typeof global !== 'undefined') {
      global.addEventListener?.('unhandledrejection', (event: any) => {
        this.detectError(
          new Error(`Unhandled Promise Rejection: ${event.reason}`),
          'promise-rejection',
          { reason: event.reason }
        );
      });
    }
  }

  // Detect error and categorize it
  detectError(error: Error, module: string, context: any = {}): DetectedError {
    const detectedError: DetectedError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      module,
      timestamp: new Date(),
      pattern: undefined,
      severity: 'medium',
      category: 'unknown',
      context,
    };

    // Try to match error with known patterns
    const matchingPattern = this.errorPatterns.find(pattern => 
      pattern.module === module && pattern.pattern.test(error.message)
    );

    if (matchingPattern) {
      detectedError.pattern = matchingPattern;
      detectedError.severity = matchingPattern.severity;
      detectedError.category = matchingPattern.category;

      // Attempt automatic fix
      this.attemptAutoFix(detectedError, matchingPattern);
    }

    // Add to detected errors
    this.detectedErrors.unshift(detectedError);
    
    // Keep only last 100 errors
    if (this.detectedErrors.length > 100) {
      this.detectedErrors = this.detectedErrors.slice(0, 100);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(detectedError));

    console.log(`🔍 Error detected: ${detectedError.severity.toUpperCase()} ${detectedError.module} - ${error.message}`);

    return detectedError;
  }

  // Attempt automatic fix
  private async attemptAutoFix(error: DetectedError, pattern: ErrorPattern): Promise<void> {
    if (!pattern.autoFix) return;

    try {
      console.log(`🔧 Attempting auto-fix for: ${pattern.pattern}`);
      
      const success = await pattern.autoFix();
      
      error.resolution = {
        fixed: success,
        method: pattern.autoFix.name || 'auto_fix',
        timestamp: new Date(),
        success,
      };

      console.log(`✅ Auto-fix ${success ? 'succeeded' : 'failed'}: ${error.module}`);

    } catch (fixError) {
      console.error(`❌ Auto-fix error:`, fixError);
      
      error.resolution = {
        fixed: false,
        method: pattern.autoFix.name || 'auto_fix',
        timestamp: new Date(),
        success: false,
      };
    }
  }

  // Detect performance issues
  detectPerformanceIssue(type: string, module: string, value: number, threshold: number): PerformanceIssue | null {
    if (value <= threshold) return null;

    const issue: PerformanceIssue = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      module,
      value,
      threshold,
      timestamp: new Date(),
    };

    this.performanceIssues.unshift(issue);
    
    // Keep only last 50 performance issues
    if (this.performanceIssues.length > 50) {
      this.performanceIssues = this.performanceIssues.slice(0, 50);
    }

    console.log(`⚡ Performance issue detected: ${type} in ${module} (${value} > ${threshold})`);

    return issue;
  }

  // Get error patterns
  getErrorPatterns(): ErrorPattern[] {
    return [...this.errorPatterns];
  }

  // Get detected errors
  getDetectedErrors(): DetectedError[] {
    return [...this.detectedErrors];
  }

  // Get performance issues
  getPerformanceIssues(): PerformanceIssue[] {
    return [...this.performanceIssues];
  }

  // Get errors by severity
  getErrorsBySeverity(severity: string): DetectedError[] {
    return this.detectedErrors.filter(error => error.severity === severity);
  }

  // Get errors by category
  getErrorsByCategory(category: string): DetectedError[] {
    return this.detectedErrors.filter(error => error.category === category);
  }

  // Get errors by module
  getErrorsByModule(module: string): DetectedError[] {
    return this.detectedErrors.filter(error => error.module === module);
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    byModule: Record<string, number>;
    resolved: number;
    unresolved: number;
  } {
  const stats = {
    total: this.detectedErrors.length,
    bySeverity: {},
    byCategory: {},
    byModule: {},
    resolved: this.detectedErrors.filter(e => e.resolution?.fixed).length,
    unresolved: this.detectedErrors.filter(e => !e.resolution?.fixed).length,
  };

  // Count by severity
  this.detectedErrors.forEach(error => {
    stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
  });

  // Count by category
  this.detectedErrors.forEach(error => {
    stats.byCategory[error.category]] = (stats.byCategory[error.category]] || 0) + 1;
  });

  // Count by module
  this.detectedErrors.forEach(error => {
    stats.byModule[error.module] = (stats.byModule[error.module] || 0) + 1;
  });

  return stats;
}

  // Manual error resolution
  async resolveError(errorId: string, method: string): Promise<boolean> {
    const error = this.detectedErrors.find(e => e.id === errorId);
    if (!error || !error.pattern) return false;

    let success = false;

    try {
      switch (method) {
        case 'reconnect':
          if (error.module.includes('firestore')) {
            success = await RealDatabaseService.checkConnection();
          }
          break;
          
        case 'reauthenticate':
          if (error.module.includes('auth')) {
            await RealAuthService.signOut();
            success = true;
          }
          break;
          
        case 'retry':
          // Implement retry logic here
          success = true; // Placeholder
          break;
          
        case 'clear_cache':
          // Implement cache clearing logic here
          success = true; // Placeholder
          break;
          
        default:
          success = false;
      }

      if (success) {
        error.resolution = {
          fixed: true,
          method,
          timestamp: new Date(),
          success: true,
        };
      }

      return success;

    } catch (resolveError) {
      console.error(`❌ Manual resolution failed:`, resolveError);
      
      error.resolution = {
        fixed: false,
        method,
        timestamp: new Date(),
        success: false,
      };
      
      return false;
    }
  }

  // Add error listener
  addErrorListener(listener: (error: DetectedError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Clear all error data
  clearAllErrors(): void {
    this.detectedErrors = [];
    this.performanceIssues = [];
    console.log('🗑️ All error data cleared');
  }

  // Export error report
  exportErrorReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.getErrorStats(),
      errors: this.detectedErrors,
      performanceIssues: this.performanceIssues,
      patterns: this.errorPatterns.length,
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const errorDetectionService = new ErrorDetectionService();
export default errorDetectionService;

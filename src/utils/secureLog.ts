/**
 * Secure Logging Utility
 * Prevents PII (Personally Identifiable Information) from being logged in production
 * 
 * SECURITY: Use these functions instead of console.log for user-related data
 */

/**
 * Log a message with optional data
 * In development: logs everything
 * In production: logs message only (no PII data)
 */
export const secureLog = (message: string, data?: any): void => {
  if (__DEV__) {
    console.log(message, data);
  } else {
    // In production, only log the message without sensitive data
    console.info(message);
  }
};

/**
 * Log a warning with optional data
 * In development: logs everything
 * In production: logs message only
 */
export const secureWarn = (message: string, data?: any): void => {
  if (__DEV__) {
    console.warn(message, data);
  } else {
    console.warn(message);
  }
};

/**
 * Log an error (errors are always logged for debugging)
 * Sanitizes error messages to remove potential PII
 */
export const secureError = (message: string, error?: any): void => {
  if (__DEV__) {
    console.error(message, error);
  } else {
    // In production, log sanitized error info
    const sanitizedError = error instanceof Error 
      ? { name: error.name, message: error.message }
      : { error: 'Unknown error' };
    console.error(message, sanitizedError);
  }
};

/**
 * Mask sensitive data for logging
 * Examples: email, phone, tokens
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) {
    return '****';
  }
  
  const visible = data.slice(-visibleChars);
  return '****' + visible;
};

/**
 * Log authentication events without exposing credentials
 */
export const logAuthEvent = (event: string, userId?: string): void => {
  if (__DEV__) {
    secureLog(`Auth Event: ${event}`, userId ? { userId } : undefined);
  } else {
    secureLog(`Auth Event: ${event}`);
  }
};

/**
 * Log database operations without exposing full documents
 */
export const logDatabaseOperation = (
  operation: 'read' | 'write' | 'update' | 'delete',
  collection: string,
  docId?: string
): void => {
  if (__DEV__) {
    secureLog(`Firestore ${operation}: ${collection}`, docId ? { docId } : undefined);
  } else {
    secureLog(`Firestore ${operation}: ${collection}`);
  }
};






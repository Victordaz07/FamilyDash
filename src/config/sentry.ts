/**
 * Sentry Configuration
 * Crash reporting and error monitoring
 * 
 * Phase 6: Observability and error tracking
 */

import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking
 * Call this before app initialization
 */
export function initSentry() {
  // Only initialize in production or if explicitly enabled
  const isProduction = process.env.NODE_ENV === 'production';
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (__DEV__) {
      console.log('📊 Sentry: DSN not configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn,
    // Enable automatic session tracking
    enableAutoSessionTracking: true,
    // Set sample rate for performance monitoring (0.0 to 1.0)
    tracesSampleRate: isProduction ? 0.2 : 1.0,
    // Enable native crash handling
    enableNative: true,
    // Enable auto breadcrumbs
    enableAutoPerformanceTracing: true,
    // Release tracking (set in app.json or via env)
    release: `familydash@${require('../../package.json').version}`,
    // Environment
    environment: isProduction ? 'production' : 'development',
    // Before send hook - filter sensitive data
    beforeSend(event) {
      // Remove sensitive data from event
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      // Remove sensitive context data
      if (event.contexts?.app) {
        delete event.contexts.app.device_name;
      }

      return event;
    },
    // Ignore certain errors
    ignoreErrors: [
      // React Native errors that are usually safe to ignore
      'Network request failed',
      'cancelled',
      'AbortError',
      // Firebase errors that are handled
      'auth/network-request-failed',
      'auth/too-many-requests',
    ],
  });

  // Set user context if available (call after auth)
  // Sentry.setUser({ id: userId, email: userEmail });

  console.log('📊 Sentry initialized for error tracking');
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (__DEV__) {
    console.error('🚨 Sentry: Capturing exception', error, context);
  }

  Sentry.captureException(error, {
    contexts: context ? { extra: context } : undefined,
  });
}

/**
 * Capture a message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (__DEV__) {
    console.log(`📊 Sentry: ${level} - ${message}`);
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(userId: string, email?: string, additionalData?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    email,
    ...additionalData,
  });

  if (__DEV__) {
    console.log('📊 Sentry: User context set', { userId, email });
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);

  if (__DEV__) {
    console.log('📊 Sentry: User context cleared');
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

// Export Sentry for advanced usage
export { Sentry };






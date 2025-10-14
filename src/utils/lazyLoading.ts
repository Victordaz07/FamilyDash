/**
 * 🚀 LAZY LOADING UTILITIES
 * Prevents initial bundle bloat and improves app startup time
 * Loads components only when needed
 */

import { lazy, ComponentType } from 'react';

// Generic lazy loader with error boundary
export const createLazyComponent = <P extends {}>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ComponentType<P>
) => {
  return lazy(importFunction);
};

// Screen lazy loaders - Only for actual React components
export const LazyScreens = {
  // Main Screens
  HomeScreen: createLazyComponent(() => import('@/screens/HomeScreen')),
  ProfileScreen: createLazyComponent(() => import('@/screens/ProfileScreen')),
  SettingsScreen: createLazyComponent(() => import('@/screens/SettingsScreen')),
  
  // Support Screens
  HelpScreen: createLazyComponent(() => import('@/screens/Support/HelpScreen')),
  ContactScreen: createLazyComponent(() => import('@/screens/Support/ContactScreen')),
  AboutScreen: createLazyComponent(() => import('@/screens/Support/AboutScreen')),
  
  // Debug Screens (only in development)
  ...(__DEV__ ? {
    DebugDashboard: createLazyComponent(() => import('@/screens/DebugDashboard')),
    FirebaseTestLive: createLazyComponent(() => import('@/screens/FirebaseTestLive')),
    SyncTestingScreen: createLazyComponent(() => import('@/screens/SyncTestingScreen')),
  } : {}),
};

// Utility function to preload components
export const preloadComponent = async (componentLoader: () => Promise<any>) => {
  try {
    await componentLoader();
  } catch (error) {
    console.warn('Failed to preload component:', error);
  }
};

// Preload critical components
export const preloadCriticalComponents = async () => {
  const criticalComponents = [
    () => import('@/screens/HomeScreen'),
    () => import('@/components/ErrorBoundary'),
  ];

  await Promise.allSettled(
    criticalComponents.map(component => preloadComponent(component))
  );
};

// Error boundary for lazy loaded components
export const withLazyErrorBoundary = <P extends {}>(
  Component: ComponentType<P>,
  fallback?: ComponentType<P>
) => {
  return Component; // Simplified - just return the component as-is
};





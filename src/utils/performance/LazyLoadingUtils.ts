import React, { ComponentType, lazy, Suspense, forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * Lazy Loading Utilities for FamilyDash
 * Provides intelligent component loading and code splitting
 */

interface LazyComponentProps {
  [key: string]: any;
}

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  expires?: number;
}

/**
 * Extended lazy loading with advanced features
 */
export const createLazyComponent = <P extends LazyComponentProps>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    fallback?: ComponentType;
    preloadOptions?: PreloadOptions;
    errorBoundary?: boolean;
  }
) => {
  const LazyComponent = lazy(importFunction);
  
  // Component wrapper with fallback and error handling
  const WrappedComponent = forwardRef<any, P>((props, ref) => {
    const FallbackComponent = options?.fallback || DefaultFallback;
    
    if (options?.errorBoundary) {
      return (
        <ErrorBoundary fallback={FallbackComponent}>
          <Suspense fallback={<FallbackComponent />}>
            <LazyComponent ref={ref} {...props} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent ref={ref} {...props} />
      </Suspense>
    );
  });
  
  WrappedComponent.displayName = `Lazy(${LazyComponent.displayName || 'Component'})`;
  
  return WrappedComponent;
};

/**
 * Default fallback component
 */
const DefaultFallback: React.FC = () => (
  <View style={styles.fallbackContainer}>
    <ActivityIndicator size="large" color="#8B5CF6" />
    <Text style={styles.fallbackText}>Loading...</Text>
  </View>
);

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

/**
 * Component preloader for critical paths
 */
class ComponentPreloader {
  private preloadedComponents = new Map<string, ComponentType>();
  private preloadPromises = new Map<string, Promise<void>>();
  
  preloadComponent(key: string, importFunction: () => Promise<any>, options?: PreloadOptions) {
    if (this.preloadedComponents.has(key)) {
      return Promise.resolve();
    }

    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key)!;
    }

    const promise = Promise.resolve().then(async () => {
      if (options?.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }

      try {
        const module = await importFunction();
        this.preloadedComponents.set(key, module.default);
        
        // Set expiration
        if (options?.expires) {
          setTimeout(() => {
            this.preloadedComponents.delete(key);
          }, options.expires);
        }
      } catch (error) {
        console.error(`Failed to preload component ${key}:`, error);
        throw error;
      }
    });

    this.preloadPromises.set(key, promise);
    return promise;
  }

  getPreloadedComponent(key: string): ComponentType | null {
    return this.preloadedComponents.get(key) || null;
  }

  clearPreloadedComponents() {
    this.preloadedComponents.clear();
    this.preloadPromises.clear();
  }

  getStats() {
    return {
      preloadedCount: this.preloadedComponents.size,
      pendingPreloads: this.preloadPromises.size,
    };
  }
}

export const componentPreloader = new ComponentPreloader();

/**
 * Intelligent route-based preloading
 */
export class RoutePreloader {
  private static instance: RoutePreloader;
  private routeMetrics = new Map<string, { count: number; lastAccess: number }>();
  private preloadRules = new Map<string, PreloadOptions>();

  static getInstance(): RoutePreloader {
    if (!RoutePreloader.instance) {
      RoutePreloader.instance = new RoutePreloader();
    }
    return RoutePreloader.instance;
  }

  trackRouteAccess(route: string) {
    const current = this.routeMetrics.get(route) || { count: 0, lastAccess: 0 };
    this.routeMetrics.set(route, {
      count: current.count + 1,
      lastAccess: Date.now(),
    });
  }

  shouldPreload(route: string): boolean {
    const metrics = this.routeMetrics.get(route);
    if (!metrics) return false;

    // Preload if accessed more than 3 times
    return metrics.count >= 3;
  }

  getHotRoutes(): string[] {
    const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    return Array.from(this.routeMetrics.entries())
      .filter(([_, metrics]) => 
        metrics.lastAccess > recentThreshold && metrics.count >= 2
      )
      .sort((a, b) => b[1].count - a[1].count)
      .map(([route]) => route);
  }

  addPreloadRule(route: string, options: PreloadOptions) {
    this.preloadRules.set(route, options);
  }

  getPreloadRules(): Map<string, PreloadOptions> {
    return new Map(this.preloadRules);
  }
}

/**
 * Progressive component loading
 */
export const createProgressiveComponent = <P extends LazyComponentProps>(
  createComponent: () => React.ComponentType<P>,
  fallback: ComponentType<P> | null = null
) => {
  return forwardRef<any, P & { loaded?: boolean }>(({ loaded = false, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [Component, setComponent] = useState<React.ComponentType<P> | null>(null);

    useEffect(() => {
      if (loaded && !isLoaded) {
        const timer = setTimeout(() => {
          try {
            const component = createComponent();
            setComponent(() => component);
            setIsLoaded(true);
          } catch (error) {
            console.error('Error creating progressive component:', error);
            if (fallback) {
              setComponent(() => fallback);
              setIsLoaded(true);
            }
          }
        }, 100); // Small delay for smooth transition

        return () => clearTimeout(timer);
      }
    }, [loaded, isLoaded]);

    if (!isLoaded || !Component) {
      return fallback ? <fallback ref={ref} {...props as P} /> : <DefaultFallback />;
    }

    return <Component ref={ref} {...props} />;
  });
};

/**
 * Conditional lazy loading based on feature flags
 */
export const createConditionalLazyComponent = <P extends LazyComponentProps>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  condition: () => boolean,
  fallbackComponent?: ComponentType<P>
) => {
  return forwardRef<any, P>((props, ref) => {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
      setShouldLoad(condition());
    }, []);

    if (!shouldLoad) {
      return fallbackComponent ? (
        <fallbackComponent ref={ref} {...props} />
      ) : null;
    }

    const LazyComponent = lazy(importFunction);
    return (
      <Suspense fallback={<DefaultFallback />}>
        <LazyComponent ref={ref} {...props} />
      </Suspense>
    );
  });
};

/**
 * Bundle analyzer utilities (development only)
 */
export const getBundleStats = () => {
  if (__DEV__) {
    // In development, provide bundle analysis
    return {
      components: componentPreloader.getStats(),
      routes: RoutePreloader.getInstance().getHotRoutes(),
      timestamp: Date.now(),
    };
  }
  return null;
};

/**
 * Error Boundary for component loading errors
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: ComponentType },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

/**
 * Resource cleanup for lazy components
 */
export const useResourceCleanup = () => {
  const resourcesRef = useRef<Set<string>>(new Set());

  const registerResource = useCallback((resourceId: string, cleanup: () => void) => {
    resourcesRef.current.add(resourceId);
    
    return () => {
      resourcesRef.current.delete(resourceId);
      cleanup();
    };
  }, []);

  const cleanupAll = useCallback(() => {
    resourcesRef.current.clear();
  }, []);

  useEffect(() => {
    return cleanupAll;
  }, [cleanupAll]);

  return {
    registerResource,
    cleanupAll,
    resourceCount: resourcesRef.current.size,
  };
};

// Utility functions exported above

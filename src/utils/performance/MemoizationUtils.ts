import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Advanced Memoization Utilities for FamilyDash
 * Provides intelligent caching and performance optimizations
 */

// WeakMap for automatic cleanup
const cacheMap = new WeakMap();

/**
 * Enhanced useMemo with dependency checking and error handling
 */
export const useAdvancedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T => {
  return useMemo(() => {
    try {
      const result = factory();
      
      // Store in cache if key provided
      if (cacheKey) {
        cacheMap.set({ key: cacheKey }, result);
      }
      
      return result;
    } catch (error) {
      console.error('Error in useAdvancedMemo:', error);
      throw error;
    }
  }, deps);
};

/**
 * Enhanced useCallback with dependency optimization
 */
export const useAdvancedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options?: {
    debounceMs?: number;
    throttleMs?: number;
    cacheKey?: string;
  }
): T => {
  const { debounceMs, throttleMs, cacheKey } = options || {};
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const throttleRef = useRef<{ lastCall: number; timeout?: NodeJS.Timeout }>({
    lastCall: 0,
  });

  const advancedCallback = useCallback((...args: Parameters<T>) => {
    const execute = () => {
      try {
        callback(...args);
        
        // Cache result if needed
        if (cacheKey) {
          cacheMap.set({ key: cacheKey }, args);
        }
      } catch (error) {
        console.error('Error in advanced callback:', error);
      }
    };

    if (debounceMs) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(execute, debounceMs);
    } else if (throttleMs) {
      const now = Date.now();
      
      if (now - throttleRef.current.lastCall >= throttleMs) {
        execute();
        throttleRef.current.lastCall = now;
      } else {
        if (throttleRef.current.timeout) {
          clearTimeout(throttleRef.current.timeout);
        }
        throttleRef.current.timeout = setTimeout(() => {
          execute();
          throttleRef.current.lastCall = Date.now();
        }, throttleMs - (now - throttleRef.current.lastCall));
      }
    } else {
      execute();
    }
  } as T, deps);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (throttleRef.current.timeout) {
        clearTimeout(throttleRef.current.timeout);
      }
    };
  }, []);

  return advancedCallback;
};

/**
 * Persistent cache for expensive computations
 */
export const usePersistentMemo = <T>(
  key: string,
  factory: () => Promise<T>,
  defaultValue?: T,
  ttl?: number // Time to live in milliseconds
): [T | undefined, () => Promise<void>, boolean] => {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [expiration, setExpiration] = useState<number | null>(null);

  const refreshValue = useCallback(async () => {
    setLoading(true);
    try {
      const newValue = await factory();
      setValue(newValue);
      
      // Set expiration if TTL provided
      if (ttl) {
        setExpiration(Date.now() + ttl);
      }

      // Persist to AsyncStorage
      await AsyncStorage.setItem(
        `persistent_memo_${key}`,
        JSON.stringify({
          value: newValue,
          timestamp: Date.now(),
          ttl,
        })
      );
    } catch (error) {
      console.error(`Error refreshing persistent memo ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [factory, key, ttl]);

  // Load from cache on mount
  useEffect(() => {
    const loadFromCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(`persistent_memo_${key}`);
        if (cached) {
          const { value: cachedValue, timestamp, ttl: cachedTtl } = JSON.parse(cached);
          
          // Check if cache is still valid
          if (!expiration || Date.now() < timestamp + (cachedTtl || 0)) {
            setValue(cachedValue);
            if (cachedTtl) {
              setExpiration(timestamp + cachedTtl);
            }
            return;
          }
        }
        
        // Cache expired or doesn't exist, refresh
        await refreshValue();
      } catch (error) {
        console.error(`Error loading persistent memo ${key}:`, error);
        if (!value) {
          await refreshValue();
        }
      }
    };

    loadFromCache();
  }, [key, expiration, refreshValue, value]);

  // Check expiration periodically
  useEffect(() => {
    if (!expiration) return;

    const interval = setInterval(() => {
      if (Date.now() >= expiration) {
        refreshValue();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [expiration, refreshValue]);

  return [value, refreshValue, loading];
};

/**
 * Batch operations for state updates
 */
export const useBatchUpdates = () => {
  const updatesRef = useRef<Function[]>([]);

  const addUpdate = useCallback((updateFn: Function) => {
    updatesRef.current.push(updateFn);
  }, []);

  const executeBatch = useCallback(() => {
    const updates = [...updatesRef.current];
    updatesRef.current = [];
    
    // Execute updates in batches to avoid performance issues
    requestAnimationFrame(() => {
      updates.forEach(updateFn => {
        try {
          updateFn();
        } catch (error) {
          console.error('Error in batch update:', error);
        }
      });
    });
  }, []);

  const clearBatch = useCallback(() => {
    updatesRef.current = [];
  }, []);

  return {
    addUpdate,
    executeBatch,
    clearBatch,
    pendingUpdates: updatesRef.current.length,
  };
};

/**
 * Image optimization hook for lazy loading
 */
export const useOptimizedImage = (
  uri: string,
  options?: {
    placeholder?: string;
    fallback?: string;
    quality?: number;
    resize?: { width: number; height: number };
  }
) => {
  const [imageState, setImageState] = useState<{
    src: string;
    loading: boolean;
    error: boolean;
  }>({
    src: options?.placeholder || '',
    loading: true,
    error: false,
  });

  useEffect(() => {
    // Simulate image loading with timeout
    const timer = setTimeout(() => {
      setImageState({
        src: uri,
        loading: false,
        error: false,
      });
    }, 50); // Small delay to prevent blinking

    return () => clearTimeout(timer);
  }, [uri]);

  const optimizeUri = useCallback((originalUri: string) => {
    if (!originalUri) return options?.fallback || '';

    // In a real app, this would generate optimized URLs
    // For now, return the original URI
    return originalUri;
  }, [options?.fallback]);

  return {
    ...imageState,
    optimizedSrc: optimizeUri(uri),
  };
};

/**
 * List optimization for large datasets
 */
export const useListOptimization = <T>(
  data: T[],
  options?: {
    pageSize?: number;
    scrollThreshold?: number;
    enableVirtualization?: boolean;
  }
) => {
  const {
    pageSize = 20,
    scrollThreshold = 0.8,
    enableVirtualization = false,
  } = options || {};

  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const updateVisibleItems = useCallback(() => {
    const endIndex = currentPage * pageSize;
    const newVisibleItems = data.slice(0, endIndex);
    setVisibleItems(newVisibleItems);
    setHasMore(endIndex < data.length);
  }, [data, currentPage, pageSize]);

  useEffect(() => {
    updateVisibleItems();
  }, [updateVisibleItems]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  const shouldLoadMore = useCallback((scrollPosition: number) => {
    return scrollPosition >= scrollThreshold && hasMore;
  }, [scrollThreshold, hasMore]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    shouldLoadMore,
    totalCount: data.length,
    currentPage,
  };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    renderTime: 0,
    memoryUsage: 0,
  });
  const renderStartRef = useRef<number>();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderStartRef.current 
      ? renderEnd - renderStartRef.current 
      : 0;

    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      renderTime: Math.round(renderTime * 100) / 100,
      memoryUsage: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 * 100) / 100,
    }));

    // Log performance issues
    if (renderTime > 16) { // More than 1 frame at 60fps
      console.warn(`${componentName} slow render: ${renderTime}ms`);
    }
  });

  return metrics;
};

/**
 * Debounced search hook for inputs
 */
export const useDebouncedSearch = (
  query: string,
  delay: number = 300,
  minLength: number = 2
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (query.length < minLength && query.length > 0) {
      setIsPending(false);
      setDebouncedQuery('');
      return;
    }

    setIsPending(true);

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsPending(false);
    };
  }, [query, delay, minLength]);

  return {
    query: debouncedQuery,
    isPending,
    isEmpty: query.length === 0,
    isValid: query.length >= minLength,
  };
};

/**
 * Cleanup utility for preventing memory leaks
 */
export const useCleanup = () => {
  const cleanupRef = useRef<Function[]>([]);

  const addCleanup = useCallback((cleanupFn: Function) => {
    cleanupRef.current.push(cleanupFn);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanupFn => {
        try {
          cleanupFn();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      });
      cleanupRef.current = [];
    };
  }, []);

  return addCleanup;
};

// Export batch operation types
export type BatchUpdateFn = () => void;
export type CleanupFn = () => void;

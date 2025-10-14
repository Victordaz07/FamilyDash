/**
 * ⚡ PERFORMANCE OPTIMIZATION HOOKS — FamilyDash+
 * Hooks para optimizar rendimiento y carga de datos
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from 'lodash';

// Hook para memoización de datos pesados
export const useMemoizedData = <T>(
  data: T[],
  dependencies: any[] = [],
  transform?: (data: T[]) => T[]
) => {
  return useMemo(() => {
    if (transform) {
      return transform(data);
    }
    return data;
  }, [data, ...dependencies]);
};

// Hook para debounce de funciones
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const debouncedCallback = useRef(debounce(callback, delay)).current;

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback as T;
};

// Hook para throttle de funciones
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T => {
  const throttledCallback = useRef(throttle(callback, delay)).current;

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback as T;
};

// Hook para lazy loading de imágenes
export const useLazyImage = (uri: string, placeholder?: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  return {
    loaded,
    error,
    onLoad: handleLoad,
    onError: handleError,
    source: { uri: loaded ? uri : placeholder },
  };
};

// Hook para paginación optimizada
export const usePagination = <T>(
  data: T[],
  pageSize: number = 10,
  initialPage: number = 0
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginatedData = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return {
    paginatedData,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
  };
};

// Hook para filtrado optimizado
export const useFilteredData = <T>(
  data: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
) => {
  return useMemo(() => {
    return data.filter(filterFn);
  }, [data, filterFn, ...dependencies]);
};

// Hook para búsqueda optimizada
export const useSearch = <T>(
  data: T[],
  searchFields: (keyof T)[],
  searchTerm: string
) => {
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === 'number') {
          return value.toString().includes(term);
        }
        return false;
      })
    );
  }, [data, searchFields, searchTerm]);

  return filteredData;
};

// Hook para ordenamiento optimizado
export const useSortedData = <T>(
  data: T[],
  sortField: keyof T,
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  return useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortField, sortDirection]);
};

// Hook para caché de datos
export const useDataCache = <T>(key: string, fetcher: () => Promise<T>, ttl: number = 300000) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cacheRef.current) {
      const { data: cachedData, timestamp } = cacheRef.current;
      if (Date.now() - timestamp < ttl) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      cacheRef.current = { data: result, timestamp: Date.now() };
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetcher, ttl]);

  const clearCache = useCallback(() => {
    cacheRef.current = null;
    setData(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    clearCache,
  };
};

// Hook para virtualización de listas
export const useVirtualization = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      itemCount
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, itemCount]);

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Hook para medición de rendimiento
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (__DEV__) {
      console.log(`🎯 ${componentName} - Render #${renderCount.current} - Time: ${renderTime}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
  };
};





import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Hook para memoizar objetos complejos de forma profunda
 */
export const useDeepMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
    const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);

    if (!ref.current || !areEqual(ref.current.deps, deps)) {
        ref.current = { deps, value: factory() };
    }

    return ref.current.value;
};

/**
 * Hook para memoizar funciones con comparación profunda de argumentos
 */
export const useDeepCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T => {
    const ref = useRef<{ deps: React.DependencyList; callback: T } | undefined>(undefined);

    if (!ref.current || !areEqual(ref.current.deps, deps)) {
        ref.current = { deps, callback };
    }

    return ref.current.callback;
};

/**
 * Hook para memoizar arrays con comparación profunda
 */
export const useArrayMemo = <T>(array: T[], deps: React.DependencyList): T[] => {
    return useDeepMemo(() => array, deps);
};

/**
 * Hook para memoizar objetos con comparación profunda
 */
export const useObjectMemo = <T extends Record<string, any>>(
    obj: T,
    deps: React.DependencyList
): T => {
    return useDeepMemo(() => obj, deps);
};

/**
 * Hook para memoizar funciones de filtrado
 */
export const useFilteredData = <T>(
    data: T[],
    filterFn: (item: T) => boolean,
    deps: React.DependencyList
): T[] => {
    const memoizedFilterFn = useCallback(filterFn, deps);

    return useMemo(() => {
        return data.filter(memoizedFilterFn);
    }, [data, memoizedFilterFn]);
};

/**
 * Hook para memoizar funciones de ordenamiento
 */
export const useSortedData = <T>(
    data: T[],
    sortFn: (a: T, b: T) => number,
    deps: React.DependencyList
): T[] => {
    const memoizedSortFn = useCallback(sortFn, deps);

    return useMemo(() => {
        return [...data].sort(memoizedSortFn);
    }, [data, memoizedSortFn]);
};

/**
 * Hook para memoizar funciones de búsqueda
 */
export const useSearchData = <T>(
    data: T[],
    searchTerm: string,
    searchFn: (item: T, term: string) => boolean,
    deps: React.DependencyList
): T[] => {
    const memoizedSearchFn = useCallback(searchFn, deps);

    return useMemo(() => {
        if (!searchTerm.trim()) return data;
        return data.filter(item => memoizedSearchFn(item, searchTerm));
    }, [data, searchTerm, memoizedSearchFn]);
};

/**
 * Hook para memoizar funciones de agrupación
 */
export const useGroupedData = <T, K extends string | number>(
    data: T[],
    groupBy: (item: T) => K,
    deps: React.DependencyList
): Record<K, T[]> => {
    const memoizedGroupBy = useCallback(groupBy, deps);

    return useMemo(() => {
        return data.reduce((groups, item) => {
            const key = memoizedGroupBy(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {} as Record<K, T[]>);
    }, [data, memoizedGroupBy]);
};

/**
 * Hook para memoizar funciones de paginación
 */
export const usePaginatedData = <T>(
    data: T[],
    page: number,
    pageSize: number,
    deps: React.DependencyList
): { paginatedData: T[]; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } => {
    return useMemo(() => {
        const totalPages = Math.ceil(data.length / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
            paginatedData,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }, [data, page, pageSize, ...deps]);
};

/**
 * Hook para memoizar funciones de transformación
 */
export const useTransformedData = <T, R>(
    data: T[],
    transformFn: (item: T) => R,
    deps: React.DependencyList
): R[] => {
    const memoizedTransformFn = useCallback(transformFn, deps);

    return useMemo(() => {
        return data.map(memoizedTransformFn);
    }, [data, memoizedTransformFn]);
};

/**
 * Hook para memoizar funciones de reducción
 */
export const useReducedData = <T, R>(
    data: T[],
    reduceFn: (acc: R, item: T, index: number) => R,
    initialValue: R,
    deps: React.DependencyList
): R => {
    const memoizedReduceFn = useCallback(reduceFn, deps);

    return useMemo(() => {
        return data.reduce(memoizedReduceFn, initialValue);
    }, [data, memoizedReduceFn, initialValue]);
};

/**
 * Hook para memoizar funciones de cálculo estadístico
 */
export const useStatistics = <T>(
    data: T[],
    valueFn: (item: T) => number,
    deps: React.DependencyList
): {
    sum: number;
    average: number;
    min: number;
    max: number;
    count: number;
} => {
    const memoizedValueFn = useCallback(valueFn, deps);

    return useMemo(() => {
        if (data.length === 0) {
            return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
        }

        const values = data.map(memoizedValueFn);
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return { sum, average, min, max, count: data.length };
    }, [data, memoizedValueFn]);
};

/**
 * Hook para memoizar funciones de caché con expiración
 */
export const useCachedData = <T>(
    key: string,
    fetchFn: () => Promise<T>,
    expirationTime: number = 5 * 60 * 1000, // 5 minutos por defecto
    deps: React.DependencyList
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

    const fetchData = useCallback(async () => {
        const cached = cacheRef.current.get(key);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < expirationTime) {
            setData(cached.data);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            cacheRef.current.set(key, { data: result, timestamp: now });
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn, expirationTime, ...deps]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

/**
 * Función auxiliar para comparación profunda de arrays
 */
const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
};

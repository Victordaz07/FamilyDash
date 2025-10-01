import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Hook personalizado para optimizar animaciones y reducir re-renders
 */
export const usePerformanceOptimizations = () => {
    // Memoizar valores animados para evitar recreaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    // Memoizar función de entrada
    const animateIn = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim]);

    // Memoizar función de salida
    const animateOut = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim]);

    // Memoizar estilos de animación
    const animatedStyles = useMemo(() => ({
        opacity: fadeAnim,
        transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
        ]
    }), [fadeAnim, slideAnim, scaleAnim]);

    return {
        animateIn,
        animateOut,
        animatedStyles,
        fadeAnim,
        slideAnim,
        scaleAnim
    };
};

/**
 * Hook para optimizar listas grandes con FlatList
 */
export const useListOptimization = <T>(
    data: T[],
    keyExtractor: (item: T, index: number) => string,
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement,
    options?: {
        initialNumToRender?: number;
        maxToRenderPerBatch?: number;
        windowSize?: number;
        removeClippedSubviews?: boolean;
        getItemLayout?: (data: T[] | null | undefined, index: number) => { length: number; offset: number; index: number };
    }
) => {
    const optimizedRenderItem = useCallback(renderItem, []);
    const optimizedKeyExtractor = useCallback(keyExtractor, []);

    const flatListProps = useMemo(() => ({
        data,
        keyExtractor: optimizedKeyExtractor,
        renderItem: optimizedRenderItem,
        initialNumToRender: options?.initialNumToRender || 10,
        maxToRenderPerBatch: options?.maxToRenderPerBatch || 10,
        windowSize: options?.windowSize || 10,
        removeClippedSubviews: options?.removeClippedSubviews ?? true,
        getItemLayout: options?.getItemLayout,
        // Optimizaciones adicionales
        updateCellsBatchingPeriod: 50,
        disableVirtualization: false,
    }), [data, optimizedKeyExtractor, optimizedRenderItem, options]);

    return flatListProps;
};

/**
 * Hook para debounce de funciones
 */
export const useDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]) as T;
};

/**
 * Hook para throttling de funciones
 */
export const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const lastRun = useRef(Date.now());

    return useCallback((...args: Parameters<T>) => {
        if (Date.now() - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = Date.now();
        }
    }, [callback, delay]) as T;
};

/**
 * Hook para memoizar cálculos costosos
 */
export const useExpensiveCalculation = <T>(
    calculation: () => T,
    dependencies: React.DependencyList
): T => {
    return useMemo(calculation, dependencies);
};

/**
 * Hook para optimizar imágenes
 */
export const useImageOptimization = (uri: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
}) => {
    const optimizedUri = useMemo(() => {
        if (!uri) return uri;

        // Si es una URL externa, añadir parámetros de optimización
        if (uri.startsWith('http')) {
            const url = new URL(uri);
            if (options?.width) url.searchParams.set('w', options.width.toString());
            if (options?.height) url.searchParams.set('h', options.height.toString());
            if (options?.quality) url.searchParams.set('q', options.quality.toString());
            return url.toString();
        }

        return uri;
    }, [uri, options?.width, options?.height, options?.quality]);

    return optimizedUri;
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = <T extends React.ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
) => {
    const [Component, setComponent] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        importFunction()
            .then((module) => {
                setComponent(() => module.default);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, [importFunction]);

    if (loading) {
        return fallback ? React.createElement(fallback) : null;
    }

    if (error) {
        console.error('Error loading component:', error);
        return fallback ? React.createElement(fallback) : null;
    }

    return Component;
};

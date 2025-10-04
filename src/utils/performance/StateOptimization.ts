/**
 * State Optimization Utilities for FamilyDash
 * Provides intelligent state management optimizations
 */

import { useState, useReducer, useRef, useCallback, useMemo } from 'react';

/**
 * Optimized reducer with memoization and batching
 */
export class OptimizedReducer<TState, TAction> {
    private stateRef = useRef<TState>();
    private subscribers = new Set<(state: TState) => void>();
    private middleware: Array<(action: TAction, state: TState) => TAction> = [];
    private batchUpdates = false;
    private batchedActions: TAction[] = [];

    constructor(
        private reducer: (state: TState, action: TAction) => TState,
        initialState: TState,
        options?: {
            middleware?: Array<(action: TAction, state: TState) => TAction>;
            enableBatching?: boolean;
        }
    ) {
        this.stateRef.current = initialState;

        if (options?.middleware) {
            this.middleware = options.middleware;
        }

        if (options?.enableBatching) {
            this.batchUpdates = true;
        }
    }

    dispatch = (action: TAction) => {
        const currentState = this.stateRef.current!;
        let processedAction = action;

        // Apply middleware
        for (const middlewareFn of this.middleware) {
            processedAction = middlewareFn(processedAction, currentState);
        }

        if (this.batchUpdates) {
            this.batchedActions.push(processedAction);

            // Process batch after current call stack
            requestAnimationFrame(() => {
                if (this.batchedActions.length > 0) {
                    this.processBatch();
                }
            });
        } else {
            this.updateState(processedAction);
        }
    };

    private processBatch() {
        const actions = [...this.batchedActions];
        this.batchedActions = [];

        let newState = this.stateRef.current!;

        for (const action of actions) {
            newState = this.reducer(newState, action);
        }

        this.stateRef.current = newState;
        this.notifySubscribers(newState);
    }

    private updateState(action: TAction) {
        const currentState = this.stateRef.current!;
        const newState = this.reducer(currentState, action);

        this.stateRef.current = newState;
        this.notifySubscribers(newState);
    }

    subscribe = (callback: (state: TState) => void) => {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    };

    private notifySubscribers(state: TState) {
        this.subscribers.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
    }

    getState = (): TState => this.stateRef.current!;
}

/**
 * Selective state update hook
 */
export const useSelectiveState = <T>(
    selector: (state: T) => any,
    deps: React.DependencyList = []
) => {
    const [selectedValue, setSelectedValue] = useState(() => selector(null as any));
    const prevDepsRef = useRef<any[]>();

    useMemo(() => {
        const prevDeps = prevDepsRef.current;

        // Check if dependencies changed
        const depsChanged = !prevDeps ||
            deps.length !== prevDeps.length ||
            deps.some((dep, index) => dep !== prevDeps[index]);

        if (depsChanged) {
            setSelectedValue(() => selector(selectedValue as T));
            prevDepsRef.current = deps;
        }
    }, deps);

    return selectedValue;
};

/**
 * Shallow comparison hook to prevent unnecessary re-renders
 */
export const useShallowState = <T extends Record<string, any>>(
    initialState: T
): [T, (updates: Partial<T>) => void] => {
    const [state, setState] = useState<T>(initialState);

    const setShallowState = useCallback((updates: Partial<T>) => {
        setState(currentState => {
            // Perform shallow comparison
            const hasChanges = Object.keys(updates).some(
                key => currentState[key] !== updates[key]
            );

            if (!hasChanges) {
                return currentState; // No changes, return same reference
            }

            // Return new state with updates
            return { ...currentState, ...updates };
        });
    }, []);

    return [state, setShallowState];
};

/**
 * State selector with memoization
 */
export const useMemoizedSelector = <TState, TResult>(
    state: TState,
    selector: (state: TState) => TResult,
    equalityFn?: (a: TResult, b: TResult) => boolean
) => {
    const defaultEqualityFn = (a: TResult, b: TResult) => a === b;
    const equality = equalityFn || defaultEqualityFn;

    return useMemo(() => {
        return selector(state);
    }, [state, selector, equality]);
};

/**
 * Async state management
 */
export const useAsyncState = <T>(
    initialState: T
): [
        T,
        boolean,
        Error | null,
        {
            setData: (data: T) => void;
            setLoading: (loading: boolean) => void;
            setError: (error: Error | null) => void;
            reset: () => void;
        }
    ] => {
    const [data, setData] = useState<T>(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const actions = useMemo(() => ({
        setData: (newData: T) => {
            setData(newData);
            setError(null);
            setLoading(false);
        },
        setLoading: (isLoading: boolean) => {
            setLoading(isLoading);
            if (isLoading) {
                setError(null);
            }
        },
        setError: (err: Error | null) => {
            setError(err);
            setLoading(false);
        },
        reset: () => {
            setData(initialState);
            setLoading(false);
            setError(null);
        },
    }), [initialState]);

    return [data, loading, error, actions];
};

/**
 * State machine for complex state transitions
 */
export interface StateMachine<TState, TEvent> {
    currentState: TState;
    dispatch: (event: TEvent) => void;
    canTransition: (event: TEvent) => boolean;
    getPossibleTransitions: () => TEvent[];
}

export const useStateMachine = <TState, TEvent>(
    initialState: TState,
    reducer: (state: TState, event: TEvent) => TState,
    validator?: (state: TState, event: TEvent) => boolean
): StateMachine<TState, TEvent> => {
    const [currentState, setCurrentState] = useState<TState>(initialState);
    const stateRef = useRef<TState>(initialState);

    const dispatch = useCallback((event: TEvent) => {
        const current = stateRef.current;

        // Validate transition if validator provided
        if (validator && !validator(current, event)) {
            console.warn(`Invalid transition from ${stateRef.current} with event ${JSON.stringify(event)}`);
            return;
        }

        const newState = reducer(current, event);
        stateRef.current = newState;
        setCurrentState(newState);
    }, [reducer, validator]);

    const canTransition = useCallback((event: TEvent): boolean => {
        if (validator) {
            return validator(stateRef.current, event);
        }
        return true; // Allow all transitions if no validator
    }, [validator]);

    const getPossibleTransitions = useCallback((): TEvent[] => {
        // This would need to be implemented based on your state machine structure
        // For now, return empty array
        return [];
    }, []);

    return {
        currentState,
        dispatch,
        canTransition,
        getPossibleTransitions,
    };
};

/**
 * State persistence with automatic sync
 */
export const usePersistentState = <T>(
    key: string,
    initialState: T,
    options?: {
        serialize?: (value: T) => string;
        deserialize?: (value: string) => T;
        syncInterval?: number;
    }
) => {
    const {
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        syncInterval = 30000, // 30 seconds
    } = options || {};

    const [state, setState] = useState<T>(initialState);
    const [isSyncing, setIsSyncing] = useState(false);
    const lastSavedRef = useRef<T>(initialState);

    // Load from storage on mount
    useEffect(() => {
        const loadFromStorage = async () => {
            try {
                // In a real app, you'd load from AsyncStorage here
                // For now, we'll use localStorage as a fallback
                const stored = localStorage.getItem(`persistent_state_${key}`);
                if (stored) {
                    const parsedState = deserialize(stored);
                    setState(parsedState);
                    lastSavedRef.current = parsedState;
                }
            } catch (error) {
                console.error(`Error loading persistent state ${key}:`, error);
            }
        };

        loadFromStorage();
    }, [key, deserialize]);

    // Check for external changes periodically
    useEffect(() => {
        if (!syncInterval) return;

        const interval = setInterval(async () => {
            try {
                setIsSyncing(true);
                const stored = localStorage.getItem(`persistent_state_${key}`);
                if (stored) {
                    const parsedState = deserialize(stored);

                    // Only update if different from current
                    if (JSON.stringify(parsedState) !== JSON.stringify(state)) {
                        setState(parsedState);
                        lastSavedRef.current = parsedState;
                    }
                }
            } catch (error) {
                console.error(`Error syncing persistent state ${key}:`, error);
            } finally {
                setIsSyncing(false);
            }
        }, syncInterval);

        return () => clearInterval(interval);
    }, [key, syncInterval, deserialize, state]);

    const setPersistentState = useCallback((newState: T | ((prev: T) => T)) => {
        setState(prevState => {
            const updatedState = typeof newState === 'function'
                ? (newState as (prev: T) => T)(prevState)
                : newState;

            // Save to storage
            try {
                localStorage.setItem(`persistent_state_${key}`, serialize(updatedState));
                lastSavedRef.current = updatedState;
            } catch (error) {
                console.error(`Error saving persistent state ${key}:`, error);
            }

            return updatedState;
        });
    }, [key, serialize]);

    const resetPersistentState = useCallback(async () => {
        try {
            localStorage.removeItem(`persistent_state_${key}`);
            setState(initialState);
            lastSavedRef.current = initialState;
        } catch (error) {
            console.error(`Error resetting persistent state ${key}:`, error);
        }
    }, [key, initialState]);

    return [
        state,
        setPersistentState,
        {
            isSyncing,
            lastSaved: lastSavedRef.current,
            reset: resetPersistentState,
        },
    ] as const;
};

/**
 * State computation caching
 */
export const useComputedState = <T, R>(
    state: T,
    computeFn: (state: T) => R,
    options?: {
        cacheKey?: (state: T) => string;
        maxCacheSize?: number;
    }
) => {
    const cacheRef = useRef<Map<string, R>>(new Map());
    const { maxCacheSize = 50 } = options || {};

    return useMemo(() => {
        let cacheKey: string;

        if (options?.cacheKey) {
            cacheKey = options.cacheKey(state);
        } else {
            cacheKey = JSON.stringify(state);
        }

        // Check cache first
        if (cacheRef.current.has(cacheKey)) {
            return cacheRef.current.get(cacheKey)!;
        }

        // Compute new value
        const result = computeFn(state);

        // Clean cache if it's too large
        if (cacheRef.current.size >= maxCacheSize) {
            const entries = Array.from(cacheRef.current.entries());
            const toKeep = entries.slice(-(maxCacheSize * 0.7)); // Keep 70% most recent
            cacheRef.current.clear();
            toKeep.forEach(([key, value]) => cacheRef.current.set(key, value));
        }

        // Cache the result
        cacheRef.current.set(cacheKey, result);

        return result;
    }, [state, computeFn, maxCacheSize, options]);
};

/**
 * Performance monitoring for state updates
 */
export const useStatePerformanceMonitor = (componentName: string) => {
    const updateCountRef = useRef(0);
    const updateTimeRef = useRef<number[]>([]);

    const trackUpdate = useCallback((updateTime: number) => {
        updateCountRef.current++;
        updateTimeRef.current.push(updateTime);

        // Keep only last 50 updates
        if (updateTimeRef.current.length > 50) {
            updateTimeRef.current = updateTimeRef.current.slice(-50);
        }
    }, []);

    const getMetrics = useCallback(() => {
        const updates = updateTimeRef.current;
        const avgUpdateTime = updates.length > 0
            ? updates.reduce((sum, time) => sum + time, 0) / updates.length
            : 0;

        return {
            totalUpdates: updateCountRef.current,
            averageUpdateTime: Math.round(avgUpdateTime * 100) / 100,
            slowUpdates: updates.filter(time => time > 8).length,
            componentName,
        };
    }, [componentName]);

    return { trackUpdate, getMetrics };
};

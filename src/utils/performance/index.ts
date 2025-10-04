/**
 * Performance Utilities Index
 * Central export for all performance optimization utilities
 */

// Memoization utilities
export {
    useAdvancedMemo,
    useAdvancedCallback,
    usePersistentMemo,
    useBatchUpdates,
    useOptimizedImage,
    useListOptimization,
    usePerformanceMonitor,
    useDebouncedSearch,
    useCleanup,
} from './MemoizationUtils';

// Lazy loading utilities
export {
    createLazyComponent,
    ComponentPreloader,
    componentPreloader,
    RoutePreloader,
    createProgressiveComponent,
    createConditionalLazyComponent,
    getBundleStats,
    useResourceCleanup,
} from './LazyLoadingUtils';

// State optimization utilities
export {
    OptimizedReducer,
    useSelectiveState,
    useShallowState,
    useMemoizedSelector,
    useAsyncState,
    useStateMachine,
    usePersistentState,
    useComputedState,
    useStatePerformanceMonitor,
} from './StateOptimization';

// Performance monitoring
export {
    PerformanceMonitor,
    usePerformanceMonitor,
} from './PerformanceMonitor';

// Component optimizations
export { OptimizedList, useListPerformanceMonitor } from '../../components/ui/OptimizedList';

// Export types
export type {
    BatchUpdateFn,
    CleanupFn,
} from './MemoizationUtils';

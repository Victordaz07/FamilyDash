import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import { FLATLIST_CONFIG } from '../config/performance';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedListProps<T> {
    data: T[];
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
    keyExtractor: (item: T, index: number) => string;
    numColumns?: number;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    refreshing?: boolean;
    onRefresh?: () => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
    getItemLayout?: (data: ArrayLike<T> | null | undefined, index: number) => { length: number; offset: number; index: number };
    style?: any;
    contentContainerStyle?: any;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
}

const OptimizedList = <T,>({
    data,
    renderItem,
    keyExtractor,
    numColumns = 1,
    onEndReached,
    onEndReachedThreshold = 0.5,
    refreshing = false,
    onRefresh,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    getItemLayout,
    style,
    contentContainerStyle,
    showsVerticalScrollIndicator = false,
    showsHorizontalScrollIndicator = false,
}: OptimizedListProps<T>) => {
    // Memoizar la función renderItem para evitar re-renders innecesarios
    const memoizedRenderItem = useCallback(renderItem, []);
    
    // Memoizar la función keyExtractor
    const memoizedKeyExtractor = useCallback(keyExtractor, []);
    
    // Memoizar la función onEndReached
    const memoizedOnEndReached = useCallback(() => {
        if (onEndReached) {
            onEndReached();
        }
    }, [onEndReached]);
    
    // Memoizar la función onRefresh
    const memoizedOnRefresh = useCallback(() => {
        if (onRefresh) {
            onRefresh();
        }
    }, [onRefresh]);

    // Configuración optimizada del FlatList
    const flatListProps = useMemo(() => ({
        data,
        renderItem: memoizedRenderItem,
        keyExtractor: memoizedKeyExtractor,
        numColumns,
        onEndReached: memoizedOnEndReached,
        onEndReachedThreshold,
        refreshing,
        onRefresh: memoizedOnRefresh,
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        getItemLayout,
        style,
        contentContainerStyle,
        showsVerticalScrollIndicator,
        showsHorizontalScrollIndicator,
        // Optimizaciones de performance
        ...FLATLIST_CONFIG,
        // Optimizaciones adicionales específicas
        removeClippedSubviews: true,
        maxToRenderPerBatch: numColumns > 1 ? 6 : 10,
        windowSize: numColumns > 1 ? 5 : 10,
        initialNumToRender: numColumns > 1 ? 6 : 10,
        updateCellsBatchingPeriod: 50,
        disableVirtualization: false,
    }), [
        data,
        memoizedRenderItem,
        memoizedKeyExtractor,
        numColumns,
        memoizedOnEndReached,
        onEndReachedThreshold,
        refreshing,
        memoizedOnRefresh,
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        getItemLayout,
        style,
        contentContainerStyle,
        showsVerticalScrollIndicator,
        showsHorizontalScrollIndicator,
    ]);

    return (
        <FlatList<T>
            {...flatListProps}
        />
    );
};

// Componente memoizado para evitar re-renders innecesarios
const MemoizedOptimizedList = memo(OptimizedList) as <T>(
    props: OptimizedListProps<T>
) => React.ReactElement;

// Componente de placeholder para elementos vacíos
export const EmptyListPlaceholder = memo(({ 
    message = "No items found",
    icon = "📭",
    onPress
}: {
    message?: string;
    icon?: string;
    onPress?: () => void;
}) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {onPress && (
            <Text style={styles.emptyAction}>Tap to refresh</Text>
        )}
    </View>
));

// Componente de loading para el footer
export const LoadingFooter = memo(({ 
    loading = false,
    message = "Loading more items..."
}: {
    loading?: boolean;
    message?: string;
}) => {
    if (!loading) return null;
    
    return (
        <View style={styles.loadingFooter}>
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
});

// Componente de header optimizado
export const OptimizedHeader = memo(({ 
    title,
    subtitle,
    action,
    onActionPress
}: {
    title: string;
    subtitle?: string;
    action?: string;
    onActionPress?: () => void;
}) => (
    <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && (
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
            )}
        </View>
        {action && onActionPress && (
            <Text 
                style={styles.headerAction}
                onPress={onActionPress}
            >
                {action}
            </Text>
        )}
    </View>
));

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyAction: {
        fontSize: 14,
        color: '#3B82F6',
        textAlign: 'center',
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    headerAction: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
});

export default MemoizedOptimizedList;

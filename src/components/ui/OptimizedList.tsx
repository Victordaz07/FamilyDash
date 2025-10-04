import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  FlatList,
  VirtualizedList,
  StyleSheet,
  View,
  Text,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { useTheme, AdvancedCard } from './index';

const { height: screenHeight } = Dimensions.get('window');

/**
 * Optimized List component with virtualization and performance features
 */

interface OptimizedListItem {
  id: string;
  [key: string]: any;
}

interface OptimizedListProps<T extends OptimizedListItem> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  
  // Performance options
  itemHeight?: number;
  estimatedItemSize?: number;
  overscanCount?: number;
  virtualization?: boolean;
  
  // Loading options
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  
  // Empty state
  emptyComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
  
  // Accessibility
  accessibilityLabel?: string;
  
  // Style options
  style?: any;
  contentContainerStyle?: any;
  horizontal?: boolean;
  
  // Events
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  
  // Optimization options
  removeClippedSubviews?: boolean;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  windowSize?: number;
}

export function OptimizedList<T extends OptimizedListItem>({
  data,
  renderItem,
  keyExtractor = (item) => item.id,
  
  // Performance options
  itemHeight = 60,
  estimatedItemSize = 60,
  overscanCount = 5,
  virtualization = true,
  
  // Loading options
  isLoading = false,
  onLoadMore,
  hasMore = false,
  
  // Empty state
  EmptyComponent = DefaultEmptyComponent,
  LoadingComponent = DefaultLoadingComponent,
  
  // Accessibility
  accessibilityLabel = "Optimized list",
  
  // Style options
  style,
  contentContainerStyle,
  horizontal = false,
  
  // Events
  onEndReached,
  onEndReachedThreshold = 0.5,
  onRefresh,
  isEmpty = false,
  refreshing = false,
  
  // Optimization options
  removeClippedSubviews = true,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 50,
  initialNumToRender = 10,
  windowSize = 10,
  
  ...props
}: OptimizedListProps<T>) {
  const theme = useTheme();
  const [viewableItems, setViewableItems] = useState<ViewableInfo[]>([]);
  const onViewableItemsChangedRef = useRef<{
    onViewableItemsChanged: (info: { viewableItems: ViewableInfo[]; changed: ViewableInfo[] }) => void;
  }>({
    onViewableItemsChanged: ({ viewableItems }) => setViewableItems(viewableItems),
  });

  // Memoized render item with performance optimizations
  const optimizedRenderItem = useMemo(() => {
    return ({ item, index }: { item: T; index: number }) => {
      const isVisible = viewableItems.some(vi => vi.key === keyExtractor(item, index));
      
      if (!isVisible && virtualization) {
        return <View style={{ height: itemHeight }} />;
      }

      return renderItem({ item, index });
    };
  }, [renderItem, viewableItems, virtualization, keyExtractor, itemHeight]);

  // Extractors
  const keyExtractorMemo = useMemo(
    () => keyExtractor,
    [keyExtractor]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  const getItemCount = useCallback(
    () => data.length,
    [data.length]
  );

  const getItem = useCallback(
    (data, index) => data[index],
    []
  );

  // Loading footer component
  const renderFooter = useMemo(() => {
    if (!isLoading || !hasMore) return null;

    return (
      <View style={styles.footer}>
        <LoadingComponent />
      </View>
    );
  }, [isLoading, hasMore, LoadingComponent]);

  // Empty state
  const renderEmpty = useMemo(() => {
    if (!isEmpty) return null;

    return (
      <View style={styles.emptyContainer}>
        <EmptyComponent />
      </View>
    );
  }, [isEmpty, EmptyComponent]);

  // Render appropriate list type based on virtualization setting
  if (!virtualization) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractorMemo}
        
        // Performance optimizations
        removeClippedSubviews={removeClippedSubviews}
        maxToRenderPerBatch={maxToRenderPerBatch}
        updateCellsBatchingPeriod={updateCellsBatchingPeriod}
        initialNumToRender={initialNumToRender}
        windowSize={windowSize}
        
        // End reached optimization
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        
        // Refresh
        onRefresh={onRefresh}
        refreshing={refreshing}
        
        // Style
        style={style}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
        ]}
        
        // Accessibility
        accessibilityLabel={accessibilityLabel}
        
        // Footer and empty states
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        
        // Events
        onViewableItemsChanged={onViewableItemsChangedRef.current.onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        
        horizontal={horizontal}
        
        {...props}
      />
    );
  }

  // Virtualized list for large datasets
  return (
    <VirtualizedList
      data={data}
      renderItem={optimizedRenderItem}
      keyExtractor={keyExtractorMemo}
      getItemCount={getItemCount}
      getItem={getItem}
      getItemLayout={getItemLayout}
      
      // Performance optimizations
      removeClippedSubviews={removeClippedSubviews}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      initialNumToRender={initialNumToRender}
      windowSize={windowSize}
      
      // End reached optimization
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      
      // Refresh
      onRefresh={onRefresh}
      refreshing={refreshing}
      
      // Style
      style={style}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
      ]}
      
      // Accessibility
      accessibilityLabel={accessibilityLabel}
      
      // Footer and empty states
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      
      // Events
      onViewableItemsChanged={onViewableItemsChangedRef.current.onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
      
      horizontal={horizontal}
      
      {...props}
    />
  );
}

// Default components
const DefaultEmptyComponent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <AdvancedCard variant="outlined" size="lg" style={styles.emptyCard}>
      <Text style={[theme.typography.textStyles.body, styles.emptyText]}>
        No items to display
      </Text>
      <Text style={[theme.typography.textStyles.subtitle, styles.emptySubtext]}>
        Check back later for new content
      </Text>
    </AdvancedCard>
  );
};

const DefaultLoadingComponent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <AdvancedCard variant="outlined" size="sm" style={styles.loadingCard}>
      <Text style={[theme.typography.textStyles.body, styles.loadingText]}>
        Loading more items...
      </Text>
    </AdvancedCard>
  );
};

// Extended interface for viewable items
interface ViewableInfo {
  key: string;
  index: number | null;
  isViewable: boolean;
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

/**
 * Hook for list performance monitoring
 */
export const useListPerformanceMonitor = (listId: string) => {
  const renderStartRef = useRef<number>();
  const renderTimesRef = useRef<number[]>([]);

  const trackRenderStart = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const trackRenderEnd = useCallback(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      renderTimesRef.current.push(renderTime);
      
      // Keep only last 50 render times
      if (renderTimesRef.current.length > 50) {
        renderTimesRef.current = renderTimesRef.current.slice(-50);
      }
      
      // Log slow renders
      if (renderTime > 16) {
        console.warn(`${listId} slow render: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [listId]);

  const getMetrics = useCallback(() => {
    const times = renderTimesRef.current;
    const avgTime = times.length > 0 
      ? times.reduce((sum, time) => sum + time, 0) / times.length 
      : 0;

    return {
      totalRenders: times.length,
      averageRenderTime: Math.round(avgTime * 100) / 100,
      slowRenders: times.filter(time => time > 16).length,
      lastRenderTime: times.length > 0 ? Math.round(times[times.length - 1] * 100) / 100 : 0,
      listId,
    };
  }, [listId]);

  return {
    trackRenderStart,
    trackRenderEnd,
    getMetrics,
  };
};

export default OptimizedList;

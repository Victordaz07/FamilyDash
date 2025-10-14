/**
 * 📋 OPTIMIZED LIST COMPONENT — FamilyDash+
 * Lista optimizada con virtualización y lazy loading
 */

import React, { useMemo, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { usePagination, useSearch, useSortedData } from '@/hooks/usePerformance';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  searchFields?: (keyof T)[];
  searchTerm?: string;
  sortField?: keyof T;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  emptyMessage?: string;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export const OptimizedList = <T,>({
  data,
  renderItem,
  keyExtractor,
  searchFields = [],
  searchTerm = '',
  sortField,
  sortDirection = 'asc',
  pageSize = 20,
  onLoadMore,
  onRefresh,
  loading = false,
  refreshing = false,
  emptyMessage = 'No hay elementos para mostrar',
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}: OptimizedListProps<T>) => {
  // Search data
  const searchedData = useSearch(data, searchFields, searchTerm);

  // Sort data
  const sortedData = useMemo(() => {
    if (sortField) {
      return [...searchedData].sort((a, b) => {
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
    }
    return searchedData;
  }, [searchedData, sortField, sortDirection]);

  // Pagination
  const { paginatedData, hasNextPage, nextPage } = usePagination(sortedData, pageSize);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, onLoadMore]);

  const renderFooter = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={styles.footerText}>Cargando más...</Text>
        </View>
      );
    }
    return null;
  }, [loading]);

  const renderEmpty = useCallback(() => {
    if (ListEmptyComponent) {
      return ListEmptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [ListEmptyComponent, emptyMessage]);

  return (
    <FlatList
      data={paginatedData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default OptimizedList;




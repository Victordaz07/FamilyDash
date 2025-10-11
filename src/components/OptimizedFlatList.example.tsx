/**
 * Optimized FlatList Example
 * Best practices for performance with large lists
 * 
 * Phase 7: Performance optimization guide
 * 
 * This is an EXAMPLE file showing how to optimize FlatList components.
 * Apply these patterns to your actual list components (TaskList, etc.)
 */

import React, { useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, ListRenderItem } from 'react-native';

// Example data type
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: number;
  updatedAt: number;
}

// Define item height for getItemLayout (if all items same height)
const ITEM_HEIGHT = 80;
const SEPARATOR_HEIGHT = 8;

/**
 * Memoized list item component
 * Only re-renders when item data actually changes
 */
const TaskItem = React.memo<{ task: Task; onPress: (id: string) => void }>(
  ({ task, onPress }) => {
    const handlePress = useCallback(() => {
      onPress(task.id);
    }, [task.id, onPress]);

    return (
      <View style={styles.item}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
        <Text style={styles.status}>{task.status}</Text>
      </View>
    );
  },
  // Custom comparison function - only re-render if these change
  (prevProps, nextProps) => {
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.status === nextProps.task.status &&
      prevProps.task.updatedAt === nextProps.task.updatedAt
    );
  }
);

TaskItem.displayName = 'TaskItem';

/**
 * Optimized FlatList component
 */
export const OptimizedTaskList: React.FC<{
  tasks: Task[];
  onTaskPress: (id: string) => void;
}> = ({ tasks, onTaskPress }) => {
  // Memoize sorted/filtered data
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.priority - a.priority);
  }, [tasks]);

  // Memoize key extractor
  const keyExtractor = useCallback((item: Task) => item.id, []);

  // Memoize render item
  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => <TaskItem task={item} onPress={onTaskPress} />,
    [onTaskPress]
  );

  // Memoize separator component
  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  // getItemLayout for better performance (if items have fixed height)
  const getItemLayout = useCallback(
    (_data: Task[] | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={sortedTasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      getItemLayout={getItemLayout}
      // Performance optimizations
      initialNumToRender={10} // Render first 10 items
      maxToRenderPerBatch={10} // Batch size for rendering
      windowSize={5} // Number of screens to render (default 21)
      removeClippedSubviews={true} // Unmount offscreen items (Android)
      updateCellsBatchingPeriod={50} // Delay between batch renders
      // Prevent unnecessary re-renders
      extraData={sortedTasks.length} // Only re-render if length changes
      // Style
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  item: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    minHeight: ITEM_HEIGHT,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  separator: {
    height: SEPARATOR_HEIGHT,
  },
});

/**
 * Performance Best Practices Summary:
 * 
 * 1. ✅ Use React.memo() for list items
 * 2. ✅ Use useCallback() for functions passed as props
 * 3. ✅ Use useMemo() for expensive computations (sorting, filtering)
 * 4. ✅ Implement getItemLayout if items have fixed height
 * 5. ✅ Use keyExtractor properly (stable, unique keys)
 * 6. ✅ Configure FlatList performance props:
 *    - initialNumToRender (10-20)
 *    - maxToRenderPerBatch (5-10)
 *    - windowSize (5-10)
 *    - removeClippedSubviews (true on Android)
 * 7. ✅ Use numberOfLines to limit text rendering
 * 8. ✅ Avoid inline functions and objects
 * 9. ✅ Use extraData carefully (only when needed)
 * 10. ✅ Consider react-native-fast-image for images
 */


# 🚀 Real-time Features Documentation

## Overview

FamilyDash's real-time features enable instant synchronization and communication between family members across all modules. This system provides live updates, instant notifications, and collaborative experiences.

## Core Components

### 1. WebSocketManager

The central WebSocket management system handles all real-time communication.

```typescript
import { WebSocketManager } from '../services/realtime';

const wsManager = WebSocketManager.getInstance();

// Connect to WebSocket
await wsManager.connect();

// Send messages
wsManager.send({
  type: 'task_assigned',
  payload: {
    taskId: 'task_001',
    title: 'Clean room',
    assignedTo: 'diego_001',
  },
  senderId: 'maria_001',
  senderName: 'Maria Ruiz',
  familyId: 'family_ruiz_001',
});

// Subscribe to messages
const unsubscribe = wsManager.onMessage('task_assigned', (message) => {
  console.log('Task assigned:', message.payload);
});
```

### 2. RealTimeSync

Handles data synchronization across family members with conflict resolution.

```typescript
import { RealTimeSync } from '../services/realtime';

const syncService = RealTimeSync.getInstance();

// Register stores for synchronization
syncService.registerStore('tasks', taskStore);
syncService.registerStore('goals', goalStore);
syncService.registerStore('penalties', penaltyStore);

// Queue entity changes for sync
syncService.queueEntityChange({
  type: 'update',
  entity: 'tasks',
  entityId: 'task_001',
  data: { status: 'completed' },
});

// Subscribe to sync events
syncService.on('conflictDetected', (conflict) => {
  console.log('Conflict detected:', conflict);
  // Handle conflict resolution
});
```

### 3. React Hooks

Easy integration of real-time features in React components.

#### useRealTime

Main hook for real-time functionality.

```typescript
import { useRealTime } from '../hooks/useRealTime';

const MyComponent = () => {
  const {
    connectionStatus,
    syncStatus,
    connect,
    disconnect,
    sendMessage,
    triggerSync,
    forceSync,
  } = useRealTime({
    autoConnect: true,
    messageThrottle: 100,
  });

  return (
    <View>
      <Text>Status: {connectionStatus.connected ? 'Connected' : 'Disconnected'}</Text>
      <Text>Quality: {connectionStatus.quality}</Text>
      <Text>Latency: {connectionStatus.latency}ms</Text>
      
      <Button 
        title="Sync Now" 
        onPress={triggerSync}
        disabled={syncStatus.syncing}
      />
    </View>
  );
};
```

#### useRealTimeData

Subscribe to real-time data streams.

```typescript
import { useRealTimeData } from '../hooks/useRealTime';

const ActivityFeed = () => {
  const { data: activities, loading, error } = useRealTimeData<Activity>(
    'family_activity',
    [], // Initial data
    {
      autoUpdate: true,
      maxItems: 50,
      retentionPeriod: 3600000, // 1 hour
    }
  );

  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => (
        <ActivityItem activity={item} />
      )}
    />
  );
};
```

#### useRealTimeEntity

Sync individual entities across devices.

```typescript
import { useRealTimeEntity } from '../hooks/useRealTime';

const TaskDetails = ({ taskId }) => {
  const {
    entity: task,
    loading,
    error,
    hasConflicts,
    updateEntity,
    deleteEntity,
  } = useRealTimeEntity(
    'tasks',
    taskId,
    taskStore,
    {
      autoSync: true,
      conflictResolution: 'server',
    }
  );

  const handleComplete = async () => {
    await updateEntity({ status: 'completed' });
  };

  return (
    <View>
      <Text>{task?.title}</Text>
      <Text>Status: {task?.status}</Text>
      
      {hasConflicts && (
        <AlertBox message="Conflict detected! Please resolve." />
      )}
      
      <Button title="Complete" onPress={handleComplete} />
    </View>
  );
};
```

#### useRealTimeFamilyStatus

Track family member online status.

```typescript
import { useRealTimeFamilyStatus } from '../hooks/useRealTime';

const FamilyStatus = () => {
  const { members, memberCounts } = useRealTimeFamilyStatus();

  return (
    <View>
      <Text>Online: {memberCounts.online}</Text>
      <Text>Offline: {memberCounts.offline}</Text>
      
      {members.map(member => (
        <View key={member.id}>
          <Text>{member.name}</Text>
          <View style={[
            styles.statusDot, 
            { backgroundColor: member.status === 'online' ? 'green' : 'gray' }
          ]} />
        </View>
      ))}
    </View>
  );
};
```

### 4. UI Components

#### RealTimeStatus

Display connection and sync status.

```typescript
import { RealTimeStatus } from '../components/realtime/RealTimeStatus';

// Compact status indicator
<RealTimeStatus compact={true} />

// Full status with sync controls
<RealTimeStatus 
  showSyncStatus={true}
  showConflictResolution={true}
/>

// With detailed modal
<RealTimeStatus 
  showSyncStatus={true}
  showConflictResolution={true}
/>
```

#### RealTimeDashboard

Complete dashboard showing live family activity.

```typescript
import { RealTimeDashboard } from '../components/realtime/RealTimeDashboard';

// Use in navigation stack
<Stack.Screen
  name="RealTimeFamily"
  component={RealTimeDashboard}
/>
```

## Data Flow

### 1. Entity Updates

```
Local Change → RealTimeSync → WebSocketManager → Server → Other Clients
                    ↓
              Conflict Detection
                    ↓
              Resolution Strategy
                    ↓
              Local Store Update
```

### 2. Message Broadcasting

```
Component → WebSocketManager → Server → All Family Members
                    ↓
              Activity Feed Update
                    ↓
              Real-time UI Refresh
```

### 3. Connection Management

```
App Start → Auto Connect → Heartbeat → Latency Monitoring
     ↓             ↓           ↓           ↓
Status Updates ← Connection Quality ← Disconnect Handling
```

## Message Types

### System Messages

- `ping` / `pong`: Connection heartbeat
- `family_member_online`: User came online
- `family_member_offline`: User went offline

### Entity Messages

- `entity_create`: New entity created
- `entity_update`: Entity updated
- `entity_delete`: Entity deleted
- `sync_conflict`: Data conflict detected

### Module-specific Messages

#### Tasks
- `task_assigned`: New task assigned
- `task_completed`: Task marked complete
- `task_overdue`: Task deadline passed

#### Goals
- `goal_progress`: Progress milestone reached
- `goal_achieved`: Goal completed
- `goal_milestone`: New milestone reached

#### Penalties
- `penalty_assigned`: New penalty given
- `penalty_expired`: Penalty time ended
- `penalty_completed`: Penalty served

#### SafeRoom
- `saferoom_message`: New message posted
- `saferoom_reaction`: Reaction added
- `saferoom_comment`: Comment posted

#### Calendar
- `calendar_event`: Event created/updated
- `calendar_reminder`: Reminder triggered
- `calendar_conflict`: Scheduling conflict

## Conflict Resolution Strategies

### 1. Server Wins (`server`)
- Remote changes always take precedence
- No user interaction required
- Use for: System-generated data, notifications

### 2. Client Wins (`client`)
- Local changes always take precedence
- No user interaction required
- Use for: User preferences, UI state

### 3. Manual (`manual`)
- Conflicts require user intervention
- Show conflict resolution UI
- User chooses resolution strategy
- Use for: Important data, complex conflicts

## Performance Considerations

### 1. Message Throttling
- Batches rapid updates to prevent spam
- Configurable throttling intervals
- Automatic queue management

### 2. Memory Management
- Automatic cleanup of old messages
- Limited retention periods
- Efficient subscription management

### 3. Network Optimization
- Connection pooling
- Latency monitoring
- Automatic reconnection
- Quality assessment

## Error Handling

### Connection Errors
- Automatic reconnection with exponential backoff
- Offline message queueing
- Network state detection

### Sync Conflicts
- Automatic conflict detection
- Resolution strategy application
- Manual conflict UI

### Data Corruption
- Validation checks
- Rollback mechanisms
- Error logging and recovery

## Development Mode

The real-time system includes development simulation:

```typescript
// WebSocketManager automatically simulates in development
const wsManager = WebSocketManager.getInstance();
await wsManager.connect(); // Simulates connection

// Simulates various message types
wsManager.simulateInitialMessages(); // Sends sample messages
```

## Testing

### Unit Tests
```bash
npm test src/services/realtime/
```

### Integration Tests
```bash
npm test src/hooks/useRealTime.test.ts
```

### E2E Tests
```bash
npm test src/components/realtime/
```

## Best Practices

### 1. Entity Management
- Always register stores before use
- Use appropriate conflict strategies
- Handle offline scenarios

### 2. Performance
- Use `useRealTimeData` for lists
- Implement proper cleanup
- Monitor memory usage

### 3. User Experience
- Show connection status
- Provide offline indicators
- Handle conflicts gracefully

### 4. Error Handling
- Log all errors
- Provide fallback behavior
- Guide user recovery

## Troubleshooting

### Connection Issues
1. Check WebSocket URL configuration
2. Verify network connectivity
3. Review firewall settings

### Sync Problems
1. Check entity store registration
2. Verify conflict resolution strategy
3. Review data validation rules

### Performance Issues
1. Monitor memory usage
2. Check message queue size
3. Review throttling settings

## Future Enhancements

1. **Encryption**: End-to-end message encryption
2. **Compression**: Reduced data usage
3. **Offline Mode**: Full offline functionality
4. **Voice/Video**: Real-time communication
5. **Presence**: Advanced user presence
6. **Analytics**: Real-time usage metrics

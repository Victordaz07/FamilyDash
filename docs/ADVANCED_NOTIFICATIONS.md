# Advanced Notifications System 📱🔔

FamilyDash's intelligent push notification system with deep linking, analytics, and smart timing features.

## 🎯 Overview

The Advanced Notifications system provides comprehensive push notification capabilities including:

- **Smart Push Scheduling** - Intelligent timing based on user preferences
- **Deep Linking System** - Direct navigation to specific app sections
- **Advanced Notification Center** - Complete notification management UI
- **Analytics & Tracking** - Engagement metrics and performance monitoring
- **Smart Timing** - Quiet hours, frequency limits, and user behavior analysis
- **Rich Notifications** - Images, actions, and interactive buttons

## 🏗️ Architecture

### Core Components

```
src/
├── services/notifications/
│   ├── AdvancedNotificationService.ts    # Main notification service
│   ├── DeepLinkService.ts                # Deep linking functionality
│   └── index.ts                         # Exports
├── components/notifications/
│   ├── NotificationCenter.tsx             # Full notification management UI
│   ├── NotificationToast.tsx            # Quick toast notifications
│   └── index.ts                        # Component exports
├── hooks/
│   └── useNotifications.ts              # Easy integration hook
└── docs/
    └── ADVANCED_NOTIFICATIONS.md        # This documentation
```

## 🚀 Getting Started

### 1. Basic Setup

```typescript
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const {
    sendTaskNotification,
    sendGoalNotification,
    permissionStatus,
    preferences,
  } = useNotifications({
    autoConnect: true,
    requestPermissions: true,
    enableAnalytics: true,
  });

  return (
    // Your component JSX
  );
};
```

### 2. Request Permissions

```typescript
const requestPermissions = async () => {
  const hasPermission = await notificationService.requestPermissions();
  if (!hasPermission) {
    Alert.alert('Permissions', 'Enable notifications for family updates');
  }
};
```

### 3. Send Notifications

```typescript
// Task notification
await sendTaskNotification('task_123', 'Clean Room', 'john_doe', {
  priority: 'high',
  actions: [
    { id: 'complete', title: 'Complete', action: 'COMPLETE_TASK' },
  ],
});

// Goal notification
await sendGoalNotification('goal_456', 'Learn Spanish', 75, {
  priority: 'medium',
  milestone: 'Week 3 Complete!',
});

// SafeRoom notification
await sendSafeRoomNotification('msg_789', 'Mom', 'How was today?', {
  urgent: false,
});
```

## 📱 Notification Channels

### Available Channels

| Channel ID | Name | Description | Importance |
|------------|------|-------------|------------|
| `familydash-tasks` | Family Tasks | Task assignments and completions | High |
| `familydash-goals` | Family Goals | Goal progress and achievements | Medium |
| `familydash-penalties` | Family Penalties | Penalty assignments | High |
| `familydash-calendar` | Family Calendar | Events and reminders | Medium |
| `familydash-saferoom` | SafeRoom | Family messages | High |
| `familydash-chat` | Family Chat | Quick communications | Medium |
| `familydash-general` | General | General family notifications | Low |

### Custom Channels

```typescript
const customChannel: NotificationChannel = {
  id: 'custom_channel',
  name: 'Custom Notifications',
  description: 'Custom app notifications',
  importance: 'medium',
  sound: true,
  vibration: true,
  badge: true,
  enabled: true,
};

notificationService.registerChannel(customChannel);
```

## 🔗 Deep Linking System

### Supported Routes

```typescript
// Navigation examples
'/tasks'                 // Tasks overview
'/tasks/{taskId}'       // Specific task
'/goals'                // Goals overview
'/goals/{goalId}'       // Specific goal
'/penalties'            // Penalties overview
'/penalties/{penaltyId}' // Specific penalty
'/calendar'             // Calendar view
'/calendar/event/{eventId}' // Specific event
'/saferoom'             // SafeRoom messages
'/saferoom/message/{messageId}' // Specific message
'/profile'              // User profile
'/profile/{memberId}'   // Member profile
'/settings'             // App settings
'/dashboard'            // Main dashboard
```

### Generate Deep Links

```typescript
import { DeepLinkService } from '../services/notifications/DeepLinkService';

const deepLinkService = DeepLinkService.getInstance();

// Generate links
const taskLink = deepLinkService.generateDeepLink('/tasks', { taskId: '123' });
const goalLink = deepLinkService.generateDeepLink('/goals', { category: 'learning' });

// Handle incoming links
deepLinkService.handleDeepLink(taskLink).then((result) => {
  if (result.success) {
    // Navigate to result.screen with result.params
  }
});
```

## 📊 Analytics & Tracking

### Notification Analytics

```typescript
interface NotificationAnalytics {
  notificationId: string;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  dismissedCount: number;
  conversionRate: number;
  engagementScore: number;
  avgResponseTime: number;
}
```

### Analytics Usage

```typescript
const { getNotificationStats } = useNotifications();

const stats = getNotificationStats();
console.log(`Response rate: ${stats.responseRate}%`);
console.log(`Unread count: ${stats.unreadCount}`);
```

## ⚙️ Notification Preferences

### User Preferences

```typescript
interface UserNotificationPreferences {
  userId: string;
  enabled: boolean;
  channels: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: number; // minutes from midnight
    end: number;
  };
  quietDays: string[];
  frequencyLimit: number;
  topics: string[];
}
```

### Update Preferences

```typescript
const { updateNotificationPreferences } = useNotifications();

// Update channel preferences
await updateNotificationPreferences({
  channels: {
    'familydash-tasks': true,
    'familydash-goals': false,
  },
});

// Set quiet hours (10 PM to 7 AM)
await updateNotificationPreferences({
  quietHours: {
    enabled: true,
    start: 22 * 60,  // 10 PM
    end: 7 * 60,     // 7 AM
  },
});
```

## 🎛️ Notification Center Component

### Basic Usage

```typescript
import { NotificationCenter } from '../components/notifications/NotificationCenter';

const MyScreen = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <View>
      <Button 
        title="Show Notifications" 
        onPress={() => setShowNotifications(true)} 
      />
      
      <NotificationCenter
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View>
  );
};
```

### Features

- **Tabbed Interface**: All, Unread, Archived
- **Action Buttons**: View, Reply, Complete, etc.
- **Preferences Modal**: Channel settings, quiet hours
- **Mark as Read**: Individual or bulk actions
- **Real-time Updates**: Live notification count

## 📤 Toast Notifications

### Quick Toast Messages

```typescript
import { NotificationToast } from '../components/notifications/NotificationToast';

const MyComponent = () => (
  <NotificationToast
    visible={true}
    title="Task Completed!"
    message="Your room cleaning task has been marked as done."
    type="success"
    duration={3000}
    onPress={() => console.log('Toast pressed')}
  />
);
```

### Toast Manager for Queuing

```typescript
import { NotificationToastManager } from '../components/notifications/NotificationToast';

const App = () => (
  <View style={{ flex: 1 }}>
    {/* Your app content */}
    
    <NotificationToastManager position="top" />
  </View>
);
```

## 🎯 Smart Timing Features

### Quiet Hours

```typescript
// Automatic quiet hours enforcement
const notification = {
  // ... notification data
  smartTiming: {
    quietHours: { start: 22 * 60, end: 7 * 60 }, // 10 PM - 7 AM
    maxFrequency: 5, // Max 5 notifications per day
  },
};
```

### Frequency Limiting

```typescript
// Smart frequency management
notificationService.sendNotification({
  // ... data
  smartTiming: {
    maxFrequency: 3, // Max 3 notifications per day
    lastSent: Date.now(),
  },
});
```

### Scheduled Notifications

```typescript
import { scheduleNotification } from '../hooks/useNotifications';

// Schedule for specific time
await scheduleNotification(notification, new Date('2024-01-15T18:00:00'));

// Schedule relative time
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
await scheduleNotification(notification, tomorrow);
```

## 🔄 Batch Operations

### Batch Notifications

```typescript
const { sendBatchNotifications } = useNotifications();

const notifications = [
  {
    id: 'batch_1',
    title: 'Week Summary',
    body: 'You completed 8 tasks this week!',
    channelId: 'familydash-general',
  },
  {
    id: 'batch_2',
    title: 'Goal Progress',
    body: 'Family goal 70% complete',
    channelId: 'familydash-goals',
  },
];

const results = await sendBatchNotifications(notifications);
```

### Cancel All Notifications

```typescript
const { cancelAllNotifications } = useNotifications();

await cancelAllNotifications();
```

## 🎨 Customization

### Custom Notification Categories

```typescript
notificationService.createNotificationCategories([
  {
    id: 'custom_category',
    name: 'Custom Category',
    actions: [
      {
        id: 'action_1',
        title: 'Action 1',
        action: 'CUSTOM_ACTION_1',
      },
      {
        id: 'action_2',
        title: 'Action 2',
        action: 'CUSTOM_ACTION_2',
        destructive: true,
      },
    ],
  },
]);
```

### Custom Toast Types

```typescript
const customColors = {
  background: ['#8B5CF6', '#7C3AED'],
  icon: '#ffffff',
  iconName: 'sparkles',
};

<NotificationToast
  type="info" // Use info as base
  // Custom styling would be applied
/>
```

## 🔧 Integration with App Modules

### Task Module Integration

```typescript
// In TaskStore.ts
import { useNotifications } from '../hooks/useNotifications';

const useTaskStore = create((set, get) => ({
  // ... store methods
  
  addTask: async (task: Task) => {
    set(state => ({ tasks: [...state.tasks, task] }));
    
    // Send notification
    const { sendTaskNotification } = useNotifications();
    await sendTaskNotification(task.id, task.title, task.assignedTo, {
      priority: 'high',
    });
  },
  
  completeTask: async (taskId: string) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, completed: true } : t
      ),
    }));
    
    // Completion notification
    await sendTaskNotification(taskId, 'Task Completed', 'system', {
      priority: 'medium',
    });
  },
}));
```

### Calendar Module Integration

```typescript
// In Calendar hooks
export const useCalendarEvents = () => {
  const { sendCalendarNotification } = useNotifications();
  
  const createEvent = async (event: Event) => {
    // Create event logic...
    
    // Send reminder notifications
    const reminderTime = new Date(event.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 min before
    
    await scheduleCalendarNotification(event.id, event.title, 30, {
      priority: 'medium',
      reminderType: 'upcoming',
    });
  };
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Permissions Not Granted

```typescript
// Check permission status
const { permissionStatus } = useNotifications();

if (permissionStatus === 'denied') {
  // Show settings link or retry request
  Alert.alert(
    'Notifications Disabled',
    'Please enable notifications in Settings > FamilyDash',
    [{ text: 'OK' }, { text: 'Settings', onPress: () => {/* Open settings */} }]
  );
}
```

#### 2. Deep Links Not Working

```typescript
// Test deep link
const testLink = deepLinkService.generateDeepLink('/tasks', { taskId: '123' });
console.log('Generated link:', testLink);

// Test route handling
deepLinkService.testDeepLink(testLink).then(result => {
  console.log('Test result:', result);
});
```

#### 3. Analytics Not Tracking

```typescript
// Check analytics data
const analytics = notificationService.getAnalytics();
console.log('Analytics entries:', analytics.size);

// Manual tracking
notificationService.trackNotificationSent(notification);
```

### Debug Mode

```typescript
// Enable debug logging
const notificationService = AdvancedNotificationService.getInstance();
notificationService.enableDebugMode(true); // If this method exists

// Check service status
console.log('Channels:', notificationService.getChannels());
console.log('Preferences:', notificationService.getUserPreferences());
```

## 📈 Performance Considerations

### Optimization Tips

1. **Batch Operations**: Use `sendBatchNotifications()` for multiple notifications
2. **Channel Management**: Disable unused channels to reduce overhead
3. **Analytics Sampling**: Don't track every notification in development
4. **Toast Limits**: Limit concurrent toast notifications
5. **Memory Management**: Clean up scheduled notifications

### Memory Usage

```typescript
// Monitor notification service memory
const analytics = notificationService.getAnalytics();
const scheduledCount = /* get scheduled notifications count */;

if (scheduledCount > 100) {
  // Too many scheduled notifications, clean up old ones
  await notificationService.cancelOldNotifications();
}
```

## 🔮 Future Enhancements

### Planned Features

1. **Rich Media**: Support for images and videos in notifications
2. **Voice Integration**: Voice message notifications
3. **Machine Learning**: Smart timing based on user behavior
4. **Geofencing**: Location-based family notifications
5. **Multi-language**: Automatic translation for notifications
6. **Advanced Analytics**: Predictive engagement scoring

### Contribution Guidelines

When extending the notification system:

1. Follow the existing TypeScript interfaces
2. Add comprehensive error handling
3. Include analytics tracking
4. Update this documentation
5. Add tests for new functionality

---

## 📝 API Reference

### AdvancedNotificationService

```typescript
class AdvancedNotificationService {
  static getInstance(): AdvancedNotificationService
  requestPermissions(): Promise<boolean>
  sendNotification(notification: SmartNotification): Promise<boolean>
  scheduleNotification(notification: SmartNotification): Promise<boolean>
  cancelNotification(notificationId: string): Promise<boolean>
  updateUserPreferences(preferences: Partial<UserNotificationPreferences>): Promise<void>
  getUserPreferences(): UserNotificationPreferences | null
  getAnalytics(): Map<string, NotificationAnalytics>
  getChannels(): NotificationChannel[]
}
```

### DeepLinkService

```typescript
class DeepLinkService {
  static getInstance(): DeepLinkService
  handleDeepLink(url: string): Promise<DeepLinkResult>
  generateDeepLink(screen: string, params: Record<string, any>): string
  getAvailableRoutes(): DeepLinkRoute[]
  testDeepLink(url: string): Promise<DeepLinkResult>
}
```

### useNotifications Hook

```typescript
const useNotifications = (config?: NotificationConfig) => {
  return {
    // State
    permissionStatus: 'unknown' | 'granted' | 'denied'
    unreadCount: number
    channels: NotificationChannel[]
    preferences: UserNotificationPreferences | null
    
    // Functions
    sendTaskNotification: (taskId, title, assignedTo, options?) => Promise<boolean>
    sendGoalNotification: (goalId, title, progress, options?) => Promise<boolean>
    sendPenaltyNotification: (penaltyId, title, duration, options?) => Promise<boolean>
    sendSafeRoomNotification: (messageId, from, message, options?) => Promise<boolean>
    sendCalendarNotification: (eventId, title, timeRemaining, options?) => Promise<boolean>
    
    // Advanced
    sendBatchNotifications: (notifications) => Promise<boolean[]>
    scheduleNotification: (notification, scheduledFor) => Promise<boolean>
    cancelNotification: (notificationId) => Promise<boolean>
    
    // Preferences
    updateNotificationPreferences: (updates) => Promise<void>
    toggleChannel: (channelId, enabled) => Promise<void>
    
    // Analytics
    getNotificationStats: () => NotificationStats
    
    // Permission
    requestNotificationPermission: () => Promise<boolean>
  }
}
```

---

## 🎉 Conclusion

The Advanced Notifications System provides comprehensive push notification capabilities for FamilyDash, enabling rich user engagement and efficient family communication. With deep linking, smart timing, analytics, and extensive customization options, it creates a professional-grade notification experience that enhances the family collaboration features of the app.

For questions or contributions to this system, please refer to the main FamilyDash documentation or reach out to the development team.

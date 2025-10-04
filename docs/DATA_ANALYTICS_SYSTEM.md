# Data Analytics System 📊🔍

FamilyDash's comprehensive user behavior tracking and insights generation system.

## 🎯 Overview

The Data Analytics System provides detailed insights into user behavior, family collaboration patterns, productivity metrics, and actionable recommendations for improving family engagement.

## 🏗️ Architecture

### Core Features

```
src/
├── services/analytics/
│   ├── DataAnalyticsService.ts        # Main analytics service
│   └── index.ts                        # Exports
├── hooks/
│   └── useAnalytics.ts                 # React hooks for analytics
├── components/analytics/
│   └── AnalyticsDashboard.tsx          # Analytics visualization UI
└── docs/
    └── DATA_ANALYTICS_SYSTEM.md        # This documentation
```

### Analytics Capabilities

- **👤 User Behavior Tracking:** Navigation patterns, interaction events, session analysis
- **👨‍👩‍👧‍👦 Family Analytics:** Collaborative metrics, engagement distribution, productivity analysis
- **📈 Smart Insights:** AI-powered recommendations and behavioral pattern detection
- **📊 Visual Reports:** Comprehensive dashboards with charts, tables, and metrics
- **⚡ Real-time Metrics:** Live tracking and immediate feedback
- **🔄 Data Export:** JSON/CSV export for external analysis

## 🚀 Getting Started

### 1. Basic Setup

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const MyComponent = () => {
  const analytics = useAnalytics({
    enableAutomaticTracking: true,
    enableNavigationTracking: true,
    enableInteractionTracking: true,
    debugMode: false,
  });

  return (
    // Your component JSX
  );
};
```

### 2. Automatic Tracking

The analytics system automatically tracks:
- **Screen navigation** (time spent, transition patterns)
- **User interactions** (button clicks, form submissions)
- **Session management** (start/end times, duration)
- **Performance metrics** (load times, error rates)

### 3. Manual Event Tracking

```typescript
const { trackEvent, trackTaskExecution } = useAnalytics();

// Track custom events
await trackEvent('task_execution', 'task_completed', 'tasks', {
  taskId: 'task_123',
  completionTime: 45,
  priority: 'high',
});

// Track task-specific actions
await trackTaskExecution('task_456', 'complete');
```

## 📊 Analytics Data Types

### User Behavior Metrics

```typescript
interface UserBehaviorMetrics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  
  // Engagement metrics
  engagement: {
    totalTimeSpent: number;           // minutes
    sessionsCount: number;
    avgSessionDuration: number;
    screenTime: Record<string, number>;
    featureUsageTime: Record<string, number>;
  };
  
  // Productivity metrics
  productivity: {
    tasksCompleted: number;
    goalsProgressUpdated: number;
    penaltiesResolved: number;
    avgTaskCompletionTime: number;
    onTimeTaskRate: number;          // percentage
  };
  
  // Collaboration metrics
  collaboration: {
    sharedTasksParticipated: number;
    familyGoalsProgress: number;
    safeRoomEngagement: number;
    avgResponseTimeToFamilyActions: number;
  };
}
```

### Family Analytics

```typescript
interface FamilyAnalytics {
  familyId: string;
  period: 'weekly' | 'monthly' | 'quarterly';
  
  overall: {
    totalMembers: number;
    activeMembers: number;
    totalFamilyTimeSpent: number;
    peakUsageTimes: Array<{ hour: number; intensity: number }>;
  };
  
  productivity: {
    totalTasksCompleted: number;
    familyGoalCompletionRate: number;
    penaltyResolutionRate: number;
  };
  
  collaboration: {
    avgInteractionsPerDay: number;
    safeRoomActivity: number;
    sharedTaskParticipation: number;
  };
}
```

### Smart Insights

```typescript
interface AnalyticsInsight {
  id: string;
  type: 'performance' | 'behavioral' | 'productivity' | 'collaborative' | 'recommendation';
  title: string;
  description: string;
  confidence: number;                // 0-100
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations?: string[];
}
```

## 🔧 Analytics Hooks

### Core Analytics Hook

```typescript
const {
  // State
  isLoading,
  currentSession,
  hasPermission,
  
  // Basic tracking
  trackEvent,
  trackNavigation,
  trackInteraction,
  
  // Analytics generation
  generateUserMetrics,
  generateFamilyMetrics,
  generateInsights,
  generateReport,
  
  // Data management
  clearAllData,
  exportData,
} = useAnalytics(config);
```

### Specialized Hooks

#### Task Analytics

```typescript
const {
  trackTaskCreated,
  trackTaskCompleted,
  trackTaskUpdated,
  trackTaskAssigned,
} = useTaskAnalytics();

// Usage
await trackTaskCompleted('task_123');
await trackTaskAssigned('task_456', 'john_doe');
```

#### Goal Analytics

```typescript
const {
  trackGoalCreated,
  trackGoalMilestone,
  trackGoalCompleted,
  trackGoalAbandoned,
} = useGoalAnalytics();

// Usage
await trackGoalMilestone('goal_789', 'Week 3 Complete', 75);
await trackGoalCompleted('goal_101');
```

#### Penalty Analytics

```typescript
const {
  trackPenaltyGiven,
  trackPenaltyCompleted,
  trackPenaltyAppealed,
  trackPenaltyExpired,
} = usePenaltyAnalytics();

// Usage
await trackPenaltyGiven('penalty_222', 'red', 60);
await trackPenaltyCompleted('penalty_333');
```

#### SafeRoom Analytics

```typescript
const {
  trackMessageSent,
  trackMessageReceived,
  trackMessageReacted,
} = useSafeRoomAnalytics();

// Usage
await trackMessageSent('msg_444', 'voice');
await trackMessageReceived('msg_555', 'text');
await trackMessageReacted('msg_666', 'heart');
```

#### Navigation Analytics

```typescript
const {
  trackScreenEnter,
  trackScreenExit,
} = useNavigationAnalytics();

// Usage
trackScreenEnter('Tasks');
trackScreenExit('Goals');
```

## 📱 Analytics Dashboard Component

### Basic Usage

```typescript
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

const ReportsScreen = () => {
  return (
    <AnalyticsDashboard
      userId="current_user"
      familyId="family_123"
      reportType="individual" // 'individual' | 'family' | 'parental' | 'productivity'
      period="weekly"         // 'daily' | 'weekly' | 'monthly'
    />
  );
};
```

### Dashboard Features

#### 📋 Overview Tab
- **Executive Summary:** Key metrics and performance indicators
- **Navigation Patterns:** Most visited screens and user flows
- **Feature Usage:** Time spent in each app module
- **Family Engagement:** Collaborative activities and participation

#### 🎯 Productivity Tab
- **Task Completion Rates:** Individual and family productivity
- **Goal Progress:** Milestones achieved and progress tracking
- **Time Management:** Average completion times and efficiency
- **Penalty Resolution:** Compliance and improvement metrics

#### 📈 Engagement Tab
- **Session Analytics:** Duration, frequency, and patterns
- **Usage Distribution:** Screen time and feature adoption
- **Peak Activity Times:** When families are most active
- **Bounce Rate:** Short vs. meaningful interactions

#### 💡 Insights Tab
- **Smart Recommendations:** AI-generated improvement suggestions
- **Behavioral Patterns:** Usage habit analysis
- **Trend Analysis:** Week-over-week and month-over-month changes
- **Família Comparisons:** Comparative insights across family members

## 📊 Analytics Visualization

### Charts and Graphs

The dashboard includes various visualization types:

#### 1. Activity Charts
```typescript
// Daily activity over time
{
  type: 'line',
  title: 'Daily Activity Trends',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [12, 8, 15, 10, 14, 6, 9],
        color: '#6366f1',
      },
    ],
  },
}
```

#### 2. Distribution Charts
```typescript
// Feature usage distribution
{
  type: 'pie',
  title: 'Feature Usage Distribution',
  data: {
    labels: ['Tasks', 'Goals', 'Calendar', 'SafeRoom', 'Penalties'],
    values: [35, 25, 20, 15, 5],
    colors: ['#6366f1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  },
}
```

#### 3. Comparison Charts
```typescript
// Family member comparison
{
  type: 'bar',
  title: 'Family Member Productivity',
  data: {
    labels: ['Mom', 'Dad', 'John', 'Sarah'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [25, 18, 12, 8],
        color: '#6366f1',
      },
    ],
  },
}
```

## 🤖 Smart Insights System

### Automatic Insight Generation

The system automatically generates insights based on patterns:

#### 1. Productivity Insights

```typescript
// Low productivity detection
{
  type: 'productivity',
  category: 'Low Activity',
  title: 'Low Task Completion',
  description: "You've completed only 2 tasks this week. Consider setting smaller, achievable goals.",
  confidence: 85,
  impact: 'high',
  actionable: true,
  recommendations: [
    'Break down big tasks into smaller ones',
    'Set daily micro-goals',
    'Use the SafeRoom to share with family if you need help',
  ],
}
```

#### 2. Behavioral Insights

```typescript
// Navigation pattern recognition
{
  type: 'behavioral',
  category: 'Navigation Pattern',
  title: 'Frequent Visit to Tasks',
  description: 'You visit Tasks screen 15 times, showing strong affinity for task management.',
  confidence: 95,
  impact: 'medium',
  actionable: false,
}
```

#### 3. Collaborative Insights

```typescript
// Family communication analysis
{
  type: 'collaborative',
  category: 'Family Communication',
  title: 'Active Family Communication',
  description: 'Your family sent 8 SafeRoom messages this week. Strong communication!',
  confidence: 88,
  impact: 'medium',
  actionable: false,
}
```

### Insight Confidence Levels

- **90-100%:** Highly confident insights based on strong patterns
- **70-89%:** Confident insights based on observed trends
- **50-69%:** Moderate confidence requiring validation
- **Below 50%:** Observations requiring more data

## 🔄 Data Processing Pipeline

### Real-time Event Tracking

```typescript
// Event flow
User Action → Analytics Hook → DataAnalyticsService → Batch Queue → Storage → Analysis
```

#### 1. Event Capture
```typescript
User clicks "Complete Task" button
↓
trackInteraction('button_click', 'complete_task_button', 'tasks')
↓
DataAnalyticsService.trackEvent()
↓
Event stored in memory queue
```

#### 2. Batch Processing
```typescript
// Every 30 seconds
BatchQueue: [Event1, Event2, Event3, ...] 
↓
processBatchQueue()
↓
Save to AsyncStorage
↓
Generate real-time metrics
```

#### 3. Analytics Generation
```typescript
// On demand (dashboard load)
Request: generateUserMetrics(userId, 'weekly')
↓
Filter events for user and period
↓
Calculate aggregations
↓
Generate insights
↓
Return UserBehaviorMetrics
```

## 📱 Integration Examples

### Task Store Integration

```typescript
// In TaskStore.ts
import { useTaskAnalytics } from '../hooks/useAnalytics';

const useTaskStore = create((set, get) => ({
  tasks: [],
  
  addTask: async (task: Task) => {
    set(state => ({ tasks: [...state.tasks, task] }));
    
    // Track analytics
    const { trackTaskCreated } = useTaskAnalytics();
    await trackTaskCreated(task.id);
  },
  
  completeTask: async (taskId: string) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, completed: true } : t
      ),
    }));
    
    // Track completion
    const { trackTaskCompleted } = useTaskAnalytics();
    await trackTaskCompleted(taskId);
  },
}));
```

### Goal Store Integration

```typescript
// In GoalsStore.ts
import { useGoalAnalytics } from '../hooks/useAnalytics';

const useGoalsStore = create((set, get) => ({
  goals: [],
  
  updateGoalProgress: async (goalId: string, progress: number) => {
    set(state => ({
      goals: state.goals.map(g => 
        g.id === goalId ? { ...g, progress } : g
      ),
    }));
    
    // Track progress
    const { trackGoalMilestone } = useGoalAnalytics();
    await trackGoalMilestone(goalId, `Progress: ${progress}%`, progress);
  },
  
  completeGoal: async (goalId: string) => {
    set(state => ({
      goals: state.goals.map(g => 
        g.id === goalId ? { ...g, completed: true, progress: 100 } : g
      ),
    }));
    
    // Track completion
    const { trackGoalCompleted } = useGoalAnalytics();
    await trackGoalCompleted(goalId);
  },
}));
```

### Navigation Integration

```typescript
// In AppNavigator.tsx
import { useNavigationAnalytics } from '../hooks/useAnalytics';

const AppNavigator = () => {
  const navigationAnalytics = useNavigationAnalytics();
  
  const handleStateChange = (state) => {
    const currentRoute = state.routes[state.index];
    
    // Track screen changes
    navigationAnalytics.trackScreenEnter(currentRoute.name);
  };
  
  return (
    <NavigationContainer onStateChange={handleStateChange}>
      {/* Your navigators */}
    </NavigationContainer>
  );
};
```

## 📱 Performance Considerations

### Memory Management

```typescript
// Automatic cleanup every 30 days
const cleanupOldEvents = () => {
  const cutoffDate = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days
  
  allEvents.filter(event => event.timestamp > cutoffDate);
  analyticsCache.clear(); // Clear stale cache
};
```

### Batch Size Optimization

```typescript
// Optimal batch sizes for different environments
const batchConfig = {
  development: 10,    // Small batches for testing
  production: 50,     // Larger batches for efficiency
  maxBatchSize: 100,  // Never exceed this limit
};
```

### Data Compression

```typescript
// Compress large data sets before storage
const compressEvents = (events: UserEvent[]) => {
  return events.map(event => ({
    id: event.id,
    t: event.timestamp,           // Compressed key
    et: event.eventType,          // Compressed key
    en: event.eventName,          // Compressed key
    m: event.module,              // Compressed key
    p: event.properties,          // Compressed key
  }));
};
```

## 🔒 Privacy and Security

### Data Anonymization

```typescript
// Remove personally identifiable information
const anonymizeEvent = (event: UserEvent) => ({
  ...event,
  userId: hashUserId(event.userId), // Hash userId
  properties: removePII(event.properties), // Remove names, emails
});
```

### User Consent

```typescript
// Track user consent preferences
const consentConfig = {
  enableAnalytics: userConsent.analytics,
  enableTracking: userConsent.tracking,
  enableInsights: userConsent.insights,
  dataRetentionDays: userConsent.retention,
};
```

### Data Retention

```typescript
// Automatic data purging
const dataRetentionRules = {
  events: 90,           // Keep events for 90 days
  sessions: 30,         // Keep sessions for 30 days
  insights: 365,       // Keep insights for 1 year
  reports: 180,         // Keep reports for 6 months
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Events Not Tracking

```typescript
// Debug event tracking
const debugTracking = () => {
  console.log('Current session:', analyticsService.getCurrentSession());
  console.log('Batch queue size:', analyticsService.batchQueue.length);
  console.log('Latest events:', analyticsService.getAllEvents().slice(-5));
};
```

#### 2. Slow Analytics Generation

```typescript
// Optimize analytics generation
const generateOptimizedMetrics = async (userId: string) => {
  // Use cached data if available
  const cachedKey = `metrics_${userId}_${period}`;
  const cached = await AsyncStorage.getItem(cachedKey);
  
  if (cached && isValidCache(cached)) {
    return JSON.parse(cached);
  }
  
  // Generate new metrics
  const metrics = await analyticsService.generateUserBehaviorMetrics(userId, period);
  
  // Cache result
  await AsyncStorage.setItem(cachedKey, JSON.stringify(metrics));
  
  return metrics;
};
```

#### 3. High Memory Usage

```typescript
// Monitor memory usage
const monitorMemory = () => {
  const eventCount = analyticsService.getAllEvents().length;
  const sessionCount = analyticsService.getAllSessions().length;
  
  if (eventCount > 10000) {
    console.warn('High event count detected:', eventCount);
    analyticsService.clearOldEvents();
  }
  
  if (sessionCount > 1000) {
    console.warn('High session count detected:', sessionCount);
    analyticsService.clearOldSessions();
  }
};
```

### Debug Mode

```typescript
// Enable comprehensive debugging
const debugAnalytics = useAnalytics({
  debugMode: true,
  batchInterval: 5000,    // Faster batch processing
  enableDetailedLogging: true,
});

// View debug information
console.log('Analytics debug info:', {
  events: debugAnalytics.getAllEvents(),
  sessions: debugAnalytics.getAllSessions(),
  cache: debugAnalytics.getCache(),
});
```

## 📈 Future Enhancements

### Planned Features

1. **Machine Learning Models**
   - Predictive analytics for user behavior
   - Personalized recommendations
   - Anomaly detection

2. **Advanced Visualizations**
   - Real-time charts and graphs
   - Interactive timelines
   - Heat maps for activity patterns

3. **Export Capabilities**
   - PDF report generation
   - Excel export functionality
   - Integration with external analytics tools

4. **A/B Testing Framework**
   - Feature experiment tracking
   - Conversion rate analysis
   - Statistical significance testing

5. **Real-time Collaboration**
   - Live family dashboards
   - Shared analytics insights
   - Collaborative goal tracking

---

## 📝 API Reference

### DataAnalyticsService

```typescript
class DataAnalyticsService {
  // Event tracking
  trackEvent(eventType, eventName, module, properties?, context?): Promise<void>
  trackNavigation(fromScreen, toScreen, timeOnPreviousScreen?): Promise<void>
  trackInteraction(interactionType, element, module): Promise<void>
  
  // Analytics generation
  generateUserBehaviorMetrics(userId, period, startDate, endDate): Promise<UserBehaviorMetrics>
  generateFamilyAnalytics(familyId, period, startDate, endDate): Promise<FamilyAnalytics>
  generateInsights(userId?, familyId?): Promise<AnalyticsInsight[]>
  generateSmartReport(reportType, userId?, familyId?, period?): Promise<SmartReport>
  
  // Data management
  clearAllData(): Promise<void>
  exportAnalyticsData(userId, format): Promise<string>
}
```

### useAnalytics Hook

```typescript
const useAnalytics = (config?: AnalyticsConfig): UseAnalyticsReturn => {
  return {
    // State
    isLoading: boolean
    currentSession: UserSession | null
    hasPermission: boolean
    
    // Tracking methods
    trackEvent: (eventType, eventName, module, properties?) => Promise<void>
    trackNavigation: (fromScreen, toScreen, timeOnPreviousScreen?) => Promise<void>
    trackInteraction: (interactionType, element, module) => Promise<void>
    
    // Analytics generation
    generateUserMetrics: (userId, period, startDate?, endDate?) => Promise<UserBehaviorMetrics>
    generateFamilyMetrics: (familyId, period, startDate?, endDate?) => Promise<FamilyAnalytics>
    generateInsights: (userId?, familyId?) => Promise<AnalyticsInsight[]>
    generateReport: (reportType, userId?, familyId?, period?) => Promise<SmartReport>
    
    // Data management
    clearAllData: () => Promise<void>
    exportData: (userId, format?) => Promise<string>
  }
}
```

### AnalyticsDashboard Component

```typescript
interface AnalyticsDashboardProps {
  userId?: string;           // User ID for individual reports
  familyId?: string;         // Family ID for family reports
  reportType?: 'individual' | 'family' | 'parental' | 'productivity';
  period?: 'daily' | 'weekly' | 'monthly';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = (props) => {
  // Renders comprehensive analytics dashboard
}
```

---

## 🎉 Conclusion

The Data Analytics System provides comprehensive insights into user behavior, family collaboration patterns, and productivity metrics for FamilyDash. With automated tracking, smart insights generation, and detailed visualizations, it enables families to understand their usage patterns and improve their collaboration effectiveness.

The system is designed to be privacy-compliant, performance-optimized, and easily extensible for future analytical needs.

For questions or contributions to the analytics system, please refer to the main FamilyDash documentation or contact the development team.

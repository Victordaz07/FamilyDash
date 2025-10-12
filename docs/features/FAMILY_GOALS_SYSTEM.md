# 🎯 Family Goals System - Complete Documentation

## Overview

The Family Goals System is a comprehensive goal management platform that allows families to create, track, and achieve their goals together. Built with React Native, TypeScript, Firebase, and Zustand.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [Screens](#screens)
5. [Components](#components)
6. [State Management](#state-management)
7. [Firebase Integration](#firebase-integration)
8. [Notifications](#notifications)
9. [Usage Guide](#usage-guide)
10. [API Reference](#api-reference)

---

## ✨ Features

### Core Features

- ✅ **Create Goals** - Full-featured form with validation
- ✅ **Edit Goals** - Update existing goals
- ✅ **Delete Goals** - Remove goals with confirmation
- ✅ **Goal Categories** - 7 categories (Spiritual, Family, Personal, Health, Education, Financial, Relationship)
- ✅ **Goal Status** - Active, Paused, Completed, Cancelled
- ✅ **Visibility** - Family or Private goals
- ✅ **Deadlines** - Optional deadline with date picker

### Milestone System

- ✅ **Create Milestones** - Break down goals into steps
- ✅ **Toggle Milestones** - Mark as complete/incomplete
- ✅ **Edit Milestones** - Update milestone titles
- ✅ **Delete Milestones** - Remove milestones
- ✅ **Progress Tracking** - Real-time progress updates

### Reflection System

- ✅ **Add Reflections** - Share thoughts about goals
- ✅ **Mood Selection** - 4 moods (Happy, Grateful, Proud, Thoughtful)
- ✅ **Edit Reflections** - Update existing reflections
- ✅ **Delete Reflections** - Remove reflections

### Filtering & Sorting

- ✅ **Search** - Search by goal title/description
- ✅ **Filter by Category** - Filter by goal category
- ✅ **Filter by Status** - Filter by goal status
- ✅ **Sort Options** - Recent, Deadline, Progress, A-Z

### Activity Tracking

- ✅ **Activity Timeline** - Visual timeline of goal activities
- ✅ **Event Types** - Goal created, milestone added, reflection added, etc.
- ✅ **Timestamps** - Relative timestamps (2h ago, 3d ago)

### Notifications

- ✅ **Deadline Reminders** - 7 days, 3 days, 1 day, day of
- ✅ **Milestone Completed** - Immediate notification
- ✅ **Goal Completed** - Celebration notification
- ✅ **Overdue Goals** - Reminder notifications

---

## 🏗️ Architecture

```
src/
├── screens/goals/
│   ├── FamilyGoalsScreen.tsx        # Main goals list
│   ├── AddGoalScreen.tsx            # Create new goal
│   ├── EditGoalScreen.tsx           # Edit existing goal
│   ├── GoalDetailsScreen.tsx        # Goal details with tabs
│   └── GoalInfoScreen.tsx           # About/help screen
├── components/goals/
│   ├── GoalFilterBar.tsx            # Search & filters
│   ├── EnhancedGoalCard.tsx         # Goal card component
│   ├── GoalProgressBar.tsx          # Progress indicator
│   ├── GoalTabs.tsx                 # Tab navigation
│   ├── GoalOverviewTab.tsx          # Overview tab content
│   ├── GoalMilestonesTab.tsx        # Milestones tab content
│   ├── GoalActivityTab.tsx          # Activity tab content
│   └── GoalReflectionsTab.tsx       # Reflections tab content
├── store/
│   └── goalsSlice.ts                # Zustand store
├── hooks/
│   ├── useGoals.ts                  # Goals hook
│   └── useGoalsFirebase.ts          # Firebase sync hook
├── services/
│   ├── goalsService.ts              # Firebase CRUD operations
│   └── goalsNotifications.ts        # Notification service
├── types/
│   └── goals.ts                     # TypeScript interfaces
├── theme/
│   └── goalsColors.ts               # Color system
└── data/
    └── mockGoals.ts                 # Mock data for testing
```

---

## 📊 Data Model

### Goal Interface

```typescript
interface Goal {
  id: string;
  familyId: string;
  ownerId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
  deadlineAt?: number;
  milestonesCount: number;
  milestonesDone: number;
  coverUrl?: string;
  visibility: 'family' | 'private';
  reflectionCount?: number;
  lastActivityAt?: number;
}
```

### Milestone Interface

```typescript
interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueAt?: number;
  createdAt: number;
}
```

### Reflection Interface

```typescript
interface Reflection {
  id: string;
  familyId: string;
  goalId?: string;
  authorId: string;
  content: string;
  createdAt: number;
  mood?: 'happy' | 'grateful' | 'proud' | 'thoughtful';
}
```

### Types

```typescript
type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
type GoalCategory =
  | 'spiritual'
  | 'family'
  | 'personal'
  | 'health'
  | 'education'
  | 'financial'
  | 'relationship';
```

---

## 📱 Screens

### 1. FamilyGoalsScreen

**Main goals dashboard**

- Gradient header with stats
- Stats row (Total, Active, Completed, Overdue)
- Filter bar with search and filters
- Goals list with cards or list view
- Sticky CTA button for creating goals

### 2. AddGoalScreen

**Create new goal form**

- Title input (required)
- Description textarea (optional)
- Category selection (7 categories)
- Visibility toggle (Family/Private)
- Deadline toggle with date picker
- Initial milestones (add multiple)
- Validation and success feedback

### 3. EditGoalScreen

**Edit existing goal**

- Same fields as AddGoalScreen
- Additional status selection
- Progress info (read-only)
- Delete goal option
- Save/Cancel actions

### 4. GoalDetailsScreen

**Goal details with 4 tabs**

**Overview Tab:**

- Goal information (title, description, category)
- Status badges (active, overdue, etc.)
- Progress card with stats
- Timeline (created, updated, deadline)
- Quick actions (pause/resume, add reflection, add milestone)

**Milestones Tab:**

- Progress summary
- Add milestone form
- Milestones list with checkboxes
- Inline edit/delete actions

**Activity Tab:**

- Timeline visualization
- Activity types with icons
- Relative timestamps
- Mock data for now (Firebase integration ready)

**Reflections Tab:**

- Add reflection form with mood selection
- Reflections list with emojis
- Inline edit/delete actions
- Mood filtering

### 5. GoalInfoScreen

**About/help screen**

- Features overview
- Category explanation
- Getting started guide
- Tips and best practices

---

## 🧩 Components

### GoalFilterBar

**Search and filtering component**

- Props: `search`, `statusFilter`, `categoryFilter`, `sortBy`, `view`, handlers
- Features: Search input, category chips, status chips, sort options, view toggle

### EnhancedGoalCard

**Goal card for list view**

- Props: `goal`, `onPress`
- Features: Category color dot, progress bar, status badge, overdue indicator, visibility icon

### GoalProgressBar

**Progress indicator component**

- Props: `completed`, `total`, `color`, `showPercentage`
- Features: Animated progress bar, percentage display

### GoalTabs

**Tab navigation component**

- Props: `activeTab`, `onTabChange`
- Features: 4 tabs with icons, active state indicator

### Tab Components

- **GoalOverviewTab** - Overview content
- **GoalMilestonesTab** - Milestones CRUD
- **GoalActivityTab** - Activity timeline
- **GoalReflectionsTab** - Reflections CRUD

---

## 🔄 State Management

### Zustand Store

```typescript
interface GoalsState {
  // Data
  items: Goal[];
  loading: boolean;
  error: string | null;

  // Filters
  search: string;
  statusFilter: GoalStatus | 'all';
  categoryFilter: GoalCategory | 'all';
  sortBy: 'recent' | 'deadline' | 'progress' | 'alpha';
  view: 'list' | 'cards';

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Filters
  setSearch: (search: string) => void;
  setStatusFilter: (status: GoalStatus | 'all') => void;
  setCategoryFilter: (category: GoalCategory | 'all') => void;
  setSortBy: (sortBy: ...) => void;
  toggleView: () => void;
  clearFilters: () => void;

  // Selectors
  getFilteredGoals: () => Goal[];
  getStats: () => GoalStats;
  getOverdueGoals: () => Goal[];
  getGoalsByCategory: () => Record<GoalCategory, Goal[]>;
}
```

### useGoals Hook

```typescript
const {
  goals, // All goals
  loading, // Loading state
  error, // Error message
  search, // Search term
  statusFilter, // Status filter
  categoryFilter, // Category filter
  sortBy, // Sort option
  view, // View mode

  // Actions
  setGoals,
  addGoal,
  updateGoal,
  deleteGoal,

  // Filter actions
  setSearch,
  setStatusFilter,
  setCategoryFilter,
  setSortBy,
  toggleView,
  clearFilters,

  // Computed
  filteredGoals, // Filtered & sorted goals
  stats, // Stats summary
  overdueGoals, // Overdue goals
  goalsByCategory, // Goals grouped by category

  // Helpers
  quickFilter, // Quick filter shortcut
} = useGoals();
```

---

## 🔥 Firebase Integration

### Collections Structure

```
goals/
  {goalId}/
    - Goal document
    milestones/
      {milestoneId}/ - Milestone document

reflections/
  {reflectionId}/ - Reflection document
```

### Services

#### goalsService.ts

**Goals CRUD:**

- `createGoal(goalData)` - Create new goal
- `getGoal(goalId)` - Get single goal
- `getFamilyGoals(familyId)` - Get all family goals
- `subscribeFamilyGoals(familyId, onUpdate, onError)` - Real-time subscription
- `updateGoal(goalId, updates)` - Update goal
- `deleteGoal(goalId)` - Delete goal

**Milestones CRUD:**

- `createMilestone(goalId, data)` - Create milestone
- `getGoalMilestones(goalId)` - Get all milestones
- `subscribeGoalMilestones(goalId, onUpdate, onError)` - Real-time subscription
- `updateMilestone(goalId, milestoneId, updates)` - Update milestone
- `deleteMilestone(goalId, milestoneId)` - Delete milestone

**Reflections CRUD:**

- `createReflection(data)` - Create reflection
- `getGoalReflections(goalId)` - Get goal reflections
- `subscribeGoalReflections(goalId, onUpdate, onError)` - Real-time subscription
- `updateReflection(reflectionId, updates)` - Update reflection
- `deleteReflection(reflectionId)` - Delete reflection

### Firebase Hooks

#### useGoalsFirebase()

Syncs goals with Firebase in real-time

```typescript
const { initialized } = useGoalsFirebase();
```

#### useGoalMilestonesFirebase(goalId)

Syncs milestones for a specific goal

```typescript
const { milestones, loading, error } = useGoalMilestonesFirebase(goalId);
```

#### useGoalReflectionsFirebase(goalId)

Syncs reflections for a specific goal

```typescript
const { reflections, loading, error } = useGoalReflectionsFirebase(goalId);
```

---

## 🔔 Notifications

### goalsNotifications.ts

**Functions:**

- `requestNotificationPermissions()` - Request permissions
- `scheduleGoalDeadlineNotifications(goal)` - Schedule deadline reminders
- `cancelGoalNotifications(notificationIds)` - Cancel notifications
- `sendMilestoneCompletedNotification(goal, milestoneTitle)` - Milestone completed
- `sendGoalCompletedNotification(goal)` - Goal completed
- `sendOverdueGoalNotification(goal)` - Overdue reminder
- `checkOverdueGoals(goals)` - Check and notify overdue goals
- `addNotificationResponseListener(callback)` - Handle notification taps

**Notification Schedule:**

- 7 days before deadline
- 3 days before deadline
- 1 day before deadline
- Day of deadline

All notifications scheduled at 9:00 AM.

---

## 📖 Usage Guide

### Creating a Goal

1. Navigate to Goals tab
2. Tap "Create New Family Goal"
3. Fill in the form:
   - Enter goal title (required)
   - Add description (optional)
   - Select category
   - Choose visibility (Family/Private)
   - Toggle deadline if needed
   - Add initial milestones (optional)
4. Tap "Create Goal"

### Managing Milestones

1. Open goal details
2. Navigate to "Milestones" tab
3. Add new milestones with the form
4. Toggle checkboxes to mark complete
5. Edit inline by tapping edit icon
6. Delete with trash icon (confirmation required)

### Adding Reflections

1. Open goal details
2. Navigate to "Reflections" tab
3. Write your thoughts in the text area
4. Select a mood (optional)
5. Tap "Add Reflection"

### Filtering Goals

1. Use search bar to find goals by title/description
2. Tap category chips to filter by category
3. Tap status chips to filter by status
4. Use sort options to change order
5. Toggle between cards/list view

### Editing a Goal

1. Open goal details
2. Tap edit icon (✏️) in header
3. Modify fields as needed
4. Tap "Save Changes"

### Deleting a Goal

1. Open goal details
2. Tap edit icon
3. Tap trash icon (🗑️) in header
4. Confirm deletion

---

## 🔧 API Reference

### useGoals Hook

```typescript
// Get all goals data and actions
const {
  goals,
  filteredGoals,
  stats,
  addGoal,
  updateGoal,
  deleteGoal,
  setSearch,
  setStatusFilter,
  setCategoryFilter,
} = useGoals();
```

### Firebase Services

```typescript
// Create a goal
const goalId = await createGoal({
  familyId: 'family-1',
  ownerId: 'user-1',
  title: 'Learn Spanish',
  category: 'education',
  status: 'active',
  visibility: 'family',
  milestonesCount: 0,
  milestonesDone: 0,
});

// Subscribe to goals
const unsubscribe = subscribeFamilyGoals(
  'family-1',
  (goals) => console.log('Updated goals:', goals),
  (error) => console.error('Error:', error)
);

// Clean up subscription
unsubscribe();
```

### Notifications

```typescript
// Schedule notifications for a goal
const notificationIds = await scheduleGoalDeadlineNotifications(goal);

// Cancel notifications
await cancelGoalNotifications(notificationIds);

// Send immediate notification
await sendMilestoneCompletedNotification(goal, 'First milestone');
```

---

## 🎨 Theme & Colors

### Category Colors

```typescript
spiritual: '#81C784'; // Green
family: '#F48FB1'; // Pink
personal: '#FFDF54'; // Yellow
health: '#4FC3F7'; // Blue
education: '#9575CD'; // Purple
financial: '#FFB74D'; // Orange
relationship: '#F06292'; // Deep Pink
```

### Status Colors

```typescript
active: '#10B981'; // Green
completed: '#059669'; // Dark Green
paused: '#F59E0B'; // Orange
cancelled: '#EF4444'; // Red
```

---

## 🚀 Future Enhancements

- [ ] Goal templates
- [ ] Goal sharing between families
- [ ] Achievement badges
- [ ] Progress charts and analytics
- [ ] Goal reminders (custom frequency)
- [ ] Photo attachments for goals
- [ ] Voice memos for reflections
- [ ] Goal history and archives
- [ ] Export goals to PDF
- [ ] Integration with calendar
- [ ] Family goal leaderboard
- [ ] Goal completion celebrations (animations)
- [ ] Collaborative goal editing
- [ ] Goal comments/discussions
- [ ] Tags system for goals

---

## 📝 Notes

- All timestamps are stored as Unix timestamps (milliseconds)
- Firebase uses server timestamps for consistency
- Real-time updates are automatic with Firestore subscriptions
- Mock data is available for offline testing
- Notifications require device permissions
- Goals are family-scoped for privacy
- Private goals are only visible to the owner

---

## 🐛 Troubleshooting

**Goals not loading:**

- Check Firebase connection
- Verify familyId is set
- Check Firestore rules

**Notifications not working:**

- Verify permissions granted
- Check device notification settings
- Ensure deadline is in the future

**Progress not updating:**

- Check milestone count is correct
- Verify updateGoal is being called
- Check for state sync issues

---

## 📞 Support

For issues or questions about the Goals system, refer to:

- Firebase console for data
- Zustand devtools for state
- React Native Debugger for errors

---

**Built with ❤️ for FamilyDash**

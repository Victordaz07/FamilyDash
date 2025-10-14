# Tasks Feature Documentation

## Overview

The Tasks feature provides a simple CRUD interface for managing family tasks using a unified Zustand store with AsyncStorage persistence.

## Architecture Decisions

### State Management

- **Zustand Store**: Single source of truth for all application state
- **AsyncStorage**: Persistent storage for offline functionality
- **React Context**: Only used for theme/i18n/Auth provider (no business logic)

### Data Structure

```typescript
type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};
```

### Store Actions

- `add(task)`: Creates a new task with auto-generated ID
- `toggle(id)`: Toggles task completion status
- `remove(id)`: Deletes a task permanently

## Implementation Details

### CRUD Operations

1. **Create**: Add new tasks via input field
2. **Read**: Display tasks in FlatList with empty state
3. **Update**: Toggle completion status
4. **Delete**: Remove tasks with confirmation dialog

### UI Components

- `TasksScreen`: Main screen with task list and input
- Empty state with helpful messaging
- Confirmation dialogs for destructive actions
- Integration with dashboard quick actions

### Navigation Integration

- Accessible via "Add Task" quick action in HomeScreen
- Integrated into TasksStack navigator
- Back navigation to dashboard

## Testing

### Test Coverage

- **Store Tests**: CRUD operations with Zustand
- **Toggle Tests**: Task completion state changes
- **Mock Setup**: AsyncStorage and crypto mocks

### Test Files

- `tests/store.test.ts`: Basic store functionality
- `tests/tasks.toggle.test.ts`: Task toggle behavior

## Firestore Synchronization

### ✅ **IMPLEMENTED**

The Tasks feature now includes **real-time synchronization** with Firestore.

#### Data Model

- **Collection Path**: `users/{uid}/tasks/{taskId}`
- **Document Structure**:
  ```typescript
  {
    title: string;
    done: boolean;
    createdAt: number;
    updatedAt: serverTimestamp;
  }
  ```

#### Sync Flow

1. **Pull Initial**: On authentication, fetch all existing tasks from Firestore
2. **Live Updates**: Listen to real-time changes via `onSnapshot`
3. **Push Changes**: Automatically sync local changes (add/toggle/remove) to Firestore
4. **Conflict Resolution**: Last-write-wins with server timestamps

#### Security Rules

Add these rules to your `firestore.rules` file:

```javascript
// rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

**Explanation**:
- Users can only read/write their own tasks
- Authentication required for all operations
- No cross-user access

#### Implementation Details

- **Service**: `src/services/tasksSync.ts`
- **Store Integration**: `src/store/index.ts` (push helpers)
- **Bootstrap**: `App.tsx` (starts sync on app mount)
- **Strategy**: Non-blocking push (using `void` to avoid UI blocking)

## Future Extensions

### Enhanced Features

- Task categories and priorities
- Due dates and reminders
- Task assignments to family members
- Progress tracking and analytics

## Definition of Done

✅ **Completed**

- [x] 0 functional duplicates (all backups in \_graveyard)
- [x] 100% internal imports use "@/..." alias
- [x] Zustand as single source of business state
- [x] Project starts in Expo without fatal errors
- [x] ≥3 green tests (store + 2 task tests)
- [x] Tasks visible from Dashboard with CRUD local
- [x] Documentation created

## Rules and Constraints

### Firestore Rules (Documentation Only)

```javascript
// rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Environment Variables

- All Firebase config uses `EXPO_PUBLIC_*` prefix
- No secrets in client-side code
- Environment variables documented in `.env.example`

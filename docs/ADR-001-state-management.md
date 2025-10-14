# ADR-001: State Management and Tasks Definition of Done

## Status

Accepted

## Context

FamilyDash needed a complete architectural overhaul to address stability issues, infinite loops, and inconsistent state management. The project had multiple stores, relative imports, and complex middleware causing performance problems.

## Decision

We implemented a unified architecture with the following principles:

### 1. Single Store Pattern

- **Zustand** as the only business state management solution
- **React Context** limited to theme/i18n/Auth provider only
- **AsyncStorage** for persistence
- No complex middleware to prevent infinite loops

### 2. Absolute Imports

- All internal imports use `@/*` alias
- No relative imports (`../`) in business logic
- Centralized configuration in `tsconfig.json` and `babel.config.js`

### 3. Environment Configuration

- Firebase config moved to `EXPO_PUBLIC_*` environment variables
- No hardcoded secrets in client code
- `.env.example` for documentation

### 4. Testing Strategy

- Jest + React Native Testing Library
- AsyncStorage mocking for tests
- Minimum 3 smoke tests for core functionality

### 5. Feature Focus: Tasks

- Simple CRUD interface as proof of concept
- Real-time Firestore sync (pull, live, push)
- Dashboard integration via quick actions

### 6. Achievements System

- Achievement definitions with triggers and thresholds
- Points and progress tracking
- Streak calculation for consecutive days
- Real-time Firestore sync for achievements and stats
- Gamification to encourage task completion

## Consequences

### Positive

- ✅ Eliminated infinite re-render loops
- ✅ Simplified state management
- ✅ Improved developer experience with absolute imports
- ✅ Better testability and maintainability
- ✅ Clear separation of concerns

### Negative

- ⚠️ Migration required for existing components
- ⚠️ Some complex features temporarily moved to \_graveyard
- ⚠️ Learning curve for new architecture

## Implementation Details

### Store Structure

```typescript
type AppState = AuthState & TasksState;

interface AuthState {
  user: { uid: string; email?: string } | null;
  setUser: (u: AuthState['user']) => void;
  logout: () => void;
}

interface TasksState {
  items: Record<string, Task>;
  add: (t: Omit<Task, 'id' | 'createdAt'>) => string;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

interface AchievementsState {
  achievements: Record<string, { unlocked: boolean; unlockedAt?: number; progress?: number }>;
  points: number;
  stats: { totalCompleted, dayCompleted, streak, lastActiveDay, weekWindow };
  checkAndAward: (event) => void;
  unlock: (achId: string) => void;
  addPoints: (n: number) => void;
  bumpDayCounters: (opts) => void;
}
```

### File Organization

```
src/
  store/              # Single Zustand store
  screens/           # Screen components
  components/        # Reusable components
  services/          # Firebase and external services
  hooks/             # Custom hooks
  utils/             # Utility functions
  styles/            # Styling
_graveyard/          # Moved duplicates/backups
```

## Definition of Done

### Technical Requirements

- [x] 0 functional duplicates (all backups in \_graveyard)
- [x] 100% internal imports use "@/..." alias
- [x] Zustand as single source of business state
- [x] Project starts in Expo without fatal errors
- [x] ≥3 green tests (store + 2 task tests)
- [x] Tasks visible from Dashboard with CRUD local
- [x] Documentation created

### Quality Gates

- [x] No infinite loops in state management
- [x] No hardcoded secrets in client code
- [x] All imports resolve correctly
- [x] Tests pass consistently
- [x] App starts without crashes

## Future Considerations

### Phase 2: Firestore Integration

- Real-time sync for tasks
- Conflict resolution
- Offline-first architecture

### Phase 3: Advanced Features

- Task categories and priorities
- Family member assignments
- Progress analytics
- Push notifications

## References

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

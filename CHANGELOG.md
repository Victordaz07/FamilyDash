# Changelog - FamilyDash Refactor

## [Unreleased] - 2025-10-14

### 🎉 Major Refactor - Complete Architecture Overhaul

#### ✨ Added

- **Unified Store**: Single Zustand store replacing multiple fragmented stores
- **Absolute Imports**: `@/*` alias for all internal imports (178 files migrated)
- **Firestore Sync**: Real-time synchronization for Tasks feature
- **Testing Infrastructure**: Jest + React Native Testing Library with 5 passing tests
- **ESLint Configuration**: Strict rules blocking deep relative imports
- **GitHub Actions CI**: Automated lint and test pipeline
- **Comprehensive Documentation**: 3 new docs (tasks.md, ADR-001, sync guide)

#### 🔧 Changed

- **Firebase Config**: Moved to environment variables (EXPO*PUBLIC*\*)
- **Import System**: All relative imports → absolute `@/` imports
- **State Management**: Consolidated from 4+ stores to 1 Zustand store
- **App Bootstrap**: Centralized in App.tsx with sync initialization

#### 🗑️ Removed

- **Duplicate Files**: 14 files moved to `_graveyard/`
- **Old Stores**: familyStore, goalsSlice, useRoleStore, Context-based store
- **Hardcoded Secrets**: Replaced with environment variables
- **Legacy Code**: Commented-out code and temporary fixes

#### 🐛 Fixed

- **Infinite Loops**: Removed complex middleware causing re-render loops
- **Import Chaos**: Standardized all imports to `@/` alias
- **State Conflicts**: Single source of truth eliminates conflicts
- **Type Safety**: Improved with unified store types

---

## Technical Details

### Store Structure

```typescript
type AppState = {
  // Auth
  user: { uid: string; email?: string } | null;
  setUser: (u) => void;
  logout: () => void;

  // Tasks
  items: Record<string, Task>;
  add: (t) => string;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};
```

### Migration Stats

- **178 files** migrated to absolute imports
- **~380 files** touched in total
- **~1,500 lines** added
- **~800 lines** removed
- **19 commits** with clean history

### Test Coverage

```
PASS tests/store.test.ts          (1 test)
PASS tests/tasks.toggle.test.ts   (1 test)
PASS tests/tasks.push.test.ts     (3 tests)
─────────────────────────────────────────
Total: 5 tests passing
```

---

## Breaking Changes

### Store Import Change

```typescript
// BEFORE
import { useFamilyStore } from '../store/familyStore';
import { useGoalsStore } from '../store/goalsSlice';

// AFTER
import { useAppStore } from '@/store';
```

### Import Path Change

```typescript
// BEFORE
import { theme } from '../../../styles/simpleTheme';

// AFTER
import { theme } from '@/styles/simpleTheme';
```

---

## Migration Guide

### For Existing Components

1. **Update imports**:

   ```bash
   # Automatic migration
   node scripts/migrate-all-imports.js
   ```

2. **Update store usage**:

   ```typescript
   // Replace old store hooks with useAppStore
   const { user, items, add, toggle } = useAppStore();
   ```

3. **Run lint**:
   ```bash
   npm run lint:fix
   ```

### For New Development

- ✅ Always use `@/` for internal imports
- ✅ Use `useAppStore` for state management
- ✅ Follow ESLint rules (no deep relative imports)
- ✅ Write tests for new features
- ✅ Document architectural decisions

---

## References

- **ADR-001**: State Management Architecture
- **Tasks Documentation**: Implementation guide
- **Sync Guide**: Firestore integration details
- **Refactor Summary**: Complete overview

---

**Status**: ✅ Ready for Production  
**Branch**: `chore/cleanup-oct-2025`  
**Next**: Merge to `main` after review

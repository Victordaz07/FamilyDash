# 🏆 Achievements & Medals System

## Overview

The Achievements system motivates family members through gamification - rewarding task completion, consistency, and engagement with points and unlockable achievements.

---

## Architecture

### **Data Model**

#### Achievements Collection

**Path**: `users/{uid}/achievements/{achId}`

```typescript
{
  unlocked: boolean;
  unlockedAt: Timestamp;
  progress: number;
}
```

#### Stats Document

**Path**: `users/{uid}/stats`

```typescript
{
  points: number;
  totalCompleted: number;      // All-time task count
  dayKey: string;               // Current day (YYYY-MM-DD)
  dayCompleted: number;         // Tasks completed today
  streak: number;               // Consecutive days
  lastActiveDay: string;        // Last day with activity
  weekWindow: DayEntry[];       // Rolling 7-day window
  updatedAt: Timestamp;
}
```

---

## Achievements Catalog

### **Getting Started** 🎯

| ID           | Title            | Description              | Points | Trigger     | Threshold |
| ------------ | ---------------- | ------------------------ | ------ | ----------- | --------- |
| `first_task` | First Steps      | Complete your first task | 10     | tasks_total | 1         |
| `five_tasks` | Task Master      | Complete 5 tasks         | 25     | tasks_total | 5         |
| `ten_tasks`  | Dedicated Worker | Complete 10 tasks        | 50     | tasks_total | 10        |

### **Consistency** 🔥

| ID         | Title          | Description                    | Points | Trigger     | Threshold |
| ---------- | -------------- | ------------------------------ | ------ | ----------- | --------- |
| `daily_1`  | Daily Achiever | Complete at least 1 task today | 10     | tasks_daily | 1         |
| `streak_3` | On Fire!       | 3 day streak                   | 30     | streak_days | 3         |
| `streak_7` | Unstoppable    | 7 day streak                   | 100    | streak_days | 7         |

### **Helper** 🤝

| ID            | Title        | Description                      | Points | Trigger     | Threshold |
| ------------- | ------------ | -------------------------------- | ------ | ----------- | --------- |
| `day_5_tasks` | Super Helper | Complete 5 tasks in a single day | 40     | tasks_daily | 5         |

### **Habit Builder** 📈

| ID              | Title              | Description                          | Points | Trigger      | Threshold |
| --------------- | ------------------ | ------------------------------------ | ------ | ------------ | --------- |
| `week_20_tasks` | Productivity Beast | Complete 20 tasks in the last 7 days | 80     | tasks_weekly | 20        |

---

## Trigger System

### **Event Types**

1. **`task_created`**: Fired when a new task is added (future use)
2. **`task_completed`**: Fired when task.done becomes true
3. **`login_day`**: Fired once per day on app launch

### **Trigger Flow**

```
Task Completed
     │
     ▼
checkAndAward()
     │
     ├─► bumpDayCounters({ completedDelta: 1 })
     │   ├─ Increment totalCompleted
     │   ├─ Update dayCompleted
     │   ├─ Calculate streak
     │   └─ Update weekWindow
     │
     └─► Evaluate all achievements
         ├─ tasks_total >= threshold?
         ├─ tasks_daily >= threshold?
         ├─ streak_days >= threshold?
         └─ tasks_weekly >= threshold?
              │
              ▼
         unlock(achId) + addPoints(pts)
              │
              ▼
         pushUnlock() + pushStats()
```

---

## Streak Logic

### **Consecutive Days Calculation**

- **New Day**: If `dayKey` changes from previous:
  - Reset `dayCompleted` to current delta
  - Check if `lastActiveDay + 1 day == today`:
    - **Yes**: `streak++`
    - **No**: `streak = 1` (if activity) or `streak = 0`

- **Same Day**: Increment `dayCompleted`

### **Week Window** (Rolling 7 Days)

Maintains array of `{ dayKey, completed }` for last 7 days:

- Add new day on day change
- Update current day if same day
- Slice to keep only last 7 entries

**Used for**: `week_20_tasks` achievement (sum weekWindow.completed >= 20)

---

## Idempotency

### **Achievement Unlock**

```typescript
unlock(achId) {
  if (achievements[achId]?.unlocked) return; // ✅ Already unlocked
  // ... proceed with unlock logic
}
```

**Guarantees**: Each achievement awards points exactly once.

---

## Sync Strategy

### **Pull Initial** (on auth)

- Load `users/{uid}/stats` → merge with local
- Load `users/{uid}/achievements/*` → merge with local

### **Live Updates** (onSnapshot)

- Listen to stats document changes
- Update local state on remote changes

### **Push Changes** (throttled)

- `pushUnlock(achId)`: Immediate on unlock
- `pushStats()`: Throttled (3 seconds) to avoid spam

---

## Firestore Security Rules

Add to `firestore.rules`:

```javascript
// rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Achievements
    match /users/{uid}/achievements/{achId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Stats
    match /users/{uid}/stats {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## UI Components

### **AchievementsScreen**

- Category tabs (All, Getting Started, Consistency, Helper, Habits)
- Stats cards (Unlocked, Points, Streak, Tasks Done)
- Achievement grid with progress bars
- Detail modal on tap

### **AchievementCard**

- **Unlocked**: Green gradient + checkmark badge
- **Locked**: Gray + opacity 0.7 + progress bar
- Progress indicator: `{progress}/{threshold}`
- Points display with star icon

---

## Testing

### **Test Coverage** (9 tests total)

1. **store.test.ts**: Basic CRUD
2. **tasks.toggle.test.ts**: Toggle functionality
3. **tasks.push.test.ts**: Push helpers (3 tests)
4. **achievements.unlock.test.ts**: Unlock logic (4 tests)
   - first_task unlock
   - five_tasks unlock
   - Idempotency
   - day_5_tasks unlock

### **Test Results**

```bash
PASS tests/store.test.ts
PASS tests/tasks.toggle.test.ts
PASS tests/tasks.push.test.ts
PASS tests/achievements.unlock.test.ts

Test Suites: 4 passed, 4 total
Tests:       9 passed, 9 total
```

---

## Future Enhancements

### **Phase 2: Advanced Achievements**

- Hidden/secret achievements
- Time-based achievements (e.g., "Complete task before 9 AM")
- Quality achievements (task with photos, videos)
- Family achievements (cooperative goals)

### **Phase 3: Social Features**

- Leaderboard
- Achievement sharing
- Badges/medals system
- Custom achievements by parents

### **Phase 4: Rewards**

- Points → rewards redemption
- Achievement milestones unlock features
- Gamification levels (Bronze → Silver → Gold)

---

## Configuration

### **Add New Achievement**

1. Add to `src/features/achievements/definitions.ts`:

```typescript
my_achievement: {
  id: 'my_achievement',
  category: 'getting_started',
  title: 'My Achievement',
  description: 'Do something cool',
  icon: 'rocket',
  points: 15,
  trigger: 'tasks_total',
  threshold: 3,
}
```

2. Achievement unlocks automatically when threshold is met!

---

## Troubleshooting

### **Achievement not unlocking?**

- Check `stats` values in store
- Verify `checkAndAward()` is called after task completion
- Inspect console for `🏆 Achievement unlocked` logs

### **Points not syncing?**

- Verify `.env` has Firebase credentials
- Check Firebase Console → Firestore → `users/{uid}/stats`
- Look for `pushStats` errors in console

### **Streak reset unexpectedly?**

- Streak requires activity every consecutive day
- Missing a day resets to 0
- `lastActiveDay` tracks the last activity date

---

**Status**: ✅ Fully Implemented  
**Tests**: 9/9 Passing  
**Sync**: Real-time with Firestore

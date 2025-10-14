# Firestore Security Rules - FamilyDash

## Complete Rules Configuration

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==================
    // TASKS
    // ==================
    match /users/{uid}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // ==================
    // ACHIEVEMENTS
    // ==================
    match /users/{uid}/achievements/{achId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /users/{uid}/stats {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // ==================
    // NOTIFICATIONS
    // ==================
    match /users/{uid}/notifications/{notifId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /users/{uid}/settings/notifications {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /users/{uid}/pushTokens/{token} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Deploy Rules

```bash
firebase deploy --only firestore:rules
```

## Rule Explanation

### User Isolation
All collections are scoped to `users/{uid}`, ensuring:
- Users can only access their own data
- No cross-user data leakage
- Authentication required for all operations

### Collections

| Collection | Purpose | Access |
|------------|---------|--------|
| `tasks` | User tasks | Owner only |
| `achievements` | Unlocked achievements | Owner only |
| `stats` | Points, streaks, progress | Owner only |
| `notifications` | In-app notifications | Owner only |
| `settings/notifications` | Notification preferences | Owner only |
| `pushTokens` | Expo push tokens | Owner only |

## Testing Rules

Use Firebase Emulator for local testing:

```bash
firebase emulators:start
```

Then in your code:
```typescript
if (__DEV__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

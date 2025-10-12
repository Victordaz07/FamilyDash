# Firestore Index Instructions for Notification Settings

## Required Index

The notification settings use a simple document-based approach, so no composite index is required.

### Collection Structure

**Collection ID**: `notification_settings`

**Document ID Format**: `{familyId}_{userId}` (e.g., `default_family_user123`)

### Document Structure

```typescript
{
  id: string;
  familyId: string;
  userId: string;
  enableAll: boolean;
  sound: boolean;
  vibration: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
  };
  dayFilters: {
    enabled: boolean;
    allowedWeekdays: number[]; // 0-6 (Sunday-Saturday)
  };
  channels: {
    family_schedules?: {
      enabled: boolean;
      sound?: boolean;
      vibration?: boolean;
    };
    upcoming_reminders?: {
      enabled: boolean;
      sound?: boolean;
      vibration?: boolean;
    };
  };
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Security Rules (Optional)

If you want to add Firestore security rules:

```javascript
// Firestore Security Rules
match /notification_settings/{documentId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId
    && request.auth.uid == request.resource.data.userId;
}
```

### Usage

The notification settings are automatically created with defaults when first accessed via `getNotificationSettings()`. No manual setup required.

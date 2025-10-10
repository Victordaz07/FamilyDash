# Firestore Schema - FamilyDash+

## Overview

This document describes the Firestore database schema for FamilyDash, including the new collections added for FamilyDash+ features.

## Collections

### Core Family Collections

#### `families/{familyId}`

Family information and subscription plan.

```typescript
{
  id: string;
  name: string;
  plan: "free" | "plus"; // NEW: FamilyDash+ plan
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    timezone: string;
    language: string;
    notifications: boolean;
  }
}
```

#### `family_members/{familyId}/users/{userId}`

Family member information with enhanced consent tracking.

```typescript
{
  id: string;
  familyId: string;
  role: "parent" | "child";
  email: string;
  displayName: string;
  avatar?: string;
  consent: {  // NEW: Feature consent tracking
    ping: boolean;
    sos: boolean;
    location: boolean;
    updatedAt: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### FamilyDash+ Collections

#### `feature_flags/{familyId}`

Feature availability flags based on family plan.

```typescript
{
  id: string;
  familyId: string;
  emergencyPing: boolean;
  liveAudioSOS: boolean;
  locationSharing: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `emergency_logs/{logId}`

Logs of emergency ping usage for audit and rate limiting.

```typescript
{
  id: string;
  familyId: string;
  fromUid: string;
  toUid: string;
  type: "ping";
  status: "delivered" | "failed" | "declined";
  message?: string;
  createdAt: Timestamp;
  metadata: {
    deviceInfo: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}
```

#### `calls/{callId}`

Live Audio SOS call data and WebRTC signaling.

```typescript
{
  id: string;
  familyId: string;
  fromUid: string;
  toUid: string;
  status: "requested" | "accepted" | "rejected" | "ended" | "timeout";
  offer?: string;  // WebRTC offer
  answer?: string; // WebRTC answer
  candidates?: string[]; // WebRTC ICE candidates
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  duration?: number; // in seconds
  createdAt: Timestamp;
}
```

#### `locations/{userId}`

Current location data for location sharing feature.

```typescript
{
  id: string;
  userId: string;
  familyId: string;
  lat: number;
  lng: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  battery?: number;
  isSharing: boolean;
  lastUpdated: Timestamp;
  createdAt: Timestamp;
}
```

#### `location_history/{userId}/{historyDoc}`

Historical location data (retained for 24-72 hours).

```typescript
{
  id: string;
  userId: string;
  familyId: string;
  lat: number;
  lng: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  battery?: number;
  timestamp: Timestamp;
  // Auto-deleted after TTL (24-72h)
}
```

#### `notification_settings/{familyId}`

Family notification preferences and quiet hours.

```typescript
{
  id: string;
  familyId: string;
  enableAll: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "07:00"
    timezone: string;
  };
  allowedDays: string[]; // ["monday", "tuesday", ...]
  channels: {
    emergency: boolean;
    schedules: boolean;
    reminders: boolean;
    location: boolean;
  };
  updatedAt: Timestamp;
}
```

#### `user_consent/{userId}`

Individual user consent tracking for privacy compliance.

```typescript
{
  id: string;
  userId: string;
  familyId: string;
  features: {
    ping: {
      consented: boolean;
      consentedAt?: Timestamp;
      revokedAt?: Timestamp;
    };
    sos: {
      consented: boolean;
      consentedAt?: Timestamp;
      revokedAt?: Timestamp;
    };
    location: {
      consented: boolean;
      consentedAt?: Timestamp;
      revokedAt?: Timestamp;
    };
  };
  privacyPolicyVersion: string;
  termsVersion: string;
  updatedAt: Timestamp;
}
```

#### `analytics/{logId}`

Usage analytics and feature usage tracking.

```typescript
{
  id: string;
  familyId: string;
  userId: string;
  event: string; // "emergency_ping_sent", "sos_request", etc.
  data: {
    feature: string;
    action: string;
    metadata?: any;
  };
  deviceInfo: {
    os: string;
    version: string;
    model: string;
  };
  timestamp: Timestamp;
}
```

### Existing Collections (Updated)

#### `voice_notes/{noteId}`

Voice notes with enhanced metadata for FamilyDash+ integration.

```typescript
{
  id: string;
  familyId: string;
  context: "task" | "safe" | "sos";  // NEW: "sos" for emergency calls
  parentId: string;
  userId: string;
  url: string;
  storagePath: string;
  durationMs: number;
  isEmergency?: boolean;  // NEW: Flag for emergency voice notes
  createdAt: Timestamp;
}
```

## Indexes Required

### Composite Indexes

```javascript
// Emergency logs queries
emergency_logs: [familyId, createdAt];
emergency_logs: [familyId, fromUid, createdAt];
emergency_logs: [familyId, toUid, createdAt];

// Calls queries
calls: [familyId, status, createdAt];
calls: [familyId, fromUid, createdAt];
calls: [familyId, toUid, createdAt];

// Location queries
locations: [familyId, lastUpdated];
location_history: [userId, timestamp];

// Analytics queries
analytics: [familyId, event, timestamp];
analytics: [userId, event, timestamp];
```

## Data Retention Policies

### Automatic Cleanup

- `location_history`: Auto-delete after 72 hours
- `emergency_logs`: Auto-delete after 30 days
- `calls`: Auto-delete after 7 days
- `analytics`: Auto-delete after 90 days

### Manual Cleanup

- `locations`: Keep only latest entry per user
- `user_consent`: Permanent (privacy compliance)
- `feature_flags`: Permanent (family configuration)

## Security Rules Summary

### Access Control

- **Family Members**: Read access to family data
- **Parents**: Write access to family settings and feature flags
- **Users**: Write access to own data (location, consent)
- **Authenticated Users**: Create access to logs and analytics

### Data Validation

- Required fields validation
- Data type validation
- Timestamp validation
- User ID consistency checks

### Rate Limiting

- Emergency ping: Max 3 per hour per user
- Location updates: Max 1 per minute per user
- Analytics events: Max 100 per hour per user

## Migration Notes

### Existing Data

- Add `plan: "free"` to existing families
- Add `consent: {}` to existing family members
- Create default feature flags for existing families

### Backward Compatibility

- All existing queries continue to work
- New fields are optional with defaults
- Existing security rules are preserved

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Ready for Phase 0 deployment

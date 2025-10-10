# Firestore Indexes Required for FamilyDash

## Voice Notes Indexes

The voice_notes collection requires the following composite indexes for the `listenVoiceNotes` query:

### Required Index: voice_notes

```javascript
// Collection: voice_notes
// Fields:
// - familyId (Ascending)
// - context (Ascending)
// - parentId (Ascending)
// - createdAt (Descending)
```

### How to Create the Index:

1. **Option 1: Use the Firebase Console Link**

   - Click on the URL provided in the error message:
     `https://console.firebase.google.com/v1/r/project/family-dash-15944/firestore/indexes?create_compos...`
   - This will automatically create the required index

2. **Option 2: Manual Creation in Firebase Console**

   - Go to [Firebase Console](https://console.firebase.google.com/project/family-dash-15944/firestore/indexes)
   - Click "Create Index"
   - Select collection: `voice_notes`
   - Add fields:
     - `familyId` (Ascending)
     - `context` (Ascending)
     - `parentId` (Ascending)
     - `createdAt` (Descending)
   - Click "Create"

3. **Option 3: Firebase CLI (if you have it configured)**
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Additional Indexes for FamilyDash+ (Future)

```javascript
// Emergency logs
emergency_logs: [familyId, createdAt];
emergency_logs: [familyId, fromUid, createdAt];

// Calls
calls: [familyId, status, createdAt];
calls: [familyId, fromUid, createdAt];

// Locations
locations: [familyId, lastUpdated];
location_history: [userId, timestamp];

// Analytics
analytics: [familyId, event, timestamp];
```

## Priority

**URGENT**: Create the voice_notes index immediately to fix the SafeRoom audio issue.

The other indexes can be created when implementing FamilyDash+ features.

# Firestore Index Instructions for Family Reminders

## Required Composite Index

To fix any "Failed to load reminders" errors, you need to create a composite index in Firestore Console.

### Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `family-dash-15944`
3. **Navigate to Firestore Database**
4. **Go to Indexes tab**
5. **Click "Create Index"**

### Index Configuration:

**Collection ID**: `family_reminders`

**Fields to index**:

1. `familyId` - Ascending
2. `isActive` - Ascending
3. `scheduledFor` - Ascending

### Alternative: Use Direct Links

If you get index errors, the error message will provide direct links to create the required indexes.

### Fallback Solution

The code includes a fallback that:

1. Uses a simple query without `orderBy` when index is missing
2. Sorts the results in memory
3. Works without requiring the composite index immediately

### After Creating the Index

Once the index is created (it may take a few minutes), the app will automatically use the more efficient indexed query instead of the fallback.

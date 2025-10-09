# Firestore Index Instructions for Family Schedules

## Required Composite Index

To fix the "Failed to load schedules" error, you need to create a composite index in Firestore Console.

### Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `family-dash-15944`
3. **Navigate to Firestore Database**
4. **Go to Indexes tab**
5. **Click "Create Index"**

### Index Configuration:

**Collection ID**: `family_schedules`

**Fields to index**:

1. `familyId` - Ascending
2. `timeISO` - Ascending

### Alternative: Use the Direct Link

The error message provides a direct link to create the index:

```
https://console.firebase.google.com/v1/r/project/family-dash-15944/firestore/indexes?create_composite=Clpwcm9qZWN0cy9mYW1pbHktZGFzaC0xNTk0NC9kYXRhYmZzZXMvKGR1ZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZmFtaWx5X3NjaGVkdWxlcy9pbmRleGVzL18QAROMCghmYW1pbHlJZBABGgsKB3RpbWVJU08QAROMCghfX25hbWWfXxAB
```

### Fallback Solution

If you can't create the index immediately, the code now includes a fallback that:

1. Uses a simple query without `orderBy`
2. Sorts the results in memory
3. Works without requiring the composite index

### After Creating the Index

Once the index is created (it may take a few minutes), the app will automatically use the more efficient indexed query instead of the fallback.

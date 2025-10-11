# Firestore Rules Testing Guide

## Phase 3 - Membership-Based Security Rules

### Overview
The new Firestore rules implement a robust membership-based security model where all data access is controlled by family membership.

---

## Manual Testing Checklist

### Prerequisites
1. Deploy the new rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Have at least 2 test users:
   - User A (member of Family 1)
   - User B (not a member of Family 1)

### Test Cases

#### ✅ Test 1: User Profile Access
**Expected:** Authenticated users can read any profile but only write their own

```javascript
// As User A
- READ /users/{userB-id} → ✅ ALLOW
- WRITE /users/{userA-id} → ✅ ALLOW
- WRITE /users/{userB-id} → ❌ DENY
```

#### ✅ Test 2: Family Data Access - Members
**Expected:** Only family members can access family data

```javascript
// As User A (member of Family 1)
- READ /families/{family1-id} → ✅ ALLOW
- WRITE /families/{family1-id}/tasks/{task-id} → ✅ ALLOW

// As User B (NOT member of Family 1)
- READ /families/{family1-id} → ❌ DENY
- WRITE /families/{family1-id}/tasks/{task-id} → ❌ DENY
```

#### ✅ Test 3: Safe Room Privacy
**Expected:** Only family members can read/write safe room messages

```javascript
// As User A (member of Family 1)
- READ /families/{family1-id}/saferoom/{msg-id} → ✅ ALLOW
- CREATE /families/{family1-id}/saferoom/{new-msg} → ✅ ALLOW

// As User B (NOT member of Family 1)
- READ /families/{family1-id}/saferoom/{msg-id} → ❌ DENY
```

#### ✅ Test 4: Parent-Only Actions
**Expected:** Only parents can create/delete penalties

```javascript
// As User A (parent role in Family 1)
- CREATE /families/{family1-id}/penalties/{penalty-id} → ✅ ALLOW
- DELETE /families/{family1-id}/penalties/{penalty-id} → ✅ ALLOW

// As User C (child role in Family 1)
- READ /families/{family1-id}/penalties/{penalty-id} → ✅ ALLOW
- CREATE /families/{family1-id}/penalties/{penalty-id} → ❌ DENY
```

#### ✅ Test 5: Shopping Data
**Expected:** Authenticated users can access shopping stores/products

```javascript
// As any authenticated user
- READ /shopping_stores/{store-id} → ✅ ALLOW
- CREATE /shopping_products/{product-id} → ✅ ALLOW
```

#### ✅ Test 6: Unauthenticated Access
**Expected:** No access without authentication

```javascript
// As anonymous user
- READ /users/{user-id} → ❌ DENY
- READ /families/{family-id} → ❌ DENY
- WRITE anything → ❌ DENY
```

---

## Automated Testing (Future)

### Using Firebase Emulator

```bash
# Start emulator
firebase emulators:start --only firestore

# Run tests
npm run test:firestore-rules
```

### Test Script Template

```javascript
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

describe('Firestore Security Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'family-dash-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  test('Member can read family data', async () => {
    const memberContext = testEnv.authenticatedContext('user-a', {
      uid: 'user-a',
    });
    const familyRef = memberContext.firestore().collection('families').doc('family-1');
    await assertSucceeds(familyRef.get());
  });

  test('Non-member cannot read family data', async () => {
    const nonMemberContext = testEnv.authenticatedContext('user-b', {
      uid: 'user-b',
    });
    const familyRef = nonMemberContext.firestore().collection('families').doc('family-1');
    await assertFails(familyRef.get());
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });
});
```

---

## Migration Notes

### Data Structure Requirements

For the rules to work correctly, ensure:

1. **Family Members**: Each family must have a `members` subcollection:
   ```
   /families/{familyId}/members/{userId}
   {
     role: 'parent' | 'child' | 'admin',
     joinedAt: timestamp,
     displayName: string
   }
   ```

2. **Family ID in Documents**: Legacy collections must include `familyId`:
   ```javascript
   {
     familyId: 'family-123',
     // ... other fields
   }
   ```

3. **User Profiles**: Must exist at `/users/{userId}`

### Migration Script (if needed)

```javascript
// Add familyId to existing documents
const batch = db.batch();
const tasksSnapshot = await db.collection('tasks').get();

tasksSnapshot.forEach((doc) => {
  if (!doc.data().familyId) {
    batch.update(doc.ref, { familyId: 'your-family-id' });
  }
});

await batch.commit();
```

---

## Troubleshooting

### Issue: Permission Denied
**Cause:** User is not in the family's members subcollection  
**Fix:** Ensure member document exists at `/families/{familyId}/members/{userId}`

### Issue: Legacy Collections Not Working
**Cause:** Document missing `familyId` field  
**Fix:** Update documents to include the family ID

### Issue: Parent Actions Denied
**Cause:** Member document missing or incorrect `role` field  
**Fix:** Ensure role is set to `'parent'` or `'admin'`

---

## Deployment Checklist

- [ ] Rules tested in emulator
- [ ] Manual tests passed (all 6 test cases)
- [ ] All family members have member documents
- [ ] Legacy documents have `familyId` field
- [ ] Rules deployed to production
- [ ] App tested with real users
- [ ] Monitoring enabled for denied requests

---

## Security Best Practices Applied

✅ **Authentication Required**: All operations require authentication  
✅ **Membership Validation**: Family data only accessible to members  
✅ **Role-Based Access**: Parent actions restricted by role  
✅ **Owner Validation**: Users can only modify their own data  
✅ **Default Deny**: Explicit deny for unlisted collections  
✅ **Input Sanitization**: Combined with app-level sanitization  

---

**Status:** Phase 3 Complete ✅  
**Next:** Deploy rules and verify with manual testing


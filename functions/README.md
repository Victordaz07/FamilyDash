# FamilyDash Cloud Functions

Server-side validation, rate limiting, and security enforcement for FamilyDash.

## 📋 Overview

This directory contains Firebase Cloud Functions that provide:
- ✅ Server-side validation for critical operations
- ✅ Rate limiting to prevent abuse
- ✅ Family membership verification
- ✅ Email verification guards
- ✅ Input sanitization

## 🚀 Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Start Emulator (Development)

```bash
npm run serve
```

The emulator will run on `http://localhost:5001`

### 4. Deploy to Production

```bash
npm run deploy
```

## 📚 Available Functions

### `createTask`

**Callable Function** - Create a task with server-side validation

**Input:**
```typescript
{
  familyId: string;
  title: string;
  description?: string;
}
```

**Output:**
```typescript
{
  taskId: string;
}
```

**Rate Limit:** 30 requests per 15 minutes

**Validations:**
- User authentication required
- Family membership verification
- Title required (1-100 characters)
- Input sanitization (XSS prevention)

**Example:**
```typescript
import { createTaskServer } from '../services/cloudFunctions';

try {
  const result = await createTaskServer({
    familyId: 'family-123',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread'
  });
  console.log('Task created:', result.taskId);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### `emailVerifiedGuard`

**Callable Function** - Check if user's email is verified

**Input:** None

**Output:**
```typescript
{
  ok: boolean;
  emailVerified: boolean;
}
```

**Rate Limit:** 50 requests per 15 minutes

**Usage:**
- Gate premium features
- Require verification for sensitive actions

**Example:**
```typescript
import { checkEmailVerified } from '../services/cloudFunctions';

try {
  await checkEmailVerified();
  // Email is verified - proceed with action
  console.log('Email verified!');
} catch (error) {
  // Email not verified - show banner
  Alert.alert('Por favor verifica tu correo electrónico');
}
```

---

### `updateUserProfile`

**Callable Function** - Update user profile with validation

**Input:**
```typescript
{
  displayName?: string;
  photoURL?: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

**Rate Limit:** 10 requests per 15 minutes

**Validations:**
- Display name: 1-50 characters
- Photo URL: Valid HTTP/HTTPS URL
- Input sanitization

**Example:**
```typescript
import { updateUserProfileServer } from '../services/cloudFunctions';

try {
  await updateUserProfileServer({
    displayName: 'John Doe',
    photoURL: 'https://example.com/photo.jpg'
  });
  console.log('Profile updated!');
} catch (error) {
  console.error('Error:', error.message);
}
```

## 🔒 Security Features

### Rate Limiting

All functions implement rate limiting using Firestore transactions:
- Atomic counter per user + action
- 15-minute sliding window
- Automatic reset after window expires

**Storage:** `/rate_limits/{uid}_{action}`

**Structure:**
```typescript
{
  count: number;
  resetAt: timestamp;
}
```

### Input Sanitization

All string inputs are sanitized to prevent XSS attacks:
- Remove `<script>` tags
- Remove `<iframe>` tags
- Remove `javascript:` protocols
- Remove event handlers (`onclick`, etc.)

### Membership Verification

Functions verify family membership before operations:
- Checks `/families/{familyId}/members/{uid}` document
- Denies access if user is not a member

## 🧪 Testing

### Local Testing with Emulator

1. Start the emulator:
```bash
npm run serve
```

2. In your app, connect to emulator:
```typescript
import { connectFunctionsEmulator } from 'firebase/functions';
import { functions } from '../config/firebase';

if (__DEV__) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

3. Test your functions normally

### Production Testing

After deployment, test with real users:
1. Monitor logs: `npm run logs`
2. Check Firestore for rate_limits collection
3. Verify error handling in client

## 📊 Monitoring

### View Logs

```bash
npm run logs
```

### Firebase Console

- **Functions Dashboard:** Monitor invocations, errors, execution time
- **Firestore:** Check `/rate_limits` collection for rate limit data
- **Authentication:** Verify email verification status

## 🚨 Error Handling

### Client-Side Error Handling

```typescript
import { getRateLimitMessage, isRateLimitError } from '../services/cloudFunctions';

try {
  await createTaskServer({ ... });
} catch (error) {
  if (isRateLimitError(error)) {
    Alert.alert('Demasiadas solicitudes', getRateLimitMessage(error));
  } else if (isAuthError(error)) {
    navigation.navigate('Login');
  } else if (isPermissionError(error)) {
    Alert.alert('Sin permiso', 'No tienes acceso a esta familia');
  } else {
    Alert.alert('Error', error.message);
  }
}
```

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `functions/unauthenticated` | Not logged in | Redirect to login |
| `functions/permission-denied` | Not a family member | Show error message |
| `functions/resource-exhausted` | Rate limit exceeded | Show retry message |
| `functions/invalid-argument` | Invalid input | Validate inputs |
| `functions/failed-precondition` | Email not verified | Show verification banner |

## 📈 Performance

### Cold Start Optimization

Functions use Node.js 18 for faster cold starts.

### Cost Optimization

- **Rate Limiting:** Prevents abuse and reduces costs
- **Validation:** Rejects invalid requests early
- **Regional:** Deployed to `us-central1` for optimal latency

## 🔄 Deployment

### Deploy All Functions

```bash
npm run deploy
```

### Deploy Specific Function

```bash
firebase deploy --only functions:createTask
```

### Deploy to Staging

```bash
firebase use staging
npm run deploy
firebase use default
```

## 📝 Best Practices

1. **Always use rate limiting** for user-facing functions
2. **Validate and sanitize** all inputs
3. **Verify membership** before operations
4. **Log operations** for debugging and monitoring
5. **Handle errors gracefully** on client side
6. **Test locally** with emulator before deploying
7. **Monitor logs** after deployment

## 🆘 Troubleshooting

### Function not found

- Ensure function is deployed: `npm run deploy`
- Check function name matches in client code
- Verify Firebase project is correct

### Rate limit not working

- Check Firestore permissions for `/rate_limits` collection
- Verify transaction is completing successfully
- Check logs for errors

### Permission denied errors

- Verify user is authenticated
- Check family membership document exists
- Review Firestore security rules

## 📚 Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Callable Functions Guide](https://firebase.google.com/docs/functions/callable)
- [TypeScript Support](https://firebase.google.com/docs/functions/typescript)
- [Security Best Practices](https://firebase.google.com/docs/functions/security)

---

**Phase 4 Complete** ✅  
Server-side validation, rate limiting, and email verification implemented.


# Phase 8: App Check + RNFirebase Setup Guide

**Status:** Configuration Ready - Requires Native Build  
**Complexity:** Advanced (Native Configuration Required)  
**Time Required:** 3-4 hours

---

## ⚠️ Prerequisites

This phase requires:
- ✅ EAS Build account (free tier OK)
- ✅ Google Cloud Console access
- ✅ Firebase Console access
- ✅ Android/iOS developer accounts (for production)
- ✅ Phases 0-7 completed

---

## 📦 Step 1: Install RNFirebase Modules

```bash
# Core
npm install @react-native-firebase/app

# App Check (security)
npm install @react-native-firebase/app-check

# Analytics & Performance
npm install @react-native-firebase/analytics
npm install @react-native-firebase/perf
```

---

## 🔧 Step 2: Update app.json

Add React Native Firebase plugins:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/app-check",
      "@react-native-firebase/analytics",
      "@react-native-firebase/perf"
    ]
  }
}
```

---

## 📱 Step 3: Add Native Config Files

### Android: google-services.json

1. Go to Firebase Console → Project Settings
2. Under "Your apps" → Android app
3. Download `google-services.json`
4. Place in: `android/app/google-services.json`

### iOS: GoogleService-Info.plist

1. Go to Firebase Console → Project Settings
2. Under "Your apps" → iOS app
3. Download `GoogleService-Info.plist`
4. Place in: `ios/GoogleService-Info.plist`

---

## 🏗️ Step 4: Run Prebuild (Creates Native Folders)

```bash
npx expo prebuild
```

This creates:
- `android/` folder with native Android project
- `ios/` folder with native iOS project

**Note:** After prebuild, commit the native folders to git.

---

## 🔐 Step 5: Configure App Check

### Firebase Console Setup

1. Go to: Firebase Console → App Check
2. Click "Register app" for your Android/iOS apps
3. **Android:** Configure Play Integrity API
   - Enable Play Integrity API in Google Cloud Console
   - Register SHA-256 certificate fingerprints
4. **iOS:** Configure DeviceCheck or App Attest
   - iOS 14+: App Attest (recommended)
   - iOS 11-13: DeviceCheck

### In Your Code

Create `src/config/appCheck.ts`:

```typescript
import appCheck from '@react-native-firebase/app-check';

export async function setupAppCheck() {
  // Configure provider
  const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider();
  rnfbProvider.configure({
    android: {
      provider: 'playIntegrity', // or 'debug' for development
    },
    apple: {
      provider: 'appAttest', // or 'deviceCheck' or 'debug'
    },
  });

  // Activate App Check
  await appCheck().initializeAppCheck({
    provider: rnfbProvider,
    isTokenAutoRefreshEnabled: true,
  });

  console.log('🛡️ App Check activated');
}
```

Call in `App.tsx`:

```typescript
import { setupAppCheck } from './src/config/appCheck';

// Before rendering
useEffect(() => {
  setupAppCheck();
}, []);
```

### Enable Enforcement (After Testing!)

1. Firebase Console → App Check
2. Go to each service (Firestore, Storage, Functions)
3. Click "Enforce" (⚠️ This will block unauthenticated clients)
4. Monitor "Metrics" tab to ensure legitimate traffic passes

---

## 📊 Step 6: Implement Analytics

Create `src/services/analytics.native.ts`:

```typescript
import analytics from '@react-native-firebase/analytics';

export async function logScreen(screenName: string) {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
}

export async function logEvent(eventName: string, params?: Record<string, any>) {
  await analytics().logEvent(eventName, params);
}

export async function setUserId(userId: string) {
  await analytics().setUserId(userId);
}

export async function setUserProperty(name: string, value: string) {
  await analytics().setUserProperty(name, value);
}
```

### Usage in Screens

```typescript
import { logScreen } from '../services/analytics.native';

const TaskListScreen = () => {
  useFocusEffect(
    useCallback(() => {
      logScreen('TaskList');
    }, [])
  );

  return (/* ... */);
};
```

---

## ⚡ Step 7: Implement Performance Monitoring

Create `src/services/performance.native.ts`:

```typescript
import perf from '@react-native-firebase/perf';

export async function measureOperation<T>(
  traceName: string,
  operation: () => Promise<T>
): Promise<T> {
  const trace = await perf().startTrace(traceName);

  try {
    const result = await operation();
    await trace.stop();
    return result;
  } catch (error) {
    await trace.stop();
    throw error;
  }
}

export async function startTrace(traceName: string) {
  return await perf().startTrace(traceName);
}

export async function recordHttpMetric(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  startTime: number,
  endTime: number,
  responseCode: number
) {
  const metric = await perf().newHttpMetric(url, method);
  await metric.start();
  await metric.setHttpResponseCode(responseCode);
  await metric.setResponseContentType('application/json');
  await metric.stop();
}
```

### Usage Example

```typescript
import { measureOperation } from '../services/performance.native';

const fetchTasks = async () => {
  return await measureOperation('fetch_tasks', async () => {
    const tasks = await db.collection('tasks').get();
    return tasks.docs.map(doc => doc.data());
  });
};
```

---

## 🚀 Step 8: Build with EAS

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Configure EAS

```bash
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Build for Android

```bash
# Preview build (APK)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production
```

---

## ✅ Step 9: Test App Check

### Development Testing

1. **Debug Tokens** (for development):
   ```bash
   # Get debug token from logs
   adb logcat | grep DebugAppCheckProvider
   ```
   
2. **Register Debug Token** in Firebase Console:
   - App Check → Apps → Your App → Debug tokens
   - Add the token from logs

3. **Test**:
   - Run app on device/emulator
   - Make Firestore/Storage requests
   - Check Firebase Console metrics

### Production Testing

1. Build signed APK/IPA with EAS
2. Install on real device
3. Verify App Check token in logs
4. Enable enforcement for one service
5. Test that requests work
6. Gradually enable for all services

---

## 📊 Step 10: Monitor & Verify

### Firebase Console

1. **App Check Dashboard**
   - View verification attempts
   - Monitor token refresh rates
   - Check for suspicious patterns

2. **Analytics Dashboard**
   - User engagement metrics
   - Screen views
   - Custom events
   - User properties

3. **Performance Dashboard**
   - App start time
   - Screen rendering
   - Network requests
   - Custom traces

### DebugView (Development)

Enable debug mode for Analytics:

```bash
# Android
adb shell setprop debug.firebase.analytics.app com.yourcompany.familydash

# iOS (via Xcode scheme)
Add argument: -FIRDebugEnabled
```

---

## 🐛 Troubleshooting

### App Check Token Fails

**Problem:** App not getting verified  
**Solution:**
- Check SHA-256 fingerprint matches in Firebase Console
- Verify Play Integrity/DeviceCheck is enabled
- Use debug token for development
- Check device has Google Play Services (Android)

### Analytics Not Appearing

**Problem:** Events not showing in Firebase Console  
**Solution:**
- Wait 24 hours (processing delay)
- Enable DebugView for immediate feedback
- Check internet connection
- Verify `google-services.json` is correct

### Performance Traces Empty

**Problem:** No performance data  
**Solution:**
- Ensure traces are stopped (await trace.stop())
- Check sampling rate (may not record all sessions)
- Wait for data processing (up to 24 hours)
- Verify Performance Monitoring is enabled in Firebase Console

### Build Fails

**Problem:** EAS build fails  
**Solution:**
- Run `npx expo-doctor` to check issues
- Ensure all native dependencies are compatible
- Check `eas.json` configuration
- Review build logs for specific errors

---

## 📚 Resources

- [RNFirebase Docs](https://rnfirebase.io/)
- [App Check Guide](https://firebase.google.com/docs/app-check)
- [Play Integrity API](https://developer.android.com/google/play/integrity)
- [App Attest (iOS)](https://developer.apple.com/documentation/devicecheck/dcappattestservice)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Firebase Performance](https://firebase.google.com/docs/perf-mon)

---

## ⏱️ Timeline

- **Configuration:** 1 hour
- **Native setup:** 1 hour  
- **EAS Build setup:** 30 minutes
- **Testing & Debugging:** 1-2 hours
- **Production deployment:** 30 minutes

**Total:** 3-4 hours

---

## ✅ Checklist

Configuration:
- [ ] RNFirebase modules installed
- [ ] app.json plugins configured
- [ ] google-services.json added (Android)
- [ ] GoogleService-Info.plist added (iOS)
- [ ] Prebuild completed

App Check:
- [ ] Play Integrity configured (Android)
- [ ] App Attest/DeviceCheck configured (iOS)
- [ ] App Check initialized in code
- [ ] Debug tokens registered (development)
- [ ] Enforcement enabled (after testing)

Analytics & Performance:
- [ ] Analytics service created
- [ ] Performance service created
- [ ] Screen tracking implemented
- [ ] Custom events added
- [ ] Traces for key operations

Build & Deploy:
- [ ] EAS CLI installed
- [ ] EAS configured
- [ ] Preview build successful
- [ ] Production build successful
- [ ] App tested on real devices

---

**Status:** ✅ Configuration Complete - Ready for Native Build  
**Next Step:** Run `npx expo prebuild` and follow steps 3-10


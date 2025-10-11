/**
 * Native Analytics Service Template
 * 
 * IMPORTANT: This requires @react-native-firebase/analytics installed
 * and native configuration (see PHASE_8_SETUP_GUIDE.md)
 * 
 * Uncomment and use after completing Phase 8 native setup
 */

/*
import analytics from '@react-native-firebase/analytics';

export async function logScreen(screenName: string) {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.error('Analytics logScreen error:', error);
  }
}

export async function logEvent(eventName: string, params?: Record<string, any>) {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('Analytics logEvent error:', error);
  }
}

export async function setUserId(userId: string) {
  try {
    await analytics().setUserId(userId);
  } catch (error) {
    console.error('Analytics setUserId error:', error);
  }
}

export async function setUserProperty(name: string, value: string) {
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.error('Analytics setUserProperty error:', error);
  }
}

export async function logLogin(method: string) {
  await logEvent('login', { method });
}

export async function logSignUp(method: string) {
  await logEvent('sign_up', { method });
}

export async function logTaskCreated(familyId: string) {
  await logEvent('task_created', { family_id: familyId });
}

export async function logTaskCompleted(familyId: string, taskId: string) {
  await logEvent('task_completed', { 
    family_id: familyId,
    task_id: taskId,
  });
}
*/

// Export placeholder until Phase 8 is fully implemented
export async function logScreen(screenName: string) {
  if (__DEV__) {
    console.log('📊 Analytics (mock): Screen view -', screenName);
  }
}

export async function logEvent(eventName: string, params?: Record<string, any>) {
  if (__DEV__) {
    console.log('📊 Analytics (mock): Event -', eventName, params);
  }
}

export async function setUserId(userId: string) {
  if (__DEV__) {
    console.log('📊 Analytics (mock): User ID -', userId);
  }
}

export async function setUserProperty(name: string, value: string) {
  if (__DEV__) {
    console.log('📊 Analytics (mock): User property -', name, '=', value);
  }
}


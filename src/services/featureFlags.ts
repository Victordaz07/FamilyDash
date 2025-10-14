/**
 * Feature Flags Service for FamilyDash+
 * Manages feature availability based on family plan and settings
 */

import React from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Feature flags types
export type FeatureFlags = {
  emergencyPing: boolean;
  liveAudioSOS: boolean;
  locationSharing: boolean;
};

export type FamilyPlan = "free" | "plus";

// Default feature flags based on plan
export const getDefaultFeatureFlags = (plan: FamilyPlan): FeatureFlags => {
  if (plan === "plus") {
    return {
      emergencyPing: true,
      liveAudioSOS: true,
      locationSharing: true,
    };
  }
  
  return {
    emergencyPing: false,
    liveAudioSOS: false,
    locationSharing: false,
  };
};

// Get family plan
export async function getFamilyPlan(familyId: string): Promise<FamilyPlan> {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (familyDoc.exists()) {
      const data = familyDoc.data();
      return data.plan || "free";
    }
    return "free";
  } catch (error) {
    console.error('Error getting family plan:', error);
    return "free";
  }
}

// Get feature flags for a family
export async function getFeatureFlags(familyId: string): Promise<FeatureFlags> {
  try {
    const flagsDoc = await getDoc(doc(db, 'feature_flags', familyId));
    if (flagsDoc.exists()) {
      return flagsDoc.data() as FeatureFlags;
    }
    
    // If no flags exist, create default based on plan
    const plan = await getFamilyPlan(familyId);
    const defaultFlags = getDefaultFeatureFlags(plan);
    await setDoc(doc(db, 'feature_flags', familyId), {
      ...defaultFlags,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return defaultFlags;
  } catch (error) {
    console.error('Error getting feature flags:', error);
    return getDefaultFeatureFlags("free");
  }
}

// Update feature flags (only parents can do this)
export async function updateFeatureFlags(
  familyId: string, 
  flags: Partial<FeatureFlags>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'feature_flags', familyId), 
      {
        ...flags,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating feature flags:', error);
    throw error;
  }
}

// Hook to listen to feature flags changes
export function useFeatureFlags(familyId: string): {
  flags: FeatureFlags | null;
  loading: boolean;
  error: string | null;
  plan: FamilyPlan | null;
} {
  const [flags, setFlags] = React.useState<FeatureFlags | null>(null);
  const [plan, setPlan] = React.useState<FamilyPlan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to feature flags
    const unsubscribeFlags = onSnapshot(
      doc(db, 'feature_flags', familyId),
      (doc) => {
        if (doc.exists()) {
          setFlags(doc.data() as FeatureFlags);
        } else {
          // Create default flags if they don't exist
          getFeatureFlags(familyId).then(setFlags);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to feature flags:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Listen to family plan
    const unsubscribePlan = onSnapshot(
      doc(db, 'families', familyId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setPlan(data.plan || "free");
        }
      },
      (err) => {
        console.error('Error listening to family plan:', err);
      }
    );

    return () => {
      unsubscribeFlags();
      unsubscribePlan();
    };
  }, [familyId]);

  return { flags, loading, error, plan };
}

// Helper function to check if a specific feature is enabled
export function isFeatureEnabled(
  flags: FeatureFlags | null, 
  feature: keyof FeatureFlags
): boolean {
  if (!flags) return false;
  return flags[feature];
}

// Helper function to get user consent for a feature
export async function getUserConsent(
  familyId: string,
  userId: string,
  feature: 'ping' | 'sos' | 'location'
): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'family_members', familyId, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.consent?.[feature] || false;
    }
    return false;
  } catch (error) {
    console.error('Error getting user consent:', error);
    return false;
  }
}

// Update user consent for a feature
export async function updateUserConsent(
  familyId: string,
  userId: string,
  feature: 'ping' | 'sos' | 'location',
  consented: boolean
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'family_members', familyId, 'users', userId),
      {
        consent: {
          [feature]: consented,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user consent:', error);
    throw error;
  }
}

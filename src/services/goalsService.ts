import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Goal, Milestone, Reflection } from '@/types/goals';

const GOALS_COLLECTION = 'goals';
const MILESTONES_COLLECTION = 'milestones';
const REFLECTIONS_COLLECTION = 'reflections';

// ============================================
// GOALS CRUD
// ============================================

/**
 * Create a new goal
 */
export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const goalsRef = collection(db, GOALS_COLLECTION);
    const docRef = await addDoc(goalsRef, {
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

/**
 * Get a single goal by ID
 */
export const getGoal = async (goalId: string): Promise<Goal | null> => {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      const data = goalSnap.data();
      return {
        id: goalSnap.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        deadlineAt: data.deadlineAt?.toMillis(),
        lastActivityAt: data.lastActivityAt?.toMillis(),
      } as Goal;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting goal:', error);
    throw error;
  }
};

/**
 * Get all goals for a family
 */
export const getFamilyGoals = async (familyId: string): Promise<Goal[]> => {
  try {
    const goalsRef = collection(db, GOALS_COLLECTION);
    const q = query(
      goalsRef,
      where('familyId', '==', familyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals: Goal[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      goals.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        deadlineAt: data.deadlineAt?.toMillis(),
        lastActivityAt: data.lastActivityAt?.toMillis(),
      } as Goal);
    });
    
    return goals;
  } catch (error) {
    console.error('Error getting family goals:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for family goals
 */
export const subscribeFamilyGoals = (
  familyId: string,
  onUpdate: (goals: Goal[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const goalsRef = collection(db, GOALS_COLLECTION);
    const q = query(
      goalsRef,
      where('familyId', '==', familyId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const goals: Goal[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          goals.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis() || Date.now(),
            updatedAt: data.updatedAt?.toMillis() || Date.now(),
            deadlineAt: data.deadlineAt?.toMillis(),
            lastActivityAt: data.lastActivityAt?.toMillis(),
          } as Goal);
        });
        onUpdate(goals);
      },
      (error) => {
        console.error('Error in goals subscription:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Error setting up goals subscription:', error);
    throw error;
  }
};

/**
 * Update a goal
 */
export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<void> => {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// ============================================
// MILESTONES CRUD
// ============================================

/**
 * Create a new milestone for a goal
 */
export const createMilestone = async (
  goalId: string,
  milestoneData: Omit<Milestone, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const milestonesRef = collection(db, GOALS_COLLECTION, goalId, MILESTONES_COLLECTION);
    const docRef = await addDoc(milestonesRef, {
      ...milestoneData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw error;
  }
};

/**
 * Get all milestones for a goal
 */
export const getGoalMilestones = async (goalId: string): Promise<Milestone[]> => {
  try {
    const milestonesRef = collection(db, GOALS_COLLECTION, goalId, MILESTONES_COLLECTION);
    const q = query(milestonesRef, orderBy('createdAt', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const milestones: Milestone[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      milestones.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        dueAt: data.dueAt?.toMillis(),
      } as Milestone);
    });
    
    return milestones;
  } catch (error) {
    console.error('Error getting milestones:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for goal milestones
 */
export const subscribeGoalMilestones = (
  goalId: string,
  onUpdate: (milestones: Milestone[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const milestonesRef = collection(db, GOALS_COLLECTION, goalId, MILESTONES_COLLECTION);
    const q = query(milestonesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const milestones: Milestone[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          milestones.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis() || Date.now(),
            dueAt: data.dueAt?.toMillis(),
          } as Milestone);
        });
        onUpdate(milestones);
      },
      (error) => {
        console.error('Error in milestones subscription:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Error setting up milestones subscription:', error);
    throw error;
  }
};

/**
 * Update a milestone
 */
export const updateMilestone = async (
  goalId: string,
  milestoneId: string,
  updates: Partial<Milestone>
): Promise<void> => {
  try {
    const milestoneRef = doc(db, GOALS_COLLECTION, goalId, MILESTONES_COLLECTION, milestoneId);
    await updateDoc(milestoneRef, updates);
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

/**
 * Delete a milestone
 */
export const deleteMilestone = async (goalId: string, milestoneId: string): Promise<void> => {
  try {
    const milestoneRef = doc(db, GOALS_COLLECTION, goalId, MILESTONES_COLLECTION, milestoneId);
    await deleteDoc(milestoneRef);
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

// ============================================
// REFLECTIONS CRUD
// ============================================

/**
 * Create a new reflection
 */
export const createReflection = async (reflectionData: Omit<Reflection, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const reflectionsRef = collection(db, REFLECTIONS_COLLECTION);
    const docRef = await addDoc(reflectionsRef, {
      ...reflectionData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating reflection:', error);
    throw error;
  }
};

/**
 * Get all reflections for a goal
 */
export const getGoalReflections = async (goalId: string): Promise<Reflection[]> => {
  try {
    const reflectionsRef = collection(db, REFLECTIONS_COLLECTION);
    const q = query(
      reflectionsRef,
      where('goalId', '==', goalId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reflections: Reflection[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reflections.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
      } as Reflection);
    });
    
    return reflections;
  } catch (error) {
    console.error('Error getting reflections:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for goal reflections
 */
export const subscribeGoalReflections = (
  goalId: string,
  onUpdate: (reflections: Reflection[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const reflectionsRef = collection(db, REFLECTIONS_COLLECTION);
    const q = query(
      reflectionsRef,
      where('goalId', '==', goalId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const reflections: Reflection[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reflections.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          } as Reflection);
        });
        onUpdate(reflections);
      },
      (error) => {
        console.error('Error in reflections subscription:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Error setting up reflections subscription:', error);
    throw error;
  }
};

/**
 * Update a reflection
 */
export const updateReflection = async (reflectionId: string, updates: Partial<Reflection>): Promise<void> => {
  try {
    const reflectionRef = doc(db, REFLECTIONS_COLLECTION, reflectionId);
    await updateDoc(reflectionRef, updates);
  } catch (error) {
    console.error('Error updating reflection:', error);
    throw error;
  }
};

/**
 * Delete a reflection
 */
export const deleteReflection = async (reflectionId: string): Promise<void> => {
  try {
    const reflectionRef = doc(db, REFLECTIONS_COLLECTION, reflectionId);
    await deleteDoc(reflectionRef);
  } catch (error) {
    console.error('Error deleting reflection:', error);
    throw error;
  }
};

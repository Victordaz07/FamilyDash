/**
 * 🏆 ACHIEVEMENTS FIRESTORE SYNC
 * Real-time synchronization for achievements and stats
 */

import { app } from "@/services/firebase";
import {
  getFirestore, collection, doc, onSnapshot,
  getDoc, setDoc, serverTimestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppStore } from "@/store";

const db = getFirestore(app);

let unsubscribeAchievements: (() => void) | null = null;
let unsubscribeStats: (() => void) | null = null;
let unsubscribeAuth: (() => void) | null = null;

// Throttle for stats push (avoid spamming Firestore)
let statsThrottleTimer: any = null;

/**
 * Start achievements sync when user is authenticated
 */
export function startAchievementsSync() {
  const auth = getAuth(app);

  // Cleanup previous subscriptions
  if (unsubscribeAuth) unsubscribeAuth();
  
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    // Cleanup previous listeners
    if (unsubscribeAchievements) { unsubscribeAchievements(); unsubscribeAchievements = null; }
    if (unsubscribeStats) { unsubscribeStats(); unsubscribeStats = null; }

    if (!user) return;
    const uid = user.uid;

    // Pull initial stats
    try {
      const statsDocRef = doc(db, "users", uid, "stats");
      const statsSnap = await getDoc(statsDocRef);
      
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        useAppStore.setState({
          stats: {
            totalCompleted: data.totalCompleted ?? 0,
            dayKey: data.dayKey ?? '',
            dayCompleted: data.dayCompleted ?? 0,
            streak: data.streak ?? 0,
            lastActiveDay: data.lastActiveDay,
            weekWindow: data.weekWindow ?? [],
          },
          points: data.points ?? 0,
        });
      }
    } catch (error) {
      console.warn('Failed to load stats:', error);
    }

    // Pull initial achievements
    try {
      const achievementsCol = collection(db, "users", uid, "achievements");
      const achievementsSnap = await getDoc(doc(achievementsCol.path));
      
      // Note: For subcollections, we need to query differently
      // For now, we'll subscribe to changes and let onSnapshot handle it
    } catch (error) {
      console.warn('Failed to load achievements:', error);
    }

    // Live updates for stats
    unsubscribeStats = onSnapshot(doc(db, "users", uid, "stats"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        useAppStore.setState({
          stats: {
            totalCompleted: data.totalCompleted ?? 0,
            dayKey: data.dayKey ?? '',
            dayCompleted: data.dayCompleted ?? 0,
            streak: data.streak ?? 0,
            lastActiveDay: data.lastActiveDay,
            weekWindow: data.weekWindow ?? [],
          },
          points: data.points ?? 0,
        });
      }
    });
  });

  return () => {
    if (unsubscribeAchievements) { unsubscribeAchievements(); unsubscribeAchievements = null; }
    if (unsubscribeStats) { unsubscribeStats(); unsubscribeStats = null; }
    if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null; }
  };
}

/**
 * Push achievement unlock to Firestore
 */
export async function pushUnlock(achId: string) {
  try {
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    
    const achState = useAppStore.getState().achievements[achId];
    if (!achState) return;
    
    await setDoc(doc(db, "users", uid, "achievements", achId), {
      unlocked: achState.unlocked,
      unlockedAt: serverTimestamp(),
      progress: achState.progress ?? 0,
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to push unlock:', error);
  }
}

/**
 * Push stats to Firestore (throttled)
 */
export async function pushStats() {
  // Throttle: only push once per 3 seconds
  if (statsThrottleTimer) return;
  
  statsThrottleTimer = setTimeout(async () => {
    statsThrottleTimer = null;
    
    try {
      const auth = getAuth(app);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      
      const state = useAppStore.getState();
      
      await setDoc(doc(db, "users", uid, "stats"), {
        points: state.points,
        totalCompleted: state.stats.totalCompleted,
        dayKey: state.stats.dayKey,
        dayCompleted: state.stats.dayCompleted,
        streak: state.stats.streak,
        lastActiveDay: state.stats.lastActiveDay,
        weekWindow: state.stats.weekWindow,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.warn('Failed to push stats:', error);
    }
  }, 3000);
}

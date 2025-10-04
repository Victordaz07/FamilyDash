/**
 * Firebase Migration Service for FamilyDash
 * Handles migration from mock services to full Firebase backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  Auth,
  User,
} from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "familydash-demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "familydash-demo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "familydash-demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Collection names
const COLLECTIONS = {
  FAMILIES: 'families',
  MEMBERS: 'members',
  TASKS: 'tasks',
  GOALS: 'goals',
  PENALTIES: 'penalties',
  EVENTS: 'events',
  VOTING: 'voting',
  SAFE_ROOM_MESSAGES: 'safeRoomMessages',
  CONVERSATIONS: 'conversations',
  AI_INSIGHTS: 'aiInsights',
  PREDICTIONS: 'predictions',
  BACKUPS: 'backups',
  ANALYTICS: 'analytics',
} as const;

export interface MigrationStatus {
  entity: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  migratedRecords: number;
  totalRecords: number;
  lastSync: number;
  errors: string[];
}

export interface MigrationProgress {
  totalEntities: number;
  completedEntities: number;
  overallProgress: number;
  entityStatus: Map<string, MigrationStatus>;
  migrationErrors: string[];
  isComplete: boolean;
}

export interface CloudSyncStatus {
  familyId: string;
  lastSyncTime: number;
  connectedDevices: number;
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'error';
  conflicts: Array<{
    resource: string;
    localVersion: any;
    cloudVersion: any;
    conflictType: 'update' | 'delete' | 'create';
  }>;
}

export class FirebaseMigrationService {
  private static instance: FirebaseMigrationService;
  private app: any;
  private db: any;
  private auth: Auth;
  private storage: any;
  private migrationProgress: MigrationProgress | null = null;
  private migrationSubscriptions: Map<string, () => void> = new Map();
  
  private constructor() {
    this.initializeFirebase();
  }

  static getInstance(): FirebaseMigrationService {
    if (!FirebaseMigrationService.instance) {
      FirebaseMigrationService.instance = new FirebaseMigrationService();
    }
    return FirebaseMigrationService.instance;
  }

  /**
   * Initialize Firebase services
   */
  private initializeFirebase(): void {
    try {
      // Initialize Firebase App
      this.app = initializeApp(firebaseConfig);
      
      console.log('🔥 Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fall back to mock services if Firebase fails
      console.log('Using mock services as fallback');
    }
  }

  /**
   * Migrate family data from local storage to Firebase
   */
  async migrateFamilyData(familyId: string): Promise<MigrationProgress> {
    try {
      console.log(`🔄 Starting migration for family ${familyId}`);
      
      this.migrationProgress = {
        totalEntities: 8,
        completedEntities: 0,
        overallProgress: 0,
        entityStatus: new Map(),
        migrationErrors: [],
        isComplete: false,
      };

      // Migrate entities in sequence
      await this.migrateFamilyMembers(familyId);
      await this.migrateTasks(familyId);
      await this.migrateGoals(familyId);
      await this.migratePenalties(familyId);
      await this.migrateCalendarEvents(familyId);
      await this.migrateSafeRoomMessages(familyId);
      await this.migrateVotingData(familyId);
      await this.migrateAnalyticsData(familyId);

      this.migrationProgress.isComplete = true;
      this.migrationProgress.overallProgress = 100;

      console.log('✅ Family data migration completed');
      return this.migrationProgress;

    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  /**
   * Migrate family members data
   */
  private async migrateFamilyMembers(familyId: string): Promise<void> {
    try {
      const statusKey = 'familyMembers';
      this.updateMigrationStatus(statusKey, 'in_progress');

      // Get local family members data
      const localMembersData = await AsyncStorage.getItem('familyMembers');
      
      if (localMembersData) {
        const members = JSON.parse(localMembersData);
        const batch = writeBatch(this.db);

        for (const member of members) {
          const memberRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.MEMBERS, member.id);
          batch.set(memberRef, {
            ...member,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();

        this.updateMigrationStatus(statusKey, 'completed', members.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate tasks data
   */
  private async migrateTasks(familyId: string): Promise<void> {
    try {
      const statusKey = 'tasks';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localTasksData = await AsyncStorage.getItem('tasks');
      
      if (localTasksData) {
        const tasks = JSON.parse(localTasksData);
        const familyTasks = tasks.filter((task: any) => task.familyId === familyId || !task.familyId);
        
        const batch = writeBatch(this.db);

        for (const task of familyTasks) {
          const taskRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.TASKS, task.id);
          batch.set(taskRef, {
            ...task,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyTasks.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate goals data
   */
  private async migrateGoals(familyId: string): Promise<void> {
    try {
      const statusKey = 'goals';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localGoalsData = await AsyncStorage.getItem('goals');
      
      if (localGoalsData) {
        const goals = JSON.parse(localGoalsData);
        const familyGoals = goals.filter((goal: any) => goal.familyId === familyId || !goal.familyId);
        
        const batch = writeBatch(this.db);

        for (const goal of familyGoals) {
          const goalRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.GOALS, goal.id);
          batch.set(goalRef, {
            ...goal,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyGoals.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate penalties data
   */
  private async migratePenalties(familyId: string): Promise<void> {
    try {
      const statusKey = 'penalties';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localPenaltiesData = await AsyncStorage.getItem('penalties');
      
      if (localPenaltiesData) {
        const penalties = JSON.parse(localPenaltiesData);
        const familyPenalties = penalties.filter((penalty: any) => penalty.familyId === familyId || !penalty.familyId);
        
        const batch = writeBatch(this.db);

        for (const penalty of familyPenalties) {
          const penaltyRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.PENALTIES, penalty.id);
          batch.set(penaltyRef, {
            ...penalty,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyPenalties.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate calendar events data
   */
  private async migrateCalendarEvents(familyId: string): Promise<void> {
    try {
      const statusKey = 'calendarEvents';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localCalendarData = await AsyncStorage.getItem('calendarEvents');
      
      if (localCalendarData) {
        const events = JSON.parse(localCalendarData);
        const familyEvents = events.filter((event: any) => event.familyId === familyId || !event.familyId);
        
        const batch = writeBatch(this.db);

        for (const event of familyEvents) {
          const eventRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.EVENTS, event.id);
          batch.set(eventRef, {
            ...event,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyEvents.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate SafeRoom messages data
   */
  private async migrateSafeRoomMessages(familyId: string): Promise<void> {
    try {
      const statusKey = 'safeRoomMessages';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localSafeRoomData = await AsyncStorage.getItem('safeRoomMessages');
      
      if (localSafeRoomData) {
        const messages = JSON.parse(localSafeRoomData);
        const familyMessages = messages.filter((message: any) => message.familyId === familyId || !message.familyId);
        
        const batch = writeBatch(this.db);

        for (const message of familyMessages) {
          const messageRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.SAFE_ROOM_MESSAGES, message.id);
          batch.set(messageRef, {
            ...message,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyMessages.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate voting data
   */
  private async migrateVotingData(familyId: string): Promise<void> {
    try {
      const statusKey = 'votingData';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localVotingData = await AsyncStorage.getItem('votingData');
      
      if (localVotingData) {
        const votes = JSON.parse(localVotingData);
        const familyVotes = votes.filter((vote: any) => vote.familyId === familyId || !vote.familyId);
        
        const batch = writeBatch(this.db);

        for (const vote of familyVotes) {
          const voteRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.VOTING, vote.id);
          batch.set(voteRef, {
            ...vote,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyVotes.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Migrate analytics data
   */
  private async migrateAnalyticsData(familyId: string): Promise<void> {
    try {
      const statusKey = 'analyticsData';
      this.updateMigrationStatus(statusKey, 'in_progress');

      const localAnalyticsData = await AsyncStorage.getItem('analyticsData');
      
      if (localAnalyticsData) {
        const analytics = JSON.parse(localAnalyticsData);
        const familyAnalytics = analytics.filter((item: any) => item.familyId === familyId || !item.familyId);
        
        const batch = writeBatch(this.db);

        for (const item of familyAnalytics) {
          const analyticsRef = doc(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.ANALYTICS, item.id);
          batch.set(analyticsRef, {
            ...item,
            migratedAt: serverTimestamp(),
            source: 'migration',
          });
        }

        await batch.commit();
        this.updateMigrationStatus(statusKey, 'completed', familyAnalytics.length);
      } else {
        this.updateMigrationStatus(statusKey, 'completed', 0);
      }

    } catch (error) {
      this.updateMigrationStatus(statusKey, 'failed', 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Update migration status
   */
  private updateMigrationStatus(
    entity: string,
    status: MigrationStatus['status'],
    migratedRecords: number = 0,
    errors: string[] = []
  ): void {
    if (!this.migrationProgress) return;

    const currentStatus = this.migrationProgress.entityStatus.get(entity) || {
      entity,
      status: 'pending',
      migratedRecords: 0,
      totalRecords: 0,
      lastSync: Date.now(),
      errors: [],
    };

    currentStatus.status = status;
    currentStatus.migratedRecords = migratedRecords;
    currentStatus.errors = errors;
    currentStatus.lastSync = Date.now();

    this.migrationProgress.entityStatus.set(entity, currentStatus);

    // Update overall progress
    const completedStatuses = Array.from(this.migrationProgress.entityStatus.values())
      .filter(s => s.status === 'completed').length;
    
    this.migrationProgress.completedEntities = completedStatuses;
    this.migrationProgress.overallProgress = 
      (completedStatuses / this.migrationProgress.totalEntities) * 100;
  }

  /**
   * Set up real-time sync for migrated data
   */
  async setupRealtimeSync(familyId: string): Promise<void> {
    try {
      console.log(`🔄 Setting up real-time sync for ${familyId}`);

      // Set up sync listeners for different collections
      await this.setupTasksSync(familyId);
      await this.setupGoalsSync(familyId);
      await this.setupPenaltiesSync(familyId);
      await this.setupEventsSync(familyId);

      console.log('✅ Real-time sync setup completed');

    } catch (error) {
      console.error('Error setting up real-time sync:', error);
      throw error;
    }
  }

  /**
   * Set up tasks real-time sync
   */
  private async setupTasksSync(familyId: string): Promise<void> {
    const tasksQuery = query(
      collection(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.TASKS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update local storage
      AsyncStorage.setItem('tasks_cloud', JSON.stringify(tasks));

      console.log('📋 Tasks synced from cloud:', tasks.length);
    });

    this.migrationSubscriptions.set(`tasks_${familyId}`, unsubscribe);
  }

  /**
   * Set up goals real-time sync
   */
  private async setupGoalsSync(familyId: string): Promise<void> {
    const goalsQuery = query(
      collection(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.GOALS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(goalsQuery, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update local storage
      AsyncStorage.setItem('goals_cloud', JSON.stringify(goals));

      console.log('🎯 Goals synced from cloud:', goals.length);
    });

    this.migrationSubscriptions.set(`goals_${familyId}`, unsubscribe);
  }

  /**
   * Set up penalties real-time sync
   */
  private async setupPenaltiesSync(familyId: string): Promise<void> {
    const penaltiesQuery = query(
      collection(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.PENALTIES),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(penaltiesQuery, (snapshot) => {
      const penalties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update local storage
      AsyncStorage.setItem('penalties_cloud', JSON.stringify(penalties));

      console.log('⚖️ Penalties synced from cloud:', penalties.length);
    });

    this.migrationSubscriptions.set(`penalties_${familyId}`, unsubscribe);
  }

  /**
   * Set up events real-time sync
   */
  private async setupEventsSync(familyId: string): Promise<void> {
    const eventsQuery = query(
      collection(this.db, COLLECTIONS.FAMILIES, familyId, COLLECTIONS.EVENTS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update local storage
      AsyncStorage.setItem('events_cloud', JSON.stringify(events));

      console.log('📅 Events synced from cloud:', events.length);
    });

    this.migrationSubscriptions.set(`events_${familyId}`, unsubscribe);
  }

  /**
   * Get migration progress
   */
  getMigrationProgress(): MigrationProgress | null {
    return this.migrationProgress;
  }

  /**
   * Clean up migration subscriptions
   */
  cleanupSubscriptions(familyId: string): void {
    this.migrationSubscriptions.forEach((unsubscribe, key) => {
      if (key.includes(familyId)) {
        unsubscribe();
        this.migrationSubscriptions.delete(key);
      }
    });
  }

  /**
   * Get Cloud Sync Status
   */
  async getCloudSyncStatus(familyId: string): Promise<CloudSyncStatus> {
    try {
      // Mock implementation - in real app would check Firebase sync status
      const status: CloudSyncStatus = {
        familyId,
        lastSyncTime: Date.now(),
        connectedDevices: 3,
        syncStatus: 'synced',
        conflicts: [],
      };

      return status;
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
}

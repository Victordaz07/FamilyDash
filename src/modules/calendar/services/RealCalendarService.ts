/**
 * REAL Calendar Firebase Service
 * Production-ready Firebase integration for Calendar module
 */

import { RealDatabaseService, RealAuthService } from '../../../services';
import Logger from '../../../services/Logger';

export interface FirebaseActivity {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerAvatar: string;
  type: string;
  participants: string[];
  status: 'confirmed' | 'voting' | 'planning' | 'completed';
  description?: string;
  votingOptions?: any[];
  responsibilities?: any[];
  chatMessages?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseVote {
  id?: string;
  activityId: string;
  optionId: string;
  voterId: string;
  voterName: string;
  createdAt: Date;
}

export interface FirebaseResponsibility {
  id?: string;
  activityId: string;
  memberId: string;
  memberName: string;
  task: string;
  status: 'pending' | 'completed';
  createdAt: Date;
}

class RealCalendarService {
  private unsubscribeCallback?: () => void;

  async createActivity(activityData: Omit<FirebaseActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const activity: FirebaseActivity = {
        ...activityData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await RealDatabaseService.createDocument(
        `families/${user.uid}/calendar_activities`,
        activity
      );

      if (!result.success || !result.data) {
        throw new Error('Failed to create activity');
      }

      Logger.debug('✅ Activity created in Firebase:', result.data.id);
      return result.data.id;
    } catch (error) {
      Logger.error('❌ Error creating activity:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, updates: Partial<FirebaseActivity>): Promise<void> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await RealDatabaseService.updateDocument(
        `families/${user.uid}/calendar_activities`,
        activityId,
        { ...updates, updatedAt: new Date() }
      );

      Logger.debug('✅ Activity updated in Firebase:', activityId);
    } catch (error) {
      Logger.error('❌ Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await RealDatabaseService.deleteDocument(
        `families/${user.uid}/calendar_activities`,
        activityId
      );

      Logger.debug('✅ Activity deleted from Firebase:', activityId);
    } catch (error) {
      Logger.error('❌ Error deleting activity:', error);
      throw error;
    }
  }

  async getActivities(): Promise<FirebaseActivity[]> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const result = await RealDatabaseService.getDocuments(
        `families/${user.uid}/calendar_activities`
      );

      if (!result.success || !result.data) {
        Logger.error('Failed to get activities:', result.error);
        return [];
      }

      return result.data.map(doc => ({
        id: doc.id,
        ...doc,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      })) as FirebaseActivity[];
    } catch (error) {
      Logger.error('❌ Error getting activities:', error);
      return []; // Return empty array on error
    }
  }

  async getActivitiesByDate(date: string): Promise<FirebaseActivity[]> {
    try {
      const activities = await this.getActivities();
      return activities
        .filter(a => a.date === date)
        .sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      Logger.error('❌ Error getting activities by date:', error);
      return [];
    }
  }

  async getActivitiesByStatus(status: string): Promise<FirebaseActivity[]> {
    try {
      const activities = await this.getActivities();
      return activities.filter(a => a.status === status);
    } catch (error) {
      Logger.error('❌ Error getting activities by status:', error);
      return [];
    }
  }

  async getVotingActivities(): Promise<FirebaseActivity[]> {
    try {
      return await this.getActivitiesByStatus('voting');
    } catch (error) {
      Logger.error('❌ Error getting voting activities:', error);
      return [];
    }
  }

  async voteOnActivity(activityId: string, optionId: string): Promise<void> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const vote: FirebaseVote = {
        activityId,
        optionId,
        voterId: user.uid,
        voterName: user.displayName || 'Unknown User',
        createdAt: new Date(),
      };

      await RealDatabaseService.createDocument(
        `families/${user.uid}/calendar_activities/${activityId}/votes`,
        vote
      );

      Logger.debug('✅ Vote recorded in Firebase');
    } catch (error) {
      Logger.error('❌ Error voting on activity:', error);
      throw error;
    }
  }

  async assignResponsibility(activityId: string, memberId: string, task: string): Promise<void> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const responsibility: FirebaseResponsibility = {
        activityId,
        memberId,
        memberName: 'Unknown Member', // TODO: Get member name from family store
        task,
        status: 'pending',
        createdAt: new Date(),
      };

      await RealDatabaseService.createDocument(
        `families/${user.uid}/calendar_activities/${activityId}/responsibilities`,
        responsibility
      );

      Logger.debug('✅ Responsibility assigned in Firebase');
    } catch (error) {
      Logger.error('❌ Error assigning responsibility:', error);
      throw error;
    }
  }

  // Real-time subscription to activities
  async subscribeToActivities(callback: (activities: FirebaseActivity[]) => void): Promise<() => void> {
    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) {
        console.warn('⚠️ No user authenticated for calendar');
        // Return empty callback instead of throwing error
        callback([]);
        return () => { };
      }

      Logger.debug('🗓️ Setting up calendar real-time subscription for user:', user.uid);

      const unsubscribe = RealDatabaseService.listenToCollection<FirebaseActivity>(
        `families/${user.uid}/calendar_activities`,
        (activities, error) => {
          if (error) {
            Logger.error('❌ Error in real-time activities subscription:', error);
          } else {
            const formattedActivities = activities.map(doc => ({
              id: doc.id,
              ...doc,
              createdAt: doc.createdAt || new Date(),
              updatedAt: doc.updatedAt || new Date(),
            })) as FirebaseActivity[];

            callback(formattedActivities);
            Logger.debug('📅 Real-time calendar update:', formattedActivities.length, 'activities');
          }
        }
      );

      this.unsubscribeCallback = unsubscribe;
      return unsubscribe;
    } catch (error) {
      Logger.error('❌ Error setting up real-time subscription:', error);
      // Return empty callback instead of throwing error
      callback([]);
      return () => { };
    }
  }

  async cleanup(): Promise<void> {
    if (this.unsubscribeCallback) {
      this.unsubscribeCallback();
      this.unsubscribeCallback = undefined;
      Logger.debug('🧹 Calendar service cleanup completed');
    }
  }
}

// Export singleton instance
export const realCalendarService = new RealCalendarService();
export default realCalendarService;

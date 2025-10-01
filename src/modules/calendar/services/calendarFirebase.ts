import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';

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
  title: string;
  assignedTo: string;
  assignedToAvatar: string;
  dueDate?: string;
  dueTime?: string;
  completed: boolean;
  createdAt: Date;
}

export interface FirebaseChatMessage {
  id?: string;
  activityId: string;
  author: string;
  authorAvatar: string;
  message: string;
  createdAt: Date;
}

class CalendarFirebaseService {
  private activitiesCollection = 'activities';
  private votesCollection = 'votes';
  private responsibilitiesCollection = 'responsibilities';
  private chatMessagesCollection = 'chatMessages';

  // Activities CRUD
  async createActivity(activity: Omit<FirebaseActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, this.activitiesCollection), {
        ...activity,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, updates: Partial<FirebaseActivity>): Promise<void> {
    try {
      const activityRef = doc(db, this.activitiesCollection, activityId);
      await updateDoc(activityRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.activitiesCollection, activityId));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  async getActivities(): Promise<FirebaseActivity[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.activitiesCollection));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FirebaseActivity[];
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  }

  async getActivitiesByDate(date: string): Promise<FirebaseActivity[]> {
    try {
      const q = query(
        collection(db, this.activitiesCollection),
        where('date', '==', date),
        orderBy('time', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FirebaseActivity[];
    } catch (error) {
      console.error('Error getting activities by date:', error);
      throw error;
    }
  }

  async getActivitiesByStatus(status: string): Promise<FirebaseActivity[]> {
    try {
      const q = query(
        collection(db, this.activitiesCollection),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FirebaseActivity[];
    } catch (error) {
      console.error('Error getting activities by status:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToActivities(callback: (activities: FirebaseActivity[]) => void): () => void {
    const q = query(collection(db, this.activitiesCollection), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FirebaseActivity[];
      
      callback(activities);
    }, (error) => {
      console.error('Error in activities subscription:', error);
    });
  }

  subscribeToActivitiesByDate(date: string, callback: (activities: FirebaseActivity[]) => void): () => void {
    const q = query(
      collection(db, this.activitiesCollection),
      where('date', '==', date),
      orderBy('time', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FirebaseActivity[];
      
      callback(activities);
    }, (error) => {
      console.error('Error in activities by date subscription:', error);
    });
  }

  // Votes
  async addVote(vote: Omit<FirebaseVote, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.votesCollection), {
        ...vote,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  }

  async getVotesByActivity(activityId: string): Promise<FirebaseVote[]> {
    try {
      const q = query(
        collection(db, this.votesCollection),
        where('activityId', '==', activityId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FirebaseVote[];
    } catch (error) {
      console.error('Error getting votes:', error);
      throw error;
    }
  }

  // Responsibilities
  async createResponsibility(responsibility: Omit<FirebaseResponsibility, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.responsibilitiesCollection), {
        ...responsibility,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating responsibility:', error);
      throw error;
    }
  }

  async updateResponsibility(responsibilityId: string, updates: Partial<FirebaseResponsibility>): Promise<void> {
    try {
      const responsibilityRef = doc(db, this.responsibilitiesCollection, responsibilityId);
      await updateDoc(responsibilityRef, updates);
    } catch (error) {
      console.error('Error updating responsibility:', error);
      throw error;
    }
  }

  async getResponsibilitiesByActivity(activityId: string): Promise<FirebaseResponsibility[]> {
    try {
      const q = query(
        collection(db, this.responsibilitiesCollection),
        where('activityId', '==', activityId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FirebaseResponsibility[];
    } catch (error) {
      console.error('Error getting responsibilities:', error);
      throw error;
    }
  }

  // Chat Messages
  async addChatMessage(message: Omit<FirebaseChatMessage, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.chatMessagesCollection), {
        ...message,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  }

  async getChatMessagesByActivity(activityId: string): Promise<FirebaseChatMessage[]> {
    try {
      const q = query(
        collection(db, this.chatMessagesCollection),
        where('activityId', '==', activityId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FirebaseChatMessage[];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  subscribeToChatMessages(activityId: string, callback: (messages: FirebaseChatMessage[]) => void): () => void {
    const q = query(
      collection(db, this.chatMessagesCollection),
      where('activityId', '==', activityId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FirebaseChatMessage[];
      
      callback(messages);
    }, (error) => {
      console.error('Error in chat messages subscription:', error);
    });
  }
}

export const calendarFirebaseService = new CalendarFirebaseService();

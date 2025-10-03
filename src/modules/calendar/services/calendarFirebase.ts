// Mock Calendar Firebase Service - Replaces Firebase with local storage
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

  // Mock data storage
  private mockActivities: FirebaseActivity[] = [];
  private mockVotes: FirebaseVote[] = [];
  private mockResponsibilities: FirebaseResponsibility[] = [];
  private mockChatMessages: FirebaseChatMessage[] = [];

  // Activities CRUD
  async createActivity(activity: Omit<FirebaseActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const newActivity: FirebaseActivity = {
        ...activity,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      };
      this.mockActivities.push(newActivity);
      return newActivity.id!;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, updates: Partial<FirebaseActivity>): Promise<void> {
    try {
      const index = this.mockActivities.findIndex(a => a.id === activityId);
      if (index !== -1) {
        this.mockActivities[index] = {
          ...this.mockActivities[index],
          ...updates,
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      this.mockActivities = this.mockActivities.filter(a => a.id !== activityId);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  async getActivities(): Promise<FirebaseActivity[]> {
    try {
      return [...this.mockActivities];
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  }

  async getActivitiesByDate(date: string): Promise<FirebaseActivity[]> {
    try {
      return this.mockActivities
        .filter(a => a.date === date)
        .sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      console.error('Error getting activities by date:', error);
      throw error;
    }
  }

  async getActivitiesByStatus(status: string): Promise<FirebaseActivity[]> {
    try {
      return this.mockActivities
        .filter(a => a.status === status)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting activities by status:', error);
      throw error;
    }
  }

  // Real-time listeners (mock with setTimeout)
  subscribeToActivities(callback: (activities: FirebaseActivity[]) => void): () => void {
    callback([...this.mockActivities]);
    
    // Mock real-time updates every 5 seconds
    const interval = setInterval(() => {
      callback([...this.mockActivities]);
    }, 5000);

    return () => clearInterval(interval);
  }

  subscribeToActivitiesByDate(date: string, callback: (activities: FirebaseActivity[]) => void): () => void {
    const filteredActivities = this.mockActivities
      .filter(a => a.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
    
    callback(filteredActivities);
    
    const interval = setInterval(() => {
      const updatedActivities = this.mockActivities
        .filter(a => a.date === date)
        .sort((a, b) => a.time.localeCompare(b.time));
      callback(updatedActivities);
    }, 5000);

    return () => clearInterval(interval);
  }

  // Votes
  async addVote(vote: Omit<FirebaseVote, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newVote: FirebaseVote = {
        ...vote,
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };
      this.mockVotes.push(newVote);
      return newVote.id!;
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  }

  async getVotesByActivity(activityId: string): Promise<FirebaseVote[]> {
    try {
      return this.mockVotes
        .filter(v => v.activityId === activityId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting votes:', error);
      throw error;
    }
  }

  // Responsibilities
  async createResponsibility(responsibility: Omit<FirebaseResponsibility, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newResponsibility: FirebaseResponsibility = {
        ...responsibility,
        id: `responsibility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };
      this.mockResponsibilities.push(newResponsibility);
      return newResponsibility.id!;
    } catch (error) {
      console.error('Error creating responsibility:', error);
      throw error;
    }
  }

  async updateResponsibility(responsibilityId: string, updates: Partial<FirebaseResponsibility>): Promise<void> {
    try {
      const index = this.mockResponsibilities.findIndex(r => r.id === responsibilityId);
      if (index !== -1) {
        this.mockResponsibilities[index] = {
          ...this.mockResponsibilities[index],
          ...updates
        };
      }
    } catch (error) {
      console.error('Error updating responsibility:', error);
      throw error;
    }
  }

  async getResponsibilitiesByActivity(activityId: string): Promise<FirebaseResponsibility[]> {
    try {
      return this.mockResponsibilities
        .filter(r => r.activityId === activityId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } catch (error) {
      console.error('Error getting responsibilities:', error);
      throw error;
    }
  }

  // Chat Messages
  async addChatMessage(message: Omit<FirebaseChatMessage, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newMessage: FirebaseChatMessage = {
        ...message,
        id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };
      this.mockChatMessages.push(newMessage);
      return newMessage.id!;
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  }

  async getChatMessagesByActivity(activityId: string): Promise<FirebaseChatMessage[]> {
    try {
      return this.mockChatMessages
        .filter(m => m.activityId === activityId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  subscribeToChatMessages(activityId: string, callback: (messages: FirebaseChatMessage[]) => void): () => void {
    const filteredMessages = this.mockChatMessages
      .filter(m => m.activityId === activityId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    callback(filteredMessages);
    
    const interval = setInterval(() => {
      const updatedMessages = this.mockChatMessages
        .filter(m => m.activityId === activityId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      callback(updatedMessages);
    }, 5000);

    return () => clearInterval(interval);
  }
}

export const calendarFirebaseService = new CalendarFirebaseService();
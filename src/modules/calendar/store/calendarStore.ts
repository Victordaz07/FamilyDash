/**
 * Calendar Store with Firebase Integration
 * Real-time calendar management with Firebase Firestore
 */

import { create } from 'zustand';
import React from 'react';
import { 
  RealDatabaseService, 
  RealAuthService, 
  trackEvent 
} from '../../../services';

export interface CalendarEvent {
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

interface CalendarState {
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  isLoading: boolean;
  error: string | null;
  subscription?: () => void;

  // Actions
  initializeCalendar: () => Promise<void>;
  setSelectedEvent: (id: string) => void;
  clearSelectedEvent: () => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Voting & Responsibilities
  voteOnEvent: (eventId: string, optionId: string) => Promise<{ success: boolean; error?: string }>;
  assignResponsibility: (eventId: string, memberId: string, task: string) => Promise<{ success: boolean; error?: string }>;

  // Getters
  getEventsByDate: (date: string) => CalendarEvent[];
  getEventsByStatus: (status: string) => CalendarEvent[];
  getVotingEvents: () => CalendarEvent[];
  
  // Connection & Sync
  checkConnection: () => Promise<boolean>;
  reconnect: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedEvent: undefined,
  isLoading: false,
  error: null,
  subscription: undefined,

  initializeCalendar: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      console.log('📅 Initializing calendar with Firebase...');
      
      // Check Firebase connection
      const isConnected = await RealDatabaseService.checkConnection();
      if (!isConnected) {
        console.log('⚠️ Firebase connection failed, calendar offline');
        set({
          events: [],
          isLoading: false,
          error: 'Firebase connection unavailable'
        });
        return;
      }

      // Get current user
      const user = RealAuthService.getCurrentUser();
      if (!user) {
        console.log('⚠️ No user authenticated for calendar');
        set({ isLoading: false, error: 'User not authenticated' });
        return;
      }

      // Set up real-time listener for calendar events
      const unsubscribe = RealDatabaseService.listenToCollection<CalendarEvent>(
        `families/${user.uid}/calendar/events`,
        (events, error) => {
          if (error) {
            console.error('❌ Error listening to calendar events:', error);
            set({ error: error, isLoading: false });
          } else {
            console.log(`📅 Real-time update: ${events.length} events received`);
            
            // Format events with proper date handling
            const formattedEvents = events.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as CalendarEvent[];
            
            set({
              events: formattedEvents,
              isLoading: false,
              error: null
            });
          }
        }
      );

      // Store unsubscribe function
      set({ subscription: unsubscribe });

      // Track calendar initialization
      trackEvent('calendar_initialized', {
        userId: user.uid,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Calendar initialized with Firebase successfully');

    } catch (error) {
      console.error('❌ Error initializing calendar:', error);
      set({ 
        isLoading: false, 
        error: `Calendar initialization failed: ${error.message}`
      });
    }
  },

  setSelectedEvent: (id: string) => {
    const event = get().events.find(e => e.id === id);
    set({ selectedEvent: event });
  },

  clearSelectedEvent: () => {
    set({ selectedEvent: undefined });
  },

  addEvent: async (eventData) => {
    try {
      set({ isLoading: true });
      
      const user = RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const event: CalendarEvent = {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create document in Firebase
      const docRef = await RealDatabaseService.createDocument(
        `families/${user.uid}/calendar/events`
      );
      
      await RealDatabaseService.updateDocument(docRef.id, event);
      
      trackEvent('event_created', {
        userId: user.uid,
        eventId: docRef.id,
        eventType: event.type,
        participants: event.participants.length
      });

      set({ isLoading: false });
      console.log('✅ Event created successfully:', docRef.id);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error creating event:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  updateEvent: async (id, updates) => {
    try {
      set({ isLoading: true });
      
      const user = RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await RealDatabaseService.updateDocument(
        `families/${user.uid}/calendar/events/${id}`,
        { ...updates, updatedAt: new Date() }
      );
      
      trackEvent('event_updated', {
        userId: user.uid,
        eventId: id
      });

      set({ isLoading: false });
      console.log('✅ Event updated successfully:', id);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating event:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  deleteEvent: async (id) => {
    try {
      set({ isLoading: true });
      
      const user = RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await RealDatabaseService.deleteDocument(
        `families/${user.uid}/calendar/events/${id}`
      );
      
      trackEvent('event_deleted', {
        userId: user.uid,
        eventId: id
      });

      set({ isLoading: false });
      console.log('✅ Event deleted successfully:', id);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  voteOnEvent: async (eventId, optionId) => {
    try {
      const user = RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const vote = {
        eventId,
        optionId,
        voterId: user.uid,
        voterName: user.displayName || 'Unknown User',
        createdAt: new Date(),
      };

      await RealDatabaseService.createDocument(
        `families/${user.uid}/calendar/events/${eventId}/votes`
      ).then(docRef => 
        RealDatabaseService.updateDocument(docRef.id, vote)
      );
      
      trackEvent('event_voted', {
        userId: user.uid,
        eventId,
        optionId
      });
      
      console.log('✅ Vote recorded successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error voting on event:', error);
      return { success: false, error: error.message };
    }
  },

  assignResponsibility: async (eventId, memberId, task) => {
    try {
      const user = RealAuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const responsibility: any = {
        eventId,
        memberId,
        memberName: 'Unknown Member', // TODO: Get from family store
        task,
        status: 'pending',
        createdAt: new Date(),
      };

      await RealDatabaseService.createDocument(
        `families/${user.uid}/calendar/events/${eventId}/responsibilities`
      ).then(docRef => 
        RealDatabaseService.updateDocument(docRef.id, responsibility)
      );
      
      trackEvent('responsibility_assigned', {
        userId: user.uid,
        eventId,
        memberId,
        task
      });
      
      console.log('✅ Responsibility assigned successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error assigning responsibility:', error);
      return { success: false, error: error.message };
    }
  },

  getEventsByDate: (date) => {
    const { events } = get();
    return events.filter(event => event.date === date);
  },

  getEventsByStatus: (status) => {
    const { events } = get();
    return events.filter(event => event.status === status);
  },

  getVotingEvents: () => {
    const { events } = get();
    return events.filter(event => event.status === 'voting');
  },

  checkConnection: async () => {
    try {
      return await RealDatabaseService.checkConnection();
    } catch (error) {
      console.error('❌ Error checking calendar connection:', error);
      return false;
    }
  },

  reconnect: async () => {
    const { subscription } = get();
    
    if (subscription) {
      subscription(); // Unsubscribe from previous listener
    }
    
    set({ subscription: undefined, error: null });
    await get().initializeCalendar();
    console.log('🔄 Calendar reconnected to Firebase');
  },
}));

// Auto-initialize calendar when store is created
useCalendarStore.getState().initializeCalendar();

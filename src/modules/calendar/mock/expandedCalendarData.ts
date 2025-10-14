import { CalendarEvent, FamilyMember } from '@/types/calendarTypes';

// CLEAN DATA - Empty state ready for real connections
export const mockFamilyMembers: FamilyMember[] = [];

// CLEAN DATA - Empty events ready for real connections  
export const mockCalendarEvents: CalendarEvent[] = [];

export const categoryConfig = {
    school: { color: '#3B82F6', icon: 'school', name: 'School' },
    shopping: { color: '#10B981', icon: 'cart', name: 'Shopping' },
    church: { color: '#8B5CF6', icon: 'business', name: 'Church' },
    sports: { color: '#F59E0B', icon: 'football', name: 'Sports' },
    entertainment: { color: '#F97316', icon: 'film', name: 'Entertainment' },
    family: { color: '#EC4899', icon: 'people', name: 'Family' },
    education: { color: '#3B82F6', icon: 'book', name: 'Education' },
    chores: { color: '#10B981', icon: 'brush', name: 'Chores' },
    health: { color: '#EF4444', icon: 'medical', name: 'Health' },
    other: { color: '#6B7280', icon: 'ellipsis-horizontal', name: 'Other' }
};





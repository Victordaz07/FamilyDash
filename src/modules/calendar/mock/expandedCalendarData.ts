import { CalendarEvent, FamilyMember } from '../types/calendarTypes';

export const mockFamilyMembers: FamilyMember[] = [
    {
        id: 'dad',
        name: 'Dad',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        role: 'parent'
    },
    {
        id: 'mom',
        name: 'Mom',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        role: 'parent'
    },
    {
        id: 'ariella',
        name: 'Ariella',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        role: 'teen',
        age: 12
    },
    {
        id: 'noah',
        name: 'Noah',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        role: 'child',
        age: 8
    }
];

export const mockCalendarEvents: CalendarEvent[] = [
    {
        id: "1",
        title: "Emma's Piano Lesson",
        category: "school",
        date: "2025-10-02",
        startTime: "16:00",
        endTime: "17:00",
        location: "Music Academy",
        participants: ["ariella", "dad"],
    },
    {
        id: "2",
        title: "Grocery Shopping",
        category: "shopping",
        date: "2025-10-02",
        startTime: "18:30",
        endTime: "19:30",
        location: "Whole Foods",
        participants: ["mom", "dad", "ariella", "noah"],
    },
    {
        id: "3",
        title: "Family Movie Night",
        category: "entertainment",
        date: "2025-10-03",
        startTime: "20:00",
        endTime: "22:00",
        participants: ["mom", "dad", "ariella", "noah"],
    },
    {
        id: "4",
        title: "Sunday Church Service",
        category: "church",
        date: "2025-10-05",
        startTime: "10:00",
        endTime: "11:30",
        location: "St. Mary's Church",
        participants: ["mom", "dad", "ariella", "noah"],
    },
    {
        id: "5",
        title: "Noah's Soccer Practice",
        category: "sports",
        date: "2025-10-07",
        startTime: "15:30",
        endTime: "16:30",
        location: "Community Field",
        participants: ["noah", "dad"],
    },
    {
        id: "6",
        title: "Parent-Teacher Conference",
        category: "school",
        date: "2025-10-10",
        startTime: "14:00",
        endTime: "15:00",
        location: "Elementary School",
        participants: ["mom", "dad"],
    },
    {
        id: "7",
        title: "Birthday Party Planning",
        category: "other",
        date: "2025-10-12",
        startTime: "19:00",
        endTime: "20:00",
        participants: ["mom", "ariella"],
    },
    {
        id: "8",
        title: "Weekend Hike",
        category: "entertainment",
        date: "2025-10-13",
        startTime: "09:00",
        endTime: "12:00",
        location: "Mountain Trail",
        participants: ["mom", "dad", "ariella", "noah"],
    }
];

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

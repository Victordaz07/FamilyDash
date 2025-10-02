export type ActivityCategory =
    | "school"
    | "shopping"
    | "church"
    | "sports"
    | "entertainment"
    | "family"
    | "education"
    | "chores"
    | "health"
    | "other";

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    category: ActivityCategory;
    date: string; // ISO date "2025-10-02"
    startTime: string; // "16:00"
    endTime: string;   // "17:00"
    location?: string;
    participants: string[]; // family member ids
    reminder?: "10m" | "1h" | "1d";
    isRecurring?: boolean;
    recurringType?: "none" | "daily" | "weekly" | "monthly";
    priority?: "low" | "medium" | "high";
    color?: string;
    createdAt?: number;
    updatedAt?: number;
}

export interface FamilyMember {
    id: string;
    name: string;
    avatar: string;
    role: 'parent' | 'child' | 'teen';
    age?: number;
}

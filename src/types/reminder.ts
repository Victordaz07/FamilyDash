export type ReminderType = "task" | "event" | "appointment" | "deadline" | "custom";
export type ReminderPriority = "low" | "medium" | "high" | "urgent";

export type FamilyReminder = {
  id?: string;
  familyId: string;
  title: string;
  description?: string;
  type: ReminderType;
  priority: ReminderPriority;
  scheduledFor: string;         // ISO date when reminder should trigger
  timeUntilEvent: string;       // "in 2 hours", "in 4 hours", etc.
  participants: string[];       // userIds
  location?: string;
  isActive: boolean;
  isCompleted: boolean;
  createdBy: string;            // userId
  createdAt?: any;
  updatedAt?: any;
};

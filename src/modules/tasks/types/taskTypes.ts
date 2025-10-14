export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "completed" | "overdue";

export interface TaskAttachment {
  type: "video" | "image" | "doc";
  title: string;
  url: string;
  duration?: string;
}

export interface TaskNote {
  author: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: string; // family member ID
  dueDate: string; // ISO format
  status: TaskStatus;
  steps: string[];
  attachments?: TaskAttachment[];
  progress: number; // 0–100
  points: number;
  notes?: TaskNote[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: "parent" | "child";
}

export interface TaskFilter {
  memberId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}





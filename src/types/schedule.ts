export type RepeatKind = "once" | "daily" | "weekdays" | "weekly" | "custom";
export type Weekday = 0|1|2|3|4|5|6; // 0=Sun ... 6=Sat

export type FamilySchedule = {
  id?: string;
  familyId: string;
  title: string;
  notes?: string;
  timeISO: string;         // "2025-10-08T07:00:00.000Z" (hora base)
  repeat: {
    kind: RepeatKind;
    weekdays?: Weekday[];  // si kind === "weekly" o "custom"
  };
  members?: string[];      // userIds
  color?: string;          // "#3b82f6" etc.
  isActive: boolean;
  createdBy: string;       // userId
  createdAt?: any;
  updatedAt?: any;
};

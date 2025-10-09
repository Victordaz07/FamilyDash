export type NotifChannelKey = "family_schedules" | "upcoming_reminders";

export type QuietHours = { enabled: boolean; start: string; end: string }; // "HH:mm"
export type DayFilters = { enabled: boolean; allowedWeekdays: number[] };  // 0..6

export type ChannelOverrides = {
  [K in NotifChannelKey]?: { enabled: boolean; sound?: boolean; vibration?: boolean };
};

export type NotificationSettings = {
  id?: string;
  familyId: string;
  userId: string;
  enableAll: boolean;
  sound: boolean;            // default sound
  vibration: boolean;        // default vibration
  quietHours: QuietHours;
  dayFilters: DayFilters;
  channels: ChannelOverrides;
  createdAt?: any;
  updatedAt?: any;
};

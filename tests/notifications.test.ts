/**
 * 🧪 NOTIFICATIONS TESTS
 * Tests for notification system functionality
 */

import { act } from "@testing-library/react-native";
import { useAppStore } from "@/store";
import { NotificationSettings } from "@/types/notifications";

// Mock notification services
jest.mock("@/services/notifications/expoNotifications", () => ({
  scheduleLocalNotification: jest.fn(() => Promise.resolve("test-id")),
  registerForPushAsync: jest.fn(() => Promise.resolve("test-token")),
  initializeNotificationChannels: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/services/notifications/dndService", () => {
  const actual = jest.requireActual("@/services/notifications/dndService");
  return {
    ...actual,
    scheduleNotificationWithDND: jest.fn(() => Promise.resolve(true)),
    rescheduleDailyReminderAvoidingDND: jest.fn(() => Promise.resolve()),
  };
});

// Import the actual DND functions for testing after mocking
const { isWithinDND, isTimeWithinDND } = jest.requireActual("@/services/notifications/dndService");

describe("Notifications System", () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => useAppStore.setState({
      notifications: {},
      unreadCount: 0,
      settings: {
        dnd: { enabled: false, start: "22:00", end: "07:00" },
        channels: { tasks: true, achievements: true, general: true },
        dailyReminder: { enabled: true, hour: 20, minute: 0 },
      },
      pushTokens: {},
    }, true));
  });

  test("adds notification and updates unread count", () => {
    const notification = {
      id: "test-notification",
      type: "task_completed" as const,
      title: "Test Notification",
      body: "Test body",
      createdAt: Date.now(),
      read: false,
      channel: "tasks" as const,
    };

    act(() => {
      useAppStore.getState().addNotification(notification);
    });

    const state = useAppStore.getState();
    expect(state.notifications["test-notification"]).toEqual(notification);
    expect(state.unreadCount).toBe(1);
  });

  test("marks notification as read and decreases unread count", () => {
    const notification = {
      id: "test-notification",
      type: "task_completed" as const,
      title: "Test Notification",
      body: "Test body",
      createdAt: Date.now(),
      read: false,
      channel: "tasks" as const,
    };

    act(() => {
      useAppStore.getState().addNotification(notification);
    });

    expect(useAppStore.getState().unreadCount).toBe(1);

    act(() => {
      useAppStore.getState().markAsRead("test-notification");
    });

    const state = useAppStore.getState();
    expect(state.notifications["test-notification"].read).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  test("marks all notifications as read", () => {
    const notifications = [
      {
        id: "notification-1",
        type: "task_completed" as const,
        title: "Test 1",
        body: "Body 1",
        createdAt: Date.now(),
        read: false,
        channel: "tasks" as const,
      },
      {
        id: "notification-2",
        type: "achievement_unlocked" as const,
        title: "Test 2",
        body: "Body 2",
        createdAt: Date.now(),
        read: false,
        channel: "achievements" as const,
      },
    ];

    act(() => {
      notifications.forEach(notif => useAppStore.getState().addNotification(notif));
    });

    expect(useAppStore.getState().unreadCount).toBe(2);

    act(() => {
      useAppStore.getState().markAllAsRead();
    });

    const state = useAppStore.getState();
    expect(state.unreadCount).toBe(0);
    expect(state.notifications["notification-1"].read).toBe(true);
    expect(state.notifications["notification-2"].read).toBe(true);
  });

  test("updates notification settings", () => {
    const newSettings: Partial<NotificationSettings> = {
      channels: {
        tasks: false,
        achievements: true,
        general: false,
      },
      dnd: {
        enabled: true,
        start: "23:00",
        end: "08:00",
      },
    };

    act(() => {
      useAppStore.getState().setSettings(newSettings);
    });

    const state = useAppStore.getState();
    expect(state.settings.channels.tasks).toBe(false);
    expect(state.settings.channels.achievements).toBe(true);
    expect(state.settings.channels.general).toBe(false);
    expect(state.settings.dnd.enabled).toBe(true);
    expect(state.settings.dnd.start).toBe("23:00");
    expect(state.settings.dnd.end).toBe("08:00");
  });

  test("adds push token", () => {
    const pushToken = {
      token: "test-push-token",
      platform: "android" as const,
      createdAt: Date.now(),
    };

    act(() => {
      useAppStore.getState().addPushToken(pushToken);
    });

    const state = useAppStore.getState();
    expect(state.pushTokens["test-push-token"]).toEqual(pushToken);
  });

  test("removes push token", () => {
    const pushToken = {
      token: "test-push-token",
      platform: "android" as const,
      createdAt: Date.now(),
    };

    act(() => {
      useAppStore.getState().addPushToken(pushToken);
    });

    expect(useAppStore.getState().pushTokens["test-push-token"]).toBeDefined();

    act(() => {
      useAppStore.getState().removePushToken("test-push-token");
    });

    const state = useAppStore.getState();
    expect(state.pushTokens["test-push-token"]).toBeUndefined();
  });
});

describe("DND Service", () => {
  test("isWithinDND returns false when DND is disabled", () => {
    const settings = { enabled: false, start: "22:00", end: "07:00" };
    expect(isWithinDND(settings)).toBe(false);
  });

  test("isTimeWithinDND returns false when DND is disabled", () => {
    const settings = { enabled: false, start: "22:00", end: "07:00" };
    const testDate = new Date("2024-01-01T23:00:00");
    expect(isTimeWithinDND(testDate, settings)).toBe(false);
  });

  test("isTimeWithinDND handles same-day DND correctly", () => {
    const settings = { enabled: true, start: "10:00", end: "18:00" };
    
    // Within DND hours
    const withinDND = new Date("2024-01-01T14:00:00");
    expect(isTimeWithinDND(withinDND, settings)).toBe(true);
    
    // Outside DND hours
    const outsideDND = new Date("2024-01-01T20:00:00");
    expect(isTimeWithinDND(outsideDND, settings)).toBe(false);
  });

  test("isTimeWithinDND handles midnight-crossing DND correctly", () => {
    const settings = { enabled: true, start: "22:00", end: "07:00" };
    
    // Within DND hours (night)
    const nightTime = new Date("2024-01-01T23:00:00");
    expect(isTimeWithinDND(nightTime, settings)).toBe(true);
    
    // Within DND hours (early morning)
    const earlyMorning = new Date("2024-01-01T06:00:00");
    expect(isTimeWithinDND(earlyMorning, settings)).toBe(true);
    
    // Outside DND hours (daytime)
    const dayTime = new Date("2024-01-01T14:00:00");
    expect(isTimeWithinDND(dayTime, settings)).toBe(false);
  });
});

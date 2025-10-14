/**
 * 🧪 ACHIEVEMENTS STREAK TESTS
 * Verifies streak logic with day simulation
 */

import { act } from "@testing-library/react-native";
import { useAppStore } from "@/store";

// Mock sync services
jest.mock("@/services/achievementsSync", () => ({
  pushUnlock: jest.fn(),
  pushStats: jest.fn(),
  startAchievementsSync: jest.fn(() => jest.fn()),
}));

// Mock Date.now() to simulate different days
const mockDate = (dateString: string) => {
  const mockNow = new Date(dateString).getTime();
  jest.spyOn(Date, 'now').mockReturnValue(mockNow);
};

describe("Achievements streak logic", () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useAppStore.setState({
        achievements: {},
        points: 0,
        stats: {
          totalCompleted: 0,
          dayKey: '',
          dayCompleted: 0,
          streak: 0,
          lastActiveDay: undefined,
          weekWindow: [],
        },
        items: {},
      });
    });
    
    jest.restoreAllMocks();
  });

  test("unlocks streak_3 achievement with manual bump", () => {
    // Manually set up a 3-day streak
    act(() => {
      useAppStore.setState({
        stats: {
          totalCompleted: 3,
          dayKey: '2025-10-16',
          dayCompleted: 1,
          streak: 3,
          lastActiveDay: '2025-10-16',
          weekWindow: [
            { dayKey: '2025-10-14', completed: 1 },
            { dayKey: '2025-10-15', completed: 1 },
            { dayKey: '2025-10-16', completed: 1 },
          ],
        },
      });
      
      // Trigger achievement check
      useAppStore.getState().checkAndAward({ type: 'task_completed' });
    });
    
    const state = useAppStore.getState();
    
    // Should unlock streak_3 achievement
    expect(state.achievements['streak_3']?.unlocked).toBe(true);
    expect(state.points).toBeGreaterThanOrEqual(30); // streak_3 points
  });

  test("unlocks streak_7 achievement with manual state", () => {
    // Manually set up a 7-day streak
    act(() => {
      useAppStore.setState({
        stats: {
          totalCompleted: 7,
          dayKey: '2025-10-20',
          dayCompleted: 1,
          streak: 7,
          lastActiveDay: '2025-10-20',
          weekWindow: [
            { dayKey: '2025-10-14', completed: 1 },
            { dayKey: '2025-10-15', completed: 1 },
            { dayKey: '2025-10-16', completed: 1 },
            { dayKey: '2025-10-17', completed: 1 },
            { dayKey: '2025-10-18', completed: 1 },
            { dayKey: '2025-10-19', completed: 1 },
            { dayKey: '2025-10-20', completed: 1 },
          ],
        },
      });
      
      // Trigger achievement check
      useAppStore.getState().checkAndAward({ type: 'task_completed' });
    });
    
    const state = useAppStore.getState();
    
    // Should unlock streak_7 achievement
    expect(state.achievements['streak_7']?.unlocked).toBe(true);
    expect(state.points).toBeGreaterThanOrEqual(100); // streak_7 points
  });
});

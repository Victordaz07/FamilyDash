/**
 * 🧪 ACHIEVEMENTS UNLOCK TESTS
 * Verifies achievement unlock logic and idempotency
 */

import { act } from "@testing-library/react-native";
import { useAppStore } from "@/store";

// Mock sync services
jest.mock("@/services/achievementsSync", () => ({
  pushUnlock: jest.fn(),
  pushStats: jest.fn(),
  startAchievementsSync: jest.fn(() => jest.fn()),
}));

describe("Achievements unlock logic", () => {
  beforeEach(() => {
    // Reset store before each test
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
  });

  test("unlocks first_task after completing 1 task", () => {
    act(() => {
      // Add and complete 1 task
      const id = useAppStore.getState().add({ title: "Test task" });
      useAppStore.getState().toggle(id); // Complete it
    });

    const state = useAppStore.getState();
    
    // Should unlock first_task achievement
    expect(state.achievements['first_task']?.unlocked).toBe(true);
    
    // Should award at least 10 points (may unlock daily_1 too)
    expect(state.points).toBeGreaterThanOrEqual(10);
    
    // Should update stats
    expect(state.stats.totalCompleted).toBe(1);
  });

  test("unlocks five_tasks after completing 5 tasks", () => {
    act(() => {
      // Add and complete 5 tasks
      for (let i = 0; i < 5; i++) {
        const id = useAppStore.getState().add({ title: `Task ${i}` });
        useAppStore.getState().toggle(id);
      }
    });

    const state = useAppStore.getState();
    
    // Should unlock both first_task and five_tasks
    expect(state.achievements['first_task']?.unlocked).toBe(true);
    expect(state.achievements['five_tasks']?.unlocked).toBe(true);
    
    // Should award at least 35 points (may unlock other achievements too)
    expect(state.points).toBeGreaterThanOrEqual(35);
    
    // Should update stats
    expect(state.stats.totalCompleted).toBe(5);
  });

  test("achievement unlock is idempotent", () => {
    act(() => {
      // Manually unlock and add points
      useAppStore.getState().unlock('first_task');
    });

    const points1 = useAppStore.getState().points;

    act(() => {
      // Try to unlock again
      useAppStore.getState().unlock('first_task');
    });

    const points2 = useAppStore.getState().points;

    // Points should not change on second unlock
    expect(points1).toBe(points2);
    expect(points1).toBe(10);
  });

  test("unlocks day_5_tasks after completing 5 tasks in one day", () => {
    act(() => {
      // Complete 5 tasks in the same day
      for (let i = 0; i < 5; i++) {
        const id = useAppStore.getState().add({ title: `Task ${i}` });
        useAppStore.getState().toggle(id);
      }
    });

    const state = useAppStore.getState();
    
    // Should unlock day_5_tasks
    expect(state.achievements['day_5_tasks']?.unlocked).toBe(true);
    
    // Should award points from all achievements
    expect(state.points).toBeGreaterThanOrEqual(40); // At least day_5_tasks points
  });
});

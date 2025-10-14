import { act } from "@testing-library/react-native";
import { useAppStore } from "@/store";
import * as tasksSync from "@/services/tasksSync";

// Mock the push helpers
jest.mock("@/services/tasksSync", () => ({
  pushTaskCreate: jest.fn(),
  pushTaskUpdate: jest.fn(),
  pushTaskDelete: jest.fn(),
  startTasksSync: jest.fn(() => jest.fn()),
}));

describe("Tasks push helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls pushTaskCreate when adding a task", () => {
    let taskId = "";
    act(() => {
      taskId = useAppStore.getState().add({ title: "Test task" });
    });

    expect(tasksSync.pushTaskCreate).toHaveBeenCalledWith(taskId);
  });

  test("calls pushTaskUpdate when toggling a task", () => {
    let taskId = "";
    act(() => {
      taskId = useAppStore.getState().add({ title: "Test task" });
    });
    
    jest.clearAllMocks();
    
    act(() => {
      useAppStore.getState().toggle(taskId);
    });

    expect(tasksSync.pushTaskUpdate).toHaveBeenCalledWith(taskId);
  });

  test("calls pushTaskDelete when removing a task", () => {
    let taskId = "";
    act(() => {
      taskId = useAppStore.getState().add({ title: "Test task" });
    });
    
    jest.clearAllMocks();
    
    act(() => {
      useAppStore.getState().remove(taskId);
    });

    expect(tasksSync.pushTaskDelete).toHaveBeenCalledWith(taskId);
  });
});

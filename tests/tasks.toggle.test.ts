import { act } from "@testing-library/react-native";
import { useAppStore } from "@/store";

test("tasks toggle functionality", () => {
  // Add a task
  let taskId = "";
  act(() => { 
    taskId = useAppStore.getState().add({ title: "Test toggle task" }); 
  });
  
  // Verify task is not done initially
  expect(useAppStore.getState().items[taskId].done).toBe(false);
  
  // Toggle task
  act(() => { 
    useAppStore.getState().toggle(taskId); 
  });
  
  // Verify task is now done
  expect(useAppStore.getState().items[taskId].done).toBe(true);
  
  // Toggle again
  act(() => { 
    useAppStore.getState().toggle(taskId); 
  });
  
  // Verify task is not done again
  expect(useAppStore.getState().items[taskId].done).toBe(false);
});

import { act } from "@testing-library/react-native";
import { useAppStore } from "@/store";

test("tasks CRUD works", () => {
  let id = "";
  act(() => { id = useAppStore.getState().add({ title: "Hola" }); });
  expect(useAppStore.getState().items[id].title).toBe("Hola");
  act(() => { useAppStore.getState().toggle(id); });
  expect(useAppStore.getState().items[id].done).toBe(true);
  act(() => { useAppStore.getState().remove(id); });
  expect(useAppStore.getState().items[id]).toBeUndefined();
});

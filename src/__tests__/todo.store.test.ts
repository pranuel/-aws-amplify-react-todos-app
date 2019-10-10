import { TodoStore } from "../todos/todo.store";
import { ViewModes } from "../todos/viewmodes.model";

describe("TodoStore", () => {
  let todoStore: TodoStore;

  beforeEach(() => {
    todoStore = new TodoStore();
  });

  it("should set the current view mode to 'All' by default", () => {
    expect(todoStore.currentViewMode).toBe(ViewModes.All);
  });

  it("should by default inidicate that data is not loading", () => {
    expect(todoStore.isFetchingData).toBe(false);
  });
});

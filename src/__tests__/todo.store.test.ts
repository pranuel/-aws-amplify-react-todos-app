import { Todo } from "../todos/todo.model";
import { TodoRepository } from "../todos/todo.repository";
import { TodoStore } from "../todos/todo.store";
import { ViewModes } from "../todos/viewmodes.model";

describe("TodoStore", () => {
  let todoStore: TodoStore;
  let todoRepository: TodoRepository;

  beforeEach(() => {
    todoRepository = new TodoRepository();
    todoStore = new TodoStore(todoRepository);
  });

  it("should set the current view mode to 'All' by default", () => {
    expect(todoStore.currentViewMode).toBe(ViewModes.All);
  });

  it("should by default inidicate that data is not loading", () => {
    expect(todoStore.isFetchingData).toBe(false);
  });

  it("should return the number of items left", async () => {
    // arrange
    const todos: Todo[] = [
      {
        description: "foo1",
        id: "1",
        isDone: true,
      },
      {
        description: "foo2",
        id: "2",
        isDone: false,
      },
      {
        description: "foo3",
        id: "3",
        isDone: true,
      },
      {
        description: "foo4",
        id: "4",
        isDone: false,
      },
      {
        description: "foo5",
        id: "5",
        isDone: true,
      },
    ];
    spyOn(todoRepository, "getAllTodos").and.returnValue(
      Promise.resolve(todos),
    );
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.itemsLeft).toBe(2);
  });
});

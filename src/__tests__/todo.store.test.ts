import { TodoFilter } from "../todos/todo-filter.model";
import { Todo } from "../todos/todo.model";
import { TodoRepository } from "../todos/todo.repository";
import { TodoStore } from "../todos/todo.store";

describe("TodoStore", () => {
  let todoStore: TodoStore;
  let todoRepository: TodoRepository;
  let getAllTodosSpy: jasmine.Spy;
  let getActiveTodosSpy: jasmine.Spy;
  let getCompletedTodosSpy: jasmine.Spy;

  beforeEach(() => {
    todoRepository = new TodoRepository();
    getAllTodosSpy = spyOn(todoRepository, "getAllTodos");
    getActiveTodosSpy = spyOn(todoRepository, "getActiveTodos");
    getCompletedTodosSpy = spyOn(todoRepository, "getCompletedTodos");
    todoStore = new TodoStore(todoRepository);
  });

  it("should set the todo filter to 'All' by default", () => {
    expect(todoStore.todoFilter).toBe(TodoFilter.All);
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
    getAllTodosSpy.and.returnValue(Promise.resolve(todos));
    todoStore.todoFilter = TodoFilter.All;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.itemsLeft).toBe(2);
  });

  it("should return true if all todos are done", async () => {
    // arrange
    const todos: Todo[] = [
      {
        description: "foo1",
        id: "1",
        isDone: true,
      },
      {
        description: "foo3",
        id: "3",
        isDone: true,
      },
      {
        description: "foo5",
        id: "5",
        isDone: true,
      },
    ];
    getAllTodosSpy.and.returnValue(Promise.resolve(todos));
    todoStore.todoFilter = TodoFilter.All;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.areAllTodosDone).toBe(true);
  });

  it("should return false if at least one todo is not done", async () => {
    // arrange
    const todos: Todo[] = [
      {
        description: "foo1",
        id: "1",
        isDone: true,
      },
      {
        description: "foo3",
        id: "3",
        isDone: false,
      },
      {
        description: "foo5",
        id: "5",
        isDone: true,
      },
    ];
    getAllTodosSpy.and.returnValue(Promise.resolve(todos));
    todoStore.todoFilter = TodoFilter.All;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.areAllTodosDone).toBe(false);
  });

  it("should return the list of completed (done) todos", async () => {
    // arrange
    const todos: Todo[] = [
      {
        description: "foo1",
        id: "1",
        isDone: true,
      },
      {
        description: "foo3",
        id: "3",
        isDone: false,
      },
      {
        description: "foo5",
        id: "5",
        isDone: true,
      },
    ];
    getAllTodosSpy.and.returnValue(Promise.resolve(todos));
    todoStore.todoFilter = TodoFilter.All;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.completedTodos).toEqual([
      {
        description: "foo1",
        id: "1",
        isDone: true,
      },
      {
        description: "foo5",
        id: "5",
        isDone: true,
      },
    ]);
    expect(todoStore.completedTodos).not.toEqual([
      {
        description: "foo3",
        id: "3",
        isDone: false,
      },
    ]);
  });

  it("should not show an error by default", () => {
    expect(todoStore.error).toBeUndefined();
  });

  it("should show an error if the refresh of todos fails", async () => {
    // arrange
    getAllTodosSpy.and.returnValue(Promise.reject("foo"));
    todoStore.todoFilter = TodoFilter.All;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.error).toBeDefined();
  });

  it("should show an error if the refresh of active todos fails", async () => {
    // arrange
    getActiveTodosSpy.and.returnValue(Promise.reject("foo"));
    todoStore.todoFilter = TodoFilter.Active;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.error).toBeDefined();
  });

  it("should show an error if the refresh of completed todos fails", async () => {
    // arrange
    getCompletedTodosSpy.and.returnValue(Promise.reject("foo"));
    todoStore.todoFilter = TodoFilter.Completed;
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(todoStore.error).toBeDefined();
  });

  it("should only get active todos from the repo if todo filter is set to active", async () => {
    // arrange
    todoStore.todoFilter = TodoFilter.Active;
    getActiveTodosSpy.and.stub();
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(getActiveTodosSpy).toHaveBeenCalled();
  });

  it("should only get completed todos from the repo if todo filter is set to completed", async () => {
    // arrange
    todoStore.todoFilter = TodoFilter.Completed;
    getCompletedTodosSpy.and.stub();
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(getCompletedTodosSpy).toHaveBeenCalled();
  });

  it("should get all todos from the repo if todo filter is set to all", async () => {
    // arrange
    todoStore.todoFilter = TodoFilter.All;
    getAllTodosSpy.and.stub();
    // act
    await todoStore.refreshTodosList();
    // assert
    expect(getAllTodosSpy).toHaveBeenCalled();
  });
});

import React from "react";
import renderer from "react-test-renderer";
import { TodoFilter } from "../todos/todo-filter.model";
import { TodoStoreContract } from "../todos/todo.store.contract";
import { Todos } from "../todos/Todos";

describe("Todos", () => {
  it("should render correctly", () => {
    const mockedTodoStore: TodoStoreContract = {
      // public props
      areAllTodosDone: false,
      completedTodos: [],
      todoFilter: TodoFilter.All,
      editTodo: undefined,
      error: undefined,
      isFetchingData: false,
      itemsLeft: 2,
      newTodoDescription: "foo",
      todos: [
        {
          description: "bar description",
          id: "1",
          isDone: false,
        },
        {
          description: "foo description",
          id: "2",
          isDone: false,
        },
      ],
      // public methods
      initializeStore: jest.fn(),
      refreshTodosList: jest.fn(),
      changeEditingTodoDescription: jest.fn(),
      clearCompletedTodos: jest.fn(),
      createTodo: jest.fn(),
      deleteTodo: jest.fn(),
      dispose: jest.fn(),
      saveTodo: jest.fn(),
      setEditTodo: jest.fn(),
      setNewTodoDescription: jest.fn(),
      showActiveTodos: jest.fn(),
      showAllTodos: jest.fn(),
      showCompletedTodos: jest.fn(),
      toggleAllTodos: jest.fn(),
      updateTodoIsDone: jest.fn(),
    };
    const tree = renderer
      .create(<Todos todoStore={mockedTodoStore} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

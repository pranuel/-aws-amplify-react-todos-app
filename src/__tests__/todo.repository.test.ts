import { API } from "aws-amplify";
import { Todo } from "../todos/todo.model";
import { TodoRepository } from "../todos/todo.repository";

describe("TodoApi", () => {
  let graphqlSpy: jest.SpyInstance;
  let todoRepository: TodoRepository;

  beforeEach(() => {
    todoRepository = new TodoRepository();
    graphqlSpy = jest.spyOn(API, "graphql");
    graphqlSpy.mockReturnValue(Promise.resolve({}));
  });

  describe("should create a proper GraphQL mutation for", () => {
    it("creating a todo", async () => {
      // arrange
      const description = "foo";
      const isDone = false;
      const expectedMutationVariables = {
        variables: {
          input: {
            description: "foo",
            isDone: false,
          },
        },
      };
      // act
      await todoRepository.createTodo(description, isDone);
      // assert
      expect(graphqlSpy).toBeCalledWith(
        expect.objectContaining(expectedMutationVariables),
      );
    });

    it("updating a todo", async () => {
      // arrange
      const todo: Todo = {
        description: "bar",
        id: "1",
        isDone: false,
      };
      const expectedMutationVariables = {
        variables: {
          input: todo,
        },
      };
      // act
      await todoRepository.updateTodo(todo);
      // assert
      expect(graphqlSpy).toBeCalledWith(
        expect.objectContaining(expectedMutationVariables),
      );
    });

    it("deleting a todo", async () => {
      // arrange
      const todo: Todo = {
        description: "bar",
        id: "1",
        isDone: false,
      };
      const expectedMutationVariables = {
        variables: {
          input: {
            id: "1",
          },
        },
      };
      // act
      await todoRepository.deleteTodo(todo);
      // assert
      expect(graphqlSpy).toBeCalledWith(
        expect.objectContaining(expectedMutationVariables),
      );
    });
  });

  describe("should create a proper GraphQL query for getting", () => {
    it("'all todos'", async () => {
      // arrange
      const expectedQueryVariables = {
        variables: { filter: undefined },
      };
      // act
      await todoRepository.getAllTodos();
      // assert
      expect(graphqlSpy).toBeCalledWith(
        expect.objectContaining(expectedQueryVariables),
      );
    });

    it("'completed todos'", async () => {
      // arrange
      const expectedQueryVariables = {
        variables: {
          filter: {
            isDone: { eq: true },
          },
        },
      };
      jest.spyOn(API, "graphql");
      graphqlSpy.mockReturnValue(Promise.resolve({}));
      // act
      await todoRepository.getCompletedTodos();
      // assert
      expect(graphqlSpy).toBeCalledWith(
        expect.objectContaining(expectedQueryVariables),
      );
    });

    it("'active todos'", async () => {
      // arrange
      const expectedQueryVariables = {
        variables: {
          filter: {
            isDone: { eq: false },
          },
        },
      };
      jest.spyOn(API, "graphql");
      graphqlSpy.mockReturnValue(Promise.resolve({}));
      // act
      await todoRepository.getActiveTodos();
      // assert
      expect(graphqlSpy).toBeCalledWith(
        expect.objectContaining(expectedQueryVariables),
      );
    });
  });
});

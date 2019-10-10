import { GraphQLResult } from "@aws-amplify/api/lib/types";
import { API, graphqlOperation } from "aws-amplify";
import {
  CreateTodoMutationVariables,
  DeleteTodoInput,
  ListTodosQuery,
  ModelTodoFilterInput,
  UpdateTodoInput,
} from "../API";
import * as Mutations from "../graphql/mutations";
import { listTodos } from "../graphql/queries";
import { Todo } from "./todo.model";

/*
# API
*/

export class TodoRepository {
  public async getAllTodos() {
    return this.getTodos();
  }

  public async getCompletedTodos() {
    return this.getTodos({
      isDone: { eq: true },
    });
  }

  public async getActiveTodos() {
    return this.getTodos({
      isDone: { eq: false },
    });
  }

  public async createTodo(description: string, isDone: boolean) {
    const createTodoMutationVariables: CreateTodoMutationVariables = {
      input: {
        description,
        isDone,
      },
    };
    await API.graphql(
      graphqlOperation(Mutations.createTodo, createTodoMutationVariables),
    );
  }

  public async updateTodo(todo: Todo) {
    const input: UpdateTodoInput = todo;
    await API.graphql(graphqlOperation(Mutations.updateTodo, { input }));
  }

  public async deleteTodo(todo: Todo) {
    const input: DeleteTodoInput = {
      id: todo.id,
    };
    await API.graphql(graphqlOperation(Mutations.deleteTodo, { input }));
  }

  private async getTodos(filter?: ModelTodoFilterInput): Promise<Todo[]> {
    const allTodosResult = await API.graphql(
      graphqlOperation(listTodos, { filter }),
    );
    if (this.isGraphQLResult(allTodosResult)) {
      const listTodosQuery = allTodosResult.data as ListTodosQuery;
      if (!!listTodosQuery.listTodos) {
        const todos = listTodosQuery.listTodos.items as Todo[];
        return todos;
      }
    }
    return [];
  }

  private isGraphQLResult(result: {}): result is GraphQLResult {
    // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
    return (result as GraphQLResult).data !== undefined;
  }
}

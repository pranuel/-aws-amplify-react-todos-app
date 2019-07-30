import { GraphQLResult } from "@aws-amplify/api/lib/types";
import { API, graphqlOperation } from "aws-amplify";
import {
  CreateTodoMutationVariables,
  DeleteTodoInput,
  ListTodosQuery,
  ModelTodoFilterInput,
  UpdateTodoInput,
} from "./API";
import * as Mutations from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { Todo } from "./todo.model";

/*
# API
*/

export async function getAllTodos() {
  return getTodos();
}

export async function getCompletedTodos() {
  return getTodos({
    isDone: { eq: true },
  });
}

export async function getActiveTodos() {
  return getTodos({
    isDone: { eq: false },
  });
}

export async function createTodo(description: string, isDone: boolean) {
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

export async function updateTodo(todo: Todo) {
  const input: UpdateTodoInput = todo;
  await API.graphql(graphqlOperation(Mutations.updateTodo, { input }));
}

export async function deleteTodo(todo: Todo) {
  const input: DeleteTodoInput = {
    id: todo.id,
  };
  await API.graphql(graphqlOperation(Mutations.deleteTodo, { input }));
}

/*
# Helpers
*/

async function getTodos(filter?: ModelTodoFilterInput): Promise<Todo[]> {
  const allTodosResult = await API.graphql(
    graphqlOperation(listTodos, { filter }),
  );
  if (isGraphQLResult(allTodosResult)) {
    const listTodosQuery = allTodosResult.data as ListTodosQuery;
    if (!!listTodosQuery.listTodos) {
      const todos = listTodosQuery.listTodos.items as Todo[];
      return todos;
    }
  }
  return [];
}

function isGraphQLResult(result: {}): result is GraphQLResult {
  // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
  return (result as GraphQLResult).data !== undefined;
}

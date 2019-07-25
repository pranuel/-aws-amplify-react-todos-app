import { observable, action, computed } from "mobx";
import { Todo } from "./todo.model";
import { ViewModes } from "./viewmodes.model";
import { API, graphqlOperation } from "aws-amplify";
import { listTodos } from "./graphql/queries";
import { GraphQLResult } from '@aws-amplify/api/lib/types';
import Observable from 'zen-observable';
import { CreateTodoMutationVariables, ListTodosQuery, DeleteTodoInput, UpdateTodoInput, ModelTodoFilterInput } from './API';
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations';

export class TodoStore {

  @observable todos: Todo[];
  @observable newTodoDescription: string;
  @observable isLoading: boolean;
  @observable editTodo?: Todo;
  @observable currentViewMode: ViewModes;

  constructor() {
    this.todos = [];
    this.newTodoDescription = '';
    this.isLoading = false;
    this.currentViewMode = ViewModes.All;
  }

  @action
  setEditTodo = (editTodo: Todo) => {
    this.editTodo = editTodo;
  }

  @action
  setNewTodoDescription = (description: string) => {
    this.newTodoDescription = description;
  }

  @action
  fetchTodos = async (filter?: ModelTodoFilterInput) => {
    this.isLoading = true;
    try {
      const allTodosResult = await API.graphql(graphqlOperation(listTodos, { filter }));
      if (this.isGraphQLResult(allTodosResult)) {
        const listTodosQuery = allTodosResult.data as ListTodosQuery;
        if (!!listTodosQuery.listTodos) {
          const allTodos = listTodosQuery.listTodos.items as Todo[];
          this.todos = allTodos;
        }
      }
    } catch (error) {
      console.warn('Error during fetchTodos(): ', error);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  createTodo = async (description: string) => {
    const createTodoMutationVariables: CreateTodoMutationVariables = {
      input: {
        isDone: false,
        description
      }
    };
    
    this.resetNewTodoProperties();
    await API.graphql(graphqlOperation(createTodo, createTodoMutationVariables));
    // update todos list after creating a new one:
    await this.fetchTodos();
  }

  @action
  resetNewTodoProperties = () => {
    this.setNewTodoDescription('');
  }

  deleteTodo = async (todo: Todo) => {
    this.isLoading = true;
    const input: DeleteTodoInput = {
      id: todo.id
    };
    await API.graphql(graphqlOperation(deleteTodo, { input }));
    this.isLoading = false;
    await this.fetchTodos();
  }

  updateTodoIsDone = async (todo: Todo, isDone: boolean) => {
    todo.isDone = isDone;
    this.updateTodo(todo);
  }

  @action
  saveEditedTodo = (todo?: Todo) => {
    if (!todo) {
      return;
    }
    this.updateTodo(todo);
    this.editTodo = undefined;
  }

  @action
  changeEditingTodoDescription = (editTodo?: Todo, description?: string) => {
    if (!editTodo) {
      return;
    }
    editTodo.description = description || '';
  }

  @action
  updateTodo = async (todo: Todo) => {
    this.isLoading = true;
    const input: UpdateTodoInput = todo;
    await API.graphql(graphqlOperation(updateTodo, { input }));
    this.isLoading = false;
    await this.fetchTodos();
  }

  @computed get areAllTodosDone() {
    return this.todos.every(todo => todo.isDone);
  }

  @action
  toggleAllTodos = async () => {
    this.isLoading = true;
    const areAllTodosDone = this.areAllTodosDone;
    const updateTodoPromises = this.todos.map(todo => {
      todo.isDone = !areAllTodosDone;
      return this.updateTodo(todo);
    });
    await updateTodoPromises;
    this.isLoading = false;
  }

  @computed get itemsLeft() {
    return this.todos.filter(todo => !todo.isDone).length;
  }

  @action
  showAllTodos = () => {
    this.fetchTodos();
    this.currentViewMode = ViewModes.All;
  }

  @action
  showActiveTodos = () => {
    const filter: ModelTodoFilterInput = {
      isDone: { eq: false }
    };
    this.fetchTodos(filter);
    this.currentViewMode = ViewModes.Active;
  }

  @action
  showCompletedTodos = () => {
    const filter: ModelTodoFilterInput = {
      isDone: { eq: true }
    };
    this.fetchTodos(filter);
    this.currentViewMode = ViewModes.Completed;
  }

  @computed get completedTodos() {
    return this.todos.filter(todo => todo.isDone);
  }

  @action
  clearCompletedTodos = async () => {
    const deleteTodoPromises = this.completedTodos.map(this.deleteTodo.bind(this));
    await deleteTodoPromises;
    this.fetchTodos();
  }

  private isGraphQLResult(result: GraphQLResult | Observable<object>): result is GraphQLResult {
    // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
    return (result as GraphQLResult).data !== undefined;
  }

}
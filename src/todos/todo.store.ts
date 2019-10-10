import { action, autorun, computed, IReactionDisposer, observable } from "mobx";
import { Todo } from "./todo.model";
import * as Repository from "./todo.repository";
import { TodoStoreContract } from "./todo.store.contract";
import { ViewModes } from "./viewmodes.model";

export class TodoStore implements TodoStoreContract {
  @computed get areAllTodosDone() {
    return this.todos.every((todo) => todo.isDone);
  }

  @computed get itemsLeft() {
    return this.todos.filter((todo) => !todo.isDone).length;
  }

  @computed get completedTodos() {
    return this.todos.filter((todo) => todo.isDone);
  }

  @observable public todos: Todo[];
  @observable public newTodoDescription: string;
  @observable public isLoading: boolean;
  @observable public editTodo?: Todo;
  @observable public currentViewMode: ViewModes;
  @observable public error?: string;
  private readonly autoRunDisposers: IReactionDisposer[];

  constructor() {
    this.todos = [];
    this.newTodoDescription = "";
    this.isLoading = false;
    this.currentViewMode = ViewModes.All;
    this.autoRunDisposers = [];
  }

  public dispose() {
    this.autoRunDisposers.forEach((disposer) => {
      disposer();
    });
  }

  @action
  public setEditTodo = (editTodo: Todo) => {
    this.editTodo = editTodo;
  }

  @action
  public setNewTodoDescription = (description: string) => {
    this.newTodoDescription = description;
  }

  @action
  public refreshTodosList = async () => {
    this.isLoading = true;
    try {
      this.todos = await Repository.getAllTodos();
    } catch (error) {
      this.error = "Error during getAllTodos(): " + error;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  public refreshActiveTodos = async () => {
    this.isLoading = true;
    try {
      this.todos = await Repository.getActiveTodos();
    } catch (error) {
      this.error = "Error during fetchActiveTodos(): " + error;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  public refreshCompletedTodos = async () => {
    this.isLoading = true;
    try {
      this.todos = await Repository.getCompletedTodos();
    } catch (error) {
      this.error = "Error during fetchCompletedTodos(): " + error;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  public createTodo = async (description: string) => {
    this.resetNewTodoProperties();
    this.isLoading = true;
    await Repository.createTodo(description, false);
    await this.fetchTodosDependingOnViewMode();
    this.isLoading = false;
  }

  public deleteTodo = async (todo: Todo) => {
    this.isLoading = true;
    await Repository.deleteTodo(todo);
    await this.fetchTodosDependingOnViewMode();
    this.isLoading = false;
  }

  public updateTodoIsDone = async (todo: Todo, isDone: boolean) => {
    todo.isDone = isDone;
    this.isLoading = true;
    await Repository.updateTodo(todo);
    this.isLoading = false;
  }

  @action
  public saveTodo = async (todo: Todo) => {
    this.isLoading = true;
    await Repository.updateTodo(todo);
    this.isLoading = false;
    this.editTodo = undefined;
  }

  @action
  public changeEditingTodoDescription = (
    editTodo?: Todo,
    description?: string,
  ) => {
    if (!editTodo) {
      return;
    }
    editTodo.description = description || "";
  }

  @action
  public toggleAllTodos = async () => {
    this.isLoading = true;
    const areAllTodosDone = this.areAllTodosDone;
    const updateTodoPromises = this.todos.map((todo) => {
      todo.isDone = !areAllTodosDone;
      return Repository.updateTodo(todo);
    });
    await Promise.all(updateTodoPromises);
    this.isLoading = false;
  }

  @action
  public showAllTodos = () => {
    this.currentViewMode = ViewModes.All;
  }

  @action
  public showActiveTodos = () => {
    this.currentViewMode = ViewModes.Active;
  }

  @action
  public showCompletedTodos = () => {
    this.currentViewMode = ViewModes.Completed;
  }

  @action
  public clearCompletedTodos = async () => {
    const deleteCompletedTodoPromises = this.completedTodos.map(
      this.deleteTodo.bind(this),
    );
    this.isLoading = true;
    await Promise.all(deleteCompletedTodoPromises);
    await this.fetchTodosDependingOnViewMode();
    this.isLoading = false;
  }

  public initializeStore() {
    const reactOnViewModeDisposer = autorun(async () => {
      await this.fetchTodosDependingOnViewMode();
    });
    this.autoRunDisposers.push(reactOnViewModeDisposer);
  }

  @action
  private resetNewTodoProperties = () => {
    this.setNewTodoDescription("");
  }

  private async fetchTodosDependingOnViewMode() {
    switch (this.currentViewMode) {
      case ViewModes.All:
        await this.refreshTodosList();
        break;
      case ViewModes.Active:
        await this.refreshActiveTodos();
        break;
      case ViewModes.Completed:
        await this.refreshCompletedTodos();
        break;
    }
  }
}

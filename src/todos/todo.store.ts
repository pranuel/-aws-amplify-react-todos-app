import { action, autorun, computed, IReactionDisposer, observable } from "mobx";
import { TodoFilter } from "./todo-filter.model";
import { Todo } from "./todo.model";
import { TodoRepository } from "./todo.repository";
import { TodoStoreContract } from "./todo.store.contract";

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
  @observable public isFetchingData: boolean;
  @observable public editTodo?: Todo;
  @observable public todoFilter: TodoFilter;
  @observable public error?: string;
  private readonly autoRunDisposers: IReactionDisposer[];

  constructor(private readonly todoRepository: TodoRepository) {
    this.todos = [];
    this.newTodoDescription = "";
    this.isFetchingData = false;
    this.todoFilter = TodoFilter.All;
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
  public createTodo = async (description: string) => {
    this.resetNewTodoProperties();
    this.isFetchingData = true;
    await this.todoRepository.createTodo(description, false);
    await this.refreshTodosList();
    this.isFetchingData = false;
  }

  @action
  public deleteTodo = async (todo: Todo) => {
    this.isFetchingData = true;
    await this.todoRepository.deleteTodo(todo);
    await this.refreshTodosList();
    this.isFetchingData = false;
  }

  @action
  public updateTodoIsDone = async (todo: Todo, isDone: boolean) => {
    todo.isDone = isDone;
    this.isFetchingData = true;
    await this.todoRepository.updateTodo(todo);
    this.isFetchingData = false;
  }

  @action
  public saveTodo = async (todo: Todo) => {
    this.isFetchingData = true;
    await this.todoRepository.updateTodo(todo);
    this.isFetchingData = false;
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
    this.isFetchingData = true;
    const areAllTodosDone = this.areAllTodosDone;
    const updateTodoPromises = this.todos.map((todo) => {
      todo.isDone = !areAllTodosDone;
      return this.todoRepository.updateTodo(todo);
    });
    await Promise.all(updateTodoPromises);
    this.isFetchingData = false;
  }

  @action
  public showAllTodos = () => {
    this.todoFilter = TodoFilter.All;
  }

  @action
  public showActiveTodos = () => {
    this.todoFilter = TodoFilter.Active;
  }

  @action
  public showCompletedTodos = () => {
    this.todoFilter = TodoFilter.Completed;
  }

  @action
  public clearCompletedTodos = async () => {
    const deleteCompletedTodoPromises = this.completedTodos.map(
      this.deleteTodo.bind(this),
    );
    this.isFetchingData = true;
    await Promise.all(deleteCompletedTodoPromises);
    await this.refreshTodosList();
    this.isFetchingData = false;
  }

  public initializeStore() {
    const reactOnViewModeDisposer = autorun(async () => {
      await this.refreshTodosList();
    });
    this.autoRunDisposers.push(reactOnViewModeDisposer);
  }

  public async refreshTodosList() {
    switch (this.todoFilter) {
      case TodoFilter.All:
        await this.refreshAllTodos();
        break;
      case TodoFilter.Active:
        await this.refreshActiveTodos();
        break;
      case TodoFilter.Completed:
        await this.refreshCompletedTodos();
        break;
    }
  }

  @action
  private refreshAllTodos = async () => {
    this.isFetchingData = true;
    try {
      this.todos = await this.todoRepository.getAllTodos();
    } catch (error) {
      this.error = "Error during getAllTodos(): " + error;
    } finally {
      this.isFetchingData = false;
    }
  }

  @action
  private refreshActiveTodos = async () => {
    this.isFetchingData = true;
    try {
      this.todos = await this.todoRepository.getActiveTodos();
    } catch (error) {
      this.error = "Error during fetchActiveTodos(): " + error;
    } finally {
      this.isFetchingData = false;
    }
  }

  @action
  private refreshCompletedTodos = async () => {
    this.isFetchingData = true;
    try {
      this.todos = await this.todoRepository.getCompletedTodos();
    } catch (error) {
      this.error = "Error during fetchCompletedTodos(): " + error;
    } finally {
      this.isFetchingData = false;
    }
  }

  @action
  private resetNewTodoProperties = () => {
    this.setNewTodoDescription("");
  }
}

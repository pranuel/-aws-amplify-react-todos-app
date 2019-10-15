import { TodoFilter } from "./todo-filter.model";
import { Todo } from "./todo.model";

export interface TodoStoreContract {
  readonly areAllTodosDone: boolean;
  readonly itemsLeft: number;
  readonly completedTodos: Todo[];

  todos: Todo[];
  newTodoDescription: string;
  isFetchingData: boolean;
  editTodo?: Todo;
  todoFilter: TodoFilter;
  error?: string;

  dispose: () => void;
  setEditTodo: (editTodo: Todo) => void;
  setNewTodoDescription: (description: string) => void;
  refreshTodosList: () => Promise<void>;
  createTodo: (description: string) => Promise<void>;
  deleteTodo: (todo: Todo) => Promise<void>;
  updateTodoIsDone: (todo: Todo, isDone: boolean) => Promise<void>;
  saveTodo: (todo: Todo) => Promise<void>;
  changeEditingTodoDescription: (editTodo?: Todo, description?: string) => void;
  toggleAllTodos: () => Promise<void>;
  showAllTodos: () => void;
  showActiveTodos: () => void;
  showCompletedTodos: () => void;
  clearCompletedTodos: () => Promise<void>;
  initializeStore: () => void;
}

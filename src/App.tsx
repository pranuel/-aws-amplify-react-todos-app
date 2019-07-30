import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react"; // or 'aws-amplify-react-native';
import { observer } from "mobx-react";
import React from "react";
import "../node_modules/todomvc-app-css/index.css";
import "../node_modules/todomvc-common/base.css";
import "./App.css";
import awsconfig from "./aws-exports";
import { LoadingIndicator } from "./components/loading-indicator/loading-indicator";
import { TodoListItem } from "./components/todo-list-item";
import { TodosFilter } from "./components/todos-filter";
import { isEnterKey } from "./helpers/keyboard.helper";
import { Todo } from "./todo.model";
import { TodoStore } from "./todo.store";

Amplify.configure(awsconfig);

@observer
class App extends React.Component<{ todoStore: TodoStore }, {}> {
  public componentDidMount() {
    this.props.todoStore.fetchAllTodos();
  }

  public componentWillUnmount() {
    this.props.todoStore.dispose();
  }

  public render() {
    const {
      todos,
      newTodoDescription,
      isLoading,
      itemsLeft,
      areAllTodosDone,
      currentViewMode,
      showAllTodos,
      showActiveTodos,
      showCompletedTodos,
      clearCompletedTodos,
      toggleAllTodos,
    } = this.props.todoStore;
    return (
      <div>
        <section className="todoapp">
          <header className="header">
            <h1>todos</h1>
            {isLoading ? <LoadingIndicator /> : ""}
            <input
              className="new-todo"
              placeholder="What needs to be done?"
              value={newTodoDescription}
              onChange={this.onChangeNewTodoInput}
              onKeyDown={this.onNewTodoKeyDown}
            />
          </header>
          <section className="main">
            <input
              id="toggle-all"
              className="toggle-all"
              type="checkbox"
              checked={areAllTodosDone}
              onChange={toggleAllTodos}
            />
            <label htmlFor="toggle-all" />
            <ul className="todo-list">{todos.map(this.getTodoListItem)}</ul>
          </section>
          <footer className="footer">
            <span className="todo-count">
              <strong>{itemsLeft}</strong>
              <span />
              <span>items</span>
              <span> left</span>
            </span>
            <TodosFilter
              currentViewMode={currentViewMode}
              onShowActiveTodosClicked={showActiveTodos}
              onShowAllTodosClicked={showAllTodos}
              onShowCompletedTodosClicked={showCompletedTodos}
            />
            <button className="clear-completed" onClick={clearCompletedTodos}>
              Clear completed
            </button>
          </footer>
        </section>
        <footer className="info">
          <p>Double-click to edit a todo</p>
          <p>
            Created by <a href="https://github.com/pranuel">Pranuel</a>
          </p>
          <p>
            Part of <a href="http://todomvc.com">TodoMVC</a>
          </p>
        </footer>
      </div>
    );
  }

  private getTodoListItem = (todo: Todo) => {
    const {
      editTodo,
      deleteTodo,
      setEditTodo,
      changeEditingTodoDescription,
      saveTodo,
      updateTodoIsDone,
    } = this.props.todoStore;
    return (
      <TodoListItem
        key={todo.id}
        todo={todo}
        editTodo={editTodo}
        onDeleteTodo={deleteTodo}
        onEditTodo={setEditTodo}
        onEditingTodoDescriptionChanged={changeEditingTodoDescription}
        onSaveTodo={saveTodo}
        onTodoIsDoneToggled={updateTodoIsDone}
      />
    );
  }

  private onChangeNewTodoInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.props.todoStore.setNewTodoDescription(event.target.value);
  }

  private onNewTodoKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isEnterKey(event.key)) {
      return;
    }
    this.props.todoStore.createTodo(this.props.todoStore.newTodoDescription);
  }
}

export default withAuthenticator(App, true);

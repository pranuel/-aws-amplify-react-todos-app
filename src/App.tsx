import React from 'react';
import './App.css';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import Amplify from 'aws-amplify';
import { Todo } from './todo.model';
import '../node_modules/todomvc-common/base.css';
import '../node_modules/todomvc-app-css/index.css';
import { observer } from "mobx-react";
import { ViewModes } from './viewmodes.model';
import { TodoStore } from './todo.store';
import { LoadingIndicator } from './components/loading-indicator/loading-indicator';

Amplify.configure(awsconfig);

@observer
class App extends React.Component<{ todoStore: TodoStore }, {}> {

  componentDidMount() {
    this.props.todoStore.fetchTodos();
  }

  private getTodoListItemClassName(todo: Todo): string {
    const classNames = [];
    if (todo.isDone) {
      classNames.push('completed');
    }
    if (!!this.props.todoStore.editTodo && this.props.todoStore.editTodo.id === todo.id) {
      classNames.push('editing');
    }
    return classNames.join(' ');
  }

  private onNewTodoKeyDown(key: string) {
    if (!this.isEnterKey(key)) {
      return;
    }
    this.props.todoStore.createTodo(this.props.todoStore.newTodoDescription);
  }

  private onEditTodoKeyDown(key: string, editTodo?: Todo) {
    if (!this.isEnterKey(key)) {
      return;
    }
    this.props.todoStore.saveEditedTodo(editTodo);
  }

  private isEnterKey(key: string) {
    return key === 'Enter';
  }

  render() {
    const { todos, newTodoDescription, isLoading, editTodo, currentViewMode, setNewTodoDescription, showActiveTodos, showAllTodos,
      showCompletedTodos, clearCompletedTodos, itemsLeft, setEditTodo, areAllTodosDone, toggleAllTodos, updateTodoIsDone,
      deleteTodo, saveEditedTodo, changeEditingTodoDescription } = this.props.todoStore;
    return (
      <div>
        <section className="todoapp">
          <header className="header">
            <h1>todos</h1>
            {isLoading ? <LoadingIndicator></LoadingIndicator> : ''}
            <input className="new-todo" placeholder="What needs to be done?" value={newTodoDescription}
              onChange={event => setNewTodoDescription(event.target.value)} onKeyDown={event => this.onNewTodoKeyDown(event.key)} />
          </header>
          <section className="main">
            <input id="toggle-all" className="toggle-all" type="checkbox" checked={areAllTodosDone} onChange={_event => toggleAllTodos()} />
            <label htmlFor="toggle-all"></label>
            <ul className="todo-list">
              {
                todos.map(todo => (
                  <li className={this.getTodoListItemClassName(todo)} key={todo.id} onDoubleClick={_event => setEditTodo(todo)} >
                    <div className="view">
                      <input className="toggle" type="checkbox" checked={todo.isDone} onChange={event => updateTodoIsDone(todo, event.target.checked)} />
                      <label >{todo.description}</label>
                      <button className="destroy" onClick={_event => deleteTodo(todo)}></button>
                    </div>
                    <input className="edit" value={!!editTodo ? editTodo.description : ''} onKeyDown={event => this.onEditTodoKeyDown(event.key, editTodo)}
                      onBlur={_event => saveEditedTodo(editTodo)} onChange={event => changeEditingTodoDescription(editTodo, event.target.value)} />
                  </li>
                ))
              }
            </ul>
          </section>
          <footer className="footer">
            <span className="todo-count">
              <strong>{itemsLeft}</strong>
              <span> </span>
              <span>items</span>
              <span> left</span>
            </span>
            <ul className="filters">
              <li><a href="#/" onClick={_event => showAllTodos()} className={currentViewMode === ViewModes.All ? 'selected' : ''}>All</a></li>
              <span> </span>
              <li><a href="#/" onClick={_event => showActiveTodos()} className={currentViewMode === ViewModes.Active ? 'selected' : ''}>Active</a></li>
              <span> </span>
              <li><a href="#/" onClick={_event => showCompletedTodos()} className={currentViewMode === ViewModes.Completed ? 'selected' : ''}>Completed</a></li>
            </ul>
            <button className="clear-completed" onClick={_event => clearCompletedTodos()}>Clear completed</button>
          </footer>
        </section>
        <footer className="info">
          <p>Double-click to edit a todo</p>
          <p>Created by <a href="http://github.com/remojansen/">Remo H. Jansen</a></p>
          <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
      </div >
    );
  }
}

export default withAuthenticator(App, true);

import React from 'react';
import './App.css';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { CreateTodoMutationVariables, ListTodosQuery, DeleteTodoInput, UpdateTodoInput, ModelTodoFilterInput } from './API';
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { Todo } from './todo.model';
import { GraphQLResult } from '@aws-amplify/api/lib/types';
import Observable from 'zen-observable';
import '../node_modules/todomvc-common/base.css';
import '../node_modules/todomvc-app-css/index.css';

Amplify.configure(awsconfig);

enum ViewModes {
  All, Active, Completed
}

interface AppState {
  todos: Todo[];
  newTodoDescription: string;
  isLoading: boolean;
  editTodo?: Todo;
  currentViewMode: ViewModes
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      todos: [],
      newTodoDescription: '',
      isLoading: false,
      currentViewMode: ViewModes.All
    };
  }

  async componentDidMount() {
    await this.listTodos();
  }

  private async createTodo(key: string) {
    if (key !== 'Enter') {
      return;
    }
    this.resetFormInputs();
    const createTodoMutationVariables: CreateTodoMutationVariables = {
      input: {
        isDone: false,
        description: this.state.newTodoDescription
      }
    };

    await API.graphql(graphqlOperation(createTodo, createTodoMutationVariables));
    // update todos list after creating a new one:
    await this.listTodos();
  }

  private resetFormInputs() {
    this.setState({
      newTodoDescription: ''
    });
  }

  private isGraphQLResult(result: GraphQLResult | Observable<object>): result is GraphQLResult {
    // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
    return (result as GraphQLResult).data !== undefined;
  }

  private async listTodos(filter?: ModelTodoFilterInput) {
    this.setState({ isLoading: true });
    try {
      const allTodosResult = await API.graphql(graphqlOperation(listTodos, { filter }));
      if (this.isGraphQLResult(allTodosResult)) {
        const listTodosQuery = allTodosResult.data as ListTodosQuery;
        if (!!listTodosQuery.listTodos) {
          const allTodos = listTodosQuery.listTodos.items as Todo[];
          this.setState({ todos: allTodos });
        }
      }
    } catch (error) {
      console.warn('Error during listTodos(): ', error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  private async deleteTodo(todo: Todo) {
    this.setState({ isLoading: true });
    const input: DeleteTodoInput = {
      id: todo.id
    };
    await API.graphql(graphqlOperation(deleteTodo, { input }));
    this.setState({ isLoading: false });
    await this.listTodos();
  }

  private async onUpdateIsDone(todo: Todo, isDone: boolean) {
    todo.isDone = isDone;
    this.updateTodo(todo);
  }

  private onUpdateTodoDescription(todo?: Todo) {
    if (!todo) {
      return;
    }
    this.updateTodo(todo);
    this.setState({ editTodo: undefined });
  }

  private onChangeTodoDescription(editTodo?: Todo, description?: string) {
    if (!editTodo) {
      return;
    }
    editTodo.description = description || '';
    this.setState({ editTodo });
  }

  private async updateTodo(todo: Todo) {
    this.setState({ isLoading: true });
    const input: UpdateTodoInput = todo;
    await API.graphql(graphqlOperation(updateTodo, { input }));
    this.setState({ isLoading: false });
    await this.listTodos();
  }

  private get areAllTodosDone() {
    return this.state.todos.every(todo => todo.isDone);
  }

  private toggleAllTodos() {
    const areAllTodosDone = this.areAllTodosDone;
    this.state.todos.forEach(todo => {
      todo.isDone = !areAllTodosDone;
      this.updateTodo(todo);
    });
  }

  private getTodoListItemClassName(todo: Todo): string {
    const classNames = [];
    const { editTodo } = this.state;
    if (todo.isDone) {
      classNames.push('completed');
    }
    if (!!editTodo && editTodo.id === todo.id) {
      classNames.push('editing');
    }
    return classNames.join(' ');
  }

  private get itemsLeft() {
    return this.state.todos.filter(todo => !todo.isDone).length;
  }

  private showAllTodos() {
    this.listTodos();
    this.setState({ currentViewMode: ViewModes.All });
  }

  private showActiveTodos() {
    const filter: ModelTodoFilterInput = {
      isDone: { eq: false }
    };
    this.listTodos(filter);
    this.setState({ currentViewMode: ViewModes.Active });
  }

  private showCompletedTodos() {
    const filter: ModelTodoFilterInput = {
      isDone: { eq: true }
    };
    this.listTodos(filter);
    this.setState({ currentViewMode: ViewModes.Completed });
  }

  private get completedTodos() {
    const { todos } = this.state;
    return todos.filter(todo => todo.isDone);
  }

  private async clearCompletedTodos() {
    const deleteTodoPromises = this.completedTodos.map(this.deleteTodo.bind(this));
    await deleteTodoPromises;
    this.listTodos();
  }

  render() {
    const { todos: allTodos, newTodoDescription, isLoading, editTodo, currentViewMode: selectedViewMode } = this.state;
    return (
      <div>
        {isLoading ? <p>Loading...</p> : ''}
        <header className="header">
          <h1>todos</h1>
          <input className="new-todo" placeholder="What needs to be done?" value={newTodoDescription}
            onChange={event => this.setState({ newTodoDescription: event.target.value })} onKeyDown={event => this.createTodo(event.key)} />
        </header>
        <section className="main">
          <input id="toggle-all" className="toggle-all" type="checkbox" checked={this.areAllTodosDone} onChange={_event => this.toggleAllTodos()} />
          <label></label>
          <ul className="todo-list">
            {
              allTodos.map(todo => (
                <li className={this.getTodoListItemClassName(todo)} key={todo.id} onDoubleClick={_event => this.setState({ editTodo: todo })}>
                  <div className="view">
                    <input className="toggle" type="checkbox" checked={todo.isDone} onChange={event => this.onUpdateIsDone(todo, event.target.checked)} />
                    <label >{todo.description}</label>
                    <button className="destroy" onClick={_event => this.deleteTodo(todo)}></button>
                  </div>
                  <input className="edit" value={!!editTodo ? editTodo.description : ''} onKeyDown={event => event.key === 'Enter' ? this.onUpdateTodoDescription(editTodo) : ''}
                    onBlur={_event => this.onUpdateTodoDescription(editTodo)} onChange={event => this.onChangeTodoDescription(editTodo, event.target.value)} />
                </li>
              ))
            }
          </ul>
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong>{this.itemsLeft}</strong>
            <span> </span>
            <span>items</span>
            <span> left</span>
          </span>
          <ul className="filters">
            <li><a href="#/" onClick={_event => this.showAllTodos()} className={selectedViewMode === ViewModes.All ? 'selected' : ''}>All</a></li>
            <span> </span>
            <li><a href="#/" onClick={_event => this.showActiveTodos()} className={selectedViewMode === ViewModes.Active ? 'selected' : ''}>Active</a></li>
            <span> </span>
            <li><a href="#/" onClick={_event => this.showCompletedTodos()} className={selectedViewMode === ViewModes.Completed ? 'selected' : ''}>Completed</a></li>
          </ul>
          <button className="clear-completed" onClick={_event => this.clearCompletedTodos()}>Clear completed</button>
        </footer>
      </div>
    );
  }
}

export default withAuthenticator(App, true);

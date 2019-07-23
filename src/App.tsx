import React from 'react';
import './App.css';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { CreateTodoMutationVariables, ListTodosQuery, DeleteTodoInput, UpdateTodoInput } from './API';
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { Todo } from './todo.model';
import { GraphQLResult } from '@aws-amplify/api/lib/types';
import Observable from 'zen-observable';
import 'semantic-ui-css/semantic.min.css'
import '../node_modules/todomvc-common/base.css';
import '../node_modules/todomvc-app-css/index.css';

Amplify.configure(awsconfig);

interface AppState {
  allTodos: Todo[];
  newTodoDescription: string;
  isLoading: boolean
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      allTodos: [],
      newTodoDescription: '',
      isLoading: false
    };
  }

  async componentDidMount() {
    await this.listTodos();
  }

  async createTodo(key: string) {
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

  isGraphQLResult(result: GraphQLResult | Observable<object>): result is GraphQLResult {
    // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
    return (result as GraphQLResult).data !== undefined;
  }

  listTodos = async () => {
    this.setState({ isLoading: true });
    try {
      const allTodosResult = await API.graphql(graphqlOperation(listTodos));
      if (this.isGraphQLResult(allTodosResult)) {
        const listTodosQuery = allTodosResult.data as ListTodosQuery;
        if (!!listTodosQuery.listTodos) {
          const allTodos = listTodosQuery.listTodos.items as Todo[];
          this.setState({ allTodos });
        }
      }
    } catch (error) {
      console.warn('Error during listTodos(): ', error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async onDeleteTodo(todo: Todo) {
    this.setState({ isLoading: true });
    const input: DeleteTodoInput = {
      id: todo.id
    };
    await API.graphql(graphqlOperation(deleteTodo, { input }));
    this.setState({ isLoading: false });
    await this.listTodos();
  }

  async onUpdateIsDone(todo: Todo, isDone: boolean) {
    todo.isDone = isDone;
    this.updateTodo(todo);
  }

  async onUpdateDescription(todo: Todo, description: string) {
    todo.description = description;
    this.updateTodo(todo);
  }

  private async updateTodo(todo: Todo) {
    this.setState({ isLoading: true });
    const input: UpdateTodoInput = todo;
    await API.graphql(graphqlOperation(updateTodo, { input }));
    this.setState({ isLoading: false });
    await this.listTodos();
  }

  render() {
    const { allTodos, newTodoDescription, isLoading } = this.state;
    return (
      <div>
        {isLoading ? <p>Loading...</p> : ''}
        <header className="header">
          <h1>todos</h1>
          <input className="new-todo" placeholder="What needs to be done?" value={newTodoDescription}
            onChange={event => this.setState({ newTodoDescription: event.target.value })} onKeyDown={event => this.createTodo(event.key)} />
        </header>
        <section className="main">
          <input id="toggle-all" className="toggle-all" type="checkbox" />
          <label></label>
          <ul className="todo-list">
            {
              allTodos.map(todo => (
                <li key={todo.id}>
                  <div className="view">
                    <input className="toggle" type="checkbox" checked={todo.isDone} onClick={_event => this.onUpdateIsDone(todo, !todo.isDone)} />
                    <label >{todo.description}</label>
                    <button className="destroy" onClick={_event => this.onDeleteTodo(todo)}></button>
                  </div>
                  <input className="edit" value={todo.description} onChange={event => this.onUpdateDescription(todo, event.target.value)} />
                </li>
              ))
            }
          </ul>
        </section>
      </div>
    );
  }
}

export default withAuthenticator(App, true);

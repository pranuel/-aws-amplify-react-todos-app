import React from 'react';
import './App.css';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { CreateTodoMutationVariables, ListTodosQuery } from './API';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { Todo } from './todo.model';
import { GraphQLResult } from '@aws-amplify/api/lib/types';
import Observable from 'zen-observable';

Amplify.configure(awsconfig);

interface AppState {
  allTodos: Todo[];
  newTodoName: string;
  newTodoDescription?: string;
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      allTodos: [],
      newTodoName: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.listTodos();
  }

  async handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    await this.createTodo();
    event.preventDefault();
  }

  createTodo = async () => {
    const createTodoMutationVariables: CreateTodoMutationVariables = {
      input: {
        name: this.state.newTodoName,
        description: this.state.newTodoDescription
      }
    };

    await API.graphql(graphqlOperation(createTodo, createTodoMutationVariables));
    // update todos list after creating a new one:
    await this.listTodos();
  }

  isGraphQLResult(result: GraphQLResult | Observable<object>): result is GraphQLResult {
    // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
    return (result as GraphQLResult).data !== undefined;
  }

  listTodos = async () => {
    const allTodosResult = await API.graphql(graphqlOperation(listTodos));
    if (this.isGraphQLResult(allTodosResult)) {
      const listTodosQuery = allTodosResult.data as ListTodosQuery;
      if (!!listTodosQuery.listTodos) {
        const allTodos = listTodosQuery.listTodos.items as Todo[];
        this.setState({ allTodos });
      }
    }
  }

  render() {
    const { allTodos, newTodoDescription, newTodoName } = this.state;
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
          <input type="text" value={newTodoName} onChange={event => this.setState({ newTodoName: event.target.value })} />
          </label>
          <label>
            Description (optional):
          <input type="text" value={newTodoDescription || ''} onChange={event => this.setState({ newTodoDescription: event.target.value })} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <h1>Todos:</h1>
        {
          allTodos.length < 1 ?
            (
              <p>No todos exist...</p>
            )
            :
            (
              <ul>
                {allTodos.map(todo => (
                  <li>
                    <p>Id: {todo.id}</p>
                    <p>Name: {todo.name}</p>
                    <p>Description: {todo.description || '/'}</p>
                  </li>
                ))}
              </ul>
            )
        }
      </div>
    );
  }
}

export default withAuthenticator(App, true);

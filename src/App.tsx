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
import { Header, Icon, Container, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { AddTodoForm } from './ui-components/AddTodoForm';
import { TodosList } from './ui-components/TodosList';

Amplify.configure(awsconfig);

interface AppState {
  allTodos: Todo[];
  newTodoName: string;
  newTodoDescription?: string;
  isLoading: boolean
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      allTodos: [],
      newTodoName: '',
      isLoading: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.listTodos();
  }

  async handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    await this.createTodo();
    this.resetFormInputs();
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

  private resetFormInputs() {
    this.setState({
      newTodoDescription: '',
      newTodoName: ''
    });
  }

  isGraphQLResult(result: GraphQLResult | Observable<object>): result is GraphQLResult {
    // this crazy stuff was taken from here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
    return (result as GraphQLResult).data !== undefined;
  }

  listTodos = async () => {
    this.setState({ isLoading: true });
    const allTodosResult = await API.graphql(graphqlOperation(listTodos));
    this.setState({ isLoading: false });
    if (this.isGraphQLResult(allTodosResult)) {
      const listTodosQuery = allTodosResult.data as ListTodosQuery;
      if (!!listTodosQuery.listTodos) {
        const allTodos = listTodosQuery.listTodos.items as Todo[];
        this.setState({ allTodos });
      }
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

  async onEditTodo(todo: Todo) {
    this.setState({ isLoading: true });
    const input: UpdateTodoInput = todo;
    await API.graphql(graphqlOperation(updateTodo, { input }));
    this.setState({ isLoading: false });
    await this.listTodos();
  }

  render() {
    const { allTodos, newTodoDescription, newTodoName, isLoading } = this.state;
    return (
      <Container>
        <Segment.Group>
          <Segment>
            <Header as='h3'>Add a Todo</Header>
            <AddTodoForm onSubmit={this.handleSubmit} todoName={newTodoName} onChangeTodoName={event => this.setState({ newTodoName: event.target.value })} todoDescription={newTodoDescription} onChangeTodoDescription={event => this.setState({ newTodoDescription: event.target.value })}></AddTodoForm>
          </Segment>

          <Segment loading={isLoading}>
            <Header as='h3'>
              <Icon name='unordered list' />
              <Header.Content>Todos</Header.Content>
            </Header>
            <TodosList todos={allTodos} onDeleteTodo={this.onDeleteTodo.bind(this)} onEditTodo={this.onEditTodo.bind(this)}></TodosList>
          </Segment>
        </Segment.Group>
      </Container>
    );
  }
}

export default withAuthenticator(App, true);

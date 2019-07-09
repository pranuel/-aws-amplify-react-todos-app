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
import { Header, Icon, Container, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { AddTodoForm } from './ui-components/AddTodoForm';
import { TodosList } from './ui-components/TodosList';

Amplify.configure(awsconfig);

interface AppState {
  allTodos: Todo[];
  newTodoName: string;
  newTodoDescription?: string;
  areTodosLoading: boolean
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      allTodos: [],
      newTodoName: '',
      areTodosLoading: false
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
    this.setState({ areTodosLoading: true });
    const allTodosResult = await API.graphql(graphqlOperation(listTodos));
    this.setState({ areTodosLoading: false });
    if (this.isGraphQLResult(allTodosResult)) {
      const listTodosQuery = allTodosResult.data as ListTodosQuery;
      if (!!listTodosQuery.listTodos) {
        const allTodos = listTodosQuery.listTodos.items as Todo[];
        this.setState({ allTodos });
      }
    }
  }

  render() {
    const { allTodos, newTodoDescription, newTodoName, areTodosLoading } = this.state;
    return (
      <Container>
        <Segment.Group>
          <Segment>
            <Header as='h3'>Add a Todo</Header>
            <AddTodoForm onSubmit={this.handleSubmit} todoName={newTodoName} onChangeTodoName={event => this.setState({ newTodoName: event.target.value })} todoDescription={newTodoDescription} onChangeTodoDescription={event => this.setState({ newTodoDescription: event.target.value })}></AddTodoForm>
          </Segment>

          <Segment loading={areTodosLoading}>
            <Header as='h3'>
              <Icon name='unordered list' />
              <Header.Content>Todos</Header.Content>
            </Header>
            <TodosList todos={allTodos}></TodosList>
          </Segment>
        </Segment.Group>
      </Container>
    );
  }
}

export default withAuthenticator(App, true);

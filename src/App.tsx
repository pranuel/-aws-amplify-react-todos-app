import React from 'react';
import logo from './logo.svg';
import './App.css';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { CreateTodoInput } from './API';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

Amplify.configure(awsconfig);

class App extends React.Component {

  todoMutation = async () => {
    const todoDetails: CreateTodoInput = {
      name: 'Party tonight!',
      description: 'Amplify CLI rocks!'
    };

    const newTodo = await API.graphql(graphqlOperation(createTodo, { input: todoDetails }));
    alert(JSON.stringify(newTodo));
  }

  listQuery = async () => {
    console.log('listing todos');
    const allTodos = await API.graphql(graphqlOperation(listTodos));
    alert(JSON.stringify(allTodos));
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.listQuery}>GraphQL Query</button>
        <button onClick={this.todoMutation}>GraphQL Mutation</button>
      </div>
    );
  }
}

export default withAuthenticator(App, true);

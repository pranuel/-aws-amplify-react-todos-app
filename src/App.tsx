import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import React from "react";
import "../node_modules/todomvc-app-css/index.css";
import "../node_modules/todomvc-common/base.css";
import "./App.css";
import awsconfig from "./aws-exports";
import { TodoRepository } from "./todos/todo.repository";
import { TodoStore } from "./todos/todo.store";
import { Todos } from "./todos/Todos";

Amplify.configure(awsconfig);

export class App extends React.Component<{}, {}> {
  public render() {
    const todoRepository = new TodoRepository();
    const todoStore = new TodoStore(todoRepository);
    return <Todos todoStore={todoStore} />;
  }
}

export default withAuthenticator(App, true);

import React from "react";
import "../node_modules/todomvc-app-css/index.css";
import "../node_modules/todomvc-common/base.css";
import "./App.css";
import { TodoStore } from "./todos/todo.store";
import { Todos } from "./todos/Todos";

export class App extends React.Component<{}, {}> {
  public render() {
    return <Todos todoStore={new TodoStore()} />;
  }
}

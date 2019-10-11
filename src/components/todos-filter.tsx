import React from "react";
import { TodoFilter } from "../todos/todo-filter.model";

interface TodosFilterProps {
  todoFilter: TodoFilter;
  onShowAllTodosClicked: () => void;
  onShowActiveTodosClicked: () => void;
  onShowCompletedTodosClicked: () => void;
}

export class TodosFilter extends React.Component<TodosFilterProps, {}> {
  public render() {
    return (
      <ul className="filters">
        <li>
          <a
            href="#/"
            onClick={this.props.onShowAllTodosClicked}
            className={this.getTodosFilterClassName(TodoFilter.All)}
          >
            All
          </a>
        </li>
        <span />
        <li>
          <a
            href="#/"
            onClick={this.props.onShowActiveTodosClicked}
            className={this.getTodosFilterClassName(TodoFilter.Active)}
          >
            Active
          </a>
        </li>
        <span />
        <li>
          <a
            href="#/"
            onClick={this.props.onShowCompletedTodosClicked}
            className={this.getTodosFilterClassName(TodoFilter.Completed)}
          >
            Completed
          </a>
        </li>
      </ul>
    );
  }

  private getTodosFilterClassName = (elementTodoFilter: TodoFilter) => {
    return this.props.todoFilter === elementTodoFilter ? "selected" : undefined;
  }
}

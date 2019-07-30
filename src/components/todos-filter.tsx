import React from "react";
import { ViewModes } from "../viewmodes.model";

interface TodosFilterProps {
  currentViewMode: ViewModes;
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
            className={this.getTodosFilterClassName(ViewModes.All)}
          >
            All
          </a>
        </li>
        <span />
        <li>
          <a
            href="#/"
            onClick={this.props.onShowActiveTodosClicked}
            className={this.getTodosFilterClassName(ViewModes.Active)}
          >
            Active
          </a>
        </li>
        <span />
        <li>
          <a
            href="#/"
            onClick={this.props.onShowCompletedTodosClicked}
            className={this.getTodosFilterClassName(ViewModes.Completed)}
          >
            Completed
          </a>
        </li>
      </ul>
    );
  }

  private getTodosFilterClassName = (elementViewMode: ViewModes) => {
    return this.props.currentViewMode === elementViewMode
      ? "selected"
      : undefined;
  }
}

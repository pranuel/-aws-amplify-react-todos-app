import React, { ChangeEvent } from "react";
import { isEnterKey } from "../helpers/keyboard.helper";
import { Todo } from "../todos/todo.model";

export interface TodoListItemProps {
  todo: Todo;
  editTodo?: Todo;
  onEditTodo: (todo: Todo) => void;
  onTodoIsDoneToggled: (todo: Todo, isDone: boolean) => void;
  onSaveTodo: (todo: Todo) => void;
  onDeleteTodo: (todo: Todo) => void;
  onEditingTodoDescriptionChanged: (
    editTodo: Todo,
    description: string,
  ) => void;
}

export class TodoListItem extends React.Component<TodoListItemProps, {}> {
  public render() {
    const { todo, editTodo } = this.props;
    return (
      <li
        className={this.getTodoListItemClassName(todo, editTodo)}
        onDoubleClick={this.onDoubleClick}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            data-testid="is-done-toggle"
            checked={todo.isDone}
            onChange={this.onTodoIsDoneToggled}
          />
          <label>{todo.description}</label>
          <button
            className="destroy"
            data-testid="delete-button"
            onClick={this.onDeleteTodoClicked}
          />
        </div>
        <input
          className="edit"
          value={!!editTodo ? editTodo.description : ""}
          data-testid="edit-input"
          onKeyDown={this.onEditInputKeyDown}
          onBlur={this.onEditInputBlur}
          onChange={this.onEditInputChanged}
        />
      </li>
    );
  }

  private onEditInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!this.props.editTodo) {
      return;
    }
    this.props.onEditingTodoDescriptionChanged(
      this.props.editTodo,
      event.target.value,
    );
  }

  private onDeleteTodoClicked = () => {
    this.props.onDeleteTodo(this.props.todo);
  }

  private onEditInputBlur = () => {
    if (!this.props.editTodo) {
      return;
    }
    this.props.onSaveTodo(this.props.editTodo);
  }

  private onTodoIsDoneToggled = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onTodoIsDoneToggled(this.props.todo, event.target.checked);
  }

  private onEditInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (!isEnterKey(event.key) || !this.props.editTodo) {
      return;
    }
    this.props.onSaveTodo(this.props.editTodo);
  }

  private onDoubleClick = () => {
    this.props.onEditTodo(this.props.todo);
  }

  private getTodoListItemClassName(todo: Todo, editTodo?: Todo): string {
    const classNames = [];
    if (todo.isDone) {
      classNames.push("completed");
    }
    if (!!editTodo && editTodo.id === todo.id) {
      classNames.push("editing");
    }
    return classNames.join(" ");
  }
}

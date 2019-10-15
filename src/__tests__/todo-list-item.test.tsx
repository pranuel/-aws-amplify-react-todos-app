import { fireEvent, render } from "@testing-library/react";
import React from "react";
import renderer from "react-test-renderer";
import { TodoListItem, TodoListItemProps } from "../components/todo-list-item";

describe("TodoListItem", () => {
  let testProps: TodoListItemProps;

  beforeEach(() => {
    testProps = {
      todo: {
        description: "foo",
        id: "1",
        isDone: false,
      },
      onEditTodo: jest.fn(),
      onTodoIsDoneToggled: jest.fn(),
      onSaveTodo: jest.fn(),
      onDeleteTodo: jest.fn(),
      onEditingTodoDescriptionChanged: jest.fn(),
    };
  });

  it("should mark an item as completed", () => {
    // arrange
    testProps.todo.isDone = true;
    // act
    const tree = renderer.create(<TodoListItem {...testProps} />).toJSON();
    // assert
    expect(tree).toMatchSnapshot();
  });

  it("should mark an item as editing", () => {
    // arrange
    testProps.editTodo = testProps.todo;
    // act
    const tree = renderer.create(<TodoListItem {...testProps} />).toJSON();
    // assert
    expect(tree).toMatchSnapshot();
  });

  it("should notify about a deleted todo when delete button clicked", () => {
    // arrange
    const onDeleteTodoSpy = spyOn(testProps, "onDeleteTodo");
    const { getByTestId } = render(<TodoListItem {...testProps} />);
    // act
    fireEvent.click(getByTestId("delete-button"));
    // assert
    expect(onDeleteTodoSpy).toHaveBeenCalledWith(testProps.todo);
  });

  it("should notify about a todo is done when checkbox was toggled", () => {
    // arrange
    const onTodoIsDoneToggledSpy = spyOn(testProps, "onTodoIsDoneToggled");
    const { getByTestId } = render(<TodoListItem {...testProps} />);
    // act
    fireEvent.click(getByTestId("is-done-toggle"));
    // assert
    expect(onTodoIsDoneToggledSpy).toHaveBeenCalledWith(testProps.todo, true);
  });

  it("should notify about a todo being edited when entry double-clicked", () => {
    // arrange
    const onEditTodoSpy = spyOn(testProps, "onEditTodo");
    testProps.todo.description = "foo todo";
    const { getByText } = render(<TodoListItem {...testProps} />);
    // act
    fireEvent.doubleClick(getByText("foo todo"));
    // assert
    expect(onEditTodoSpy).toHaveBeenCalledWith(testProps.todo);
  });

  it("should notify about a todo is saved when enter key was hit", () => {
    // arrange
    testProps.editTodo = testProps.todo;
    const onSaveTodoSpy = spyOn(testProps, "onSaveTodo");
    const { getByTestId } = render(<TodoListItem {...testProps} />);
    const enterKeyOptions = {
      key: "Enter",
      keyCode: 13,
    };
    // act
    fireEvent.keyDown(getByTestId("edit-input"), enterKeyOptions);
    // assert
    expect(onSaveTodoSpy).toHaveBeenCalledWith(testProps.todo);
  });

  it("should notify about a todo is saved on input blur", () => {
    // arrange
    testProps.editTodo = testProps.todo;
    const onSaveTodoSpy = spyOn(testProps, "onSaveTodo");
    const { getByTestId } = render(<TodoListItem {...testProps} />);
    // act
    fireEvent.blur(getByTestId("edit-input"));
    // assert
    expect(onSaveTodoSpy).toHaveBeenCalledWith(testProps.todo);
  });

  it("should notify about todo edit changes on input change", () => {
    // arrange
    testProps.editTodo = testProps.todo;
    const onEditingTodoDescriptionChangedSpy = spyOn(
      testProps,
      "onEditingTodoDescriptionChanged",
    );
    const { getByTestId } = render(<TodoListItem {...testProps} />);
    // act
    fireEvent.change(getByTestId("edit-input"), { target: { value: "bar" } });
    // assert
    expect(onEditingTodoDescriptionChangedSpy).toHaveBeenCalledWith(
      testProps.todo,
      "bar",
    );
  });
});

import { fireEvent, render } from "@testing-library/react";
import React from "react";
import renderer from "react-test-renderer";
import { TodosFilter } from "../components/todos-filter";
import { TodoFilter } from "../todos/todo-filter.model";

describe("TodosFilter", () => {
  it("should highlight the selected filter item", () => {
    const props = {
      currentTodoFilter: TodoFilter.Active,
      onShowAllTodosClicked: jest.fn(),
      onShowActiveTodosClicked: jest.fn(),
      onShowCompletedTodosClicked: jest.fn(),
    };
    const tree = renderer.create(<TodosFilter {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("should call the provided callback if a filter item is clicked", () => {
    // arrange
    const props = {
      currentTodoFilter: TodoFilter.Active,
      onShowAllTodosClicked: jest.fn(),
      onShowActiveTodosClicked: jest.fn(),
      onShowCompletedTodosClicked: jest.fn(),
    };
    const onShowCompletedTodosClickedSpy = spyOn(
      props,
      "onShowCompletedTodosClicked",
    );
    const { getByText } = render(<TodosFilter {...props} />);
    // act
    fireEvent.click(getByText("Completed"));
    // assert
    expect(onShowCompletedTodosClickedSpy).toHaveBeenCalled();
  });
});

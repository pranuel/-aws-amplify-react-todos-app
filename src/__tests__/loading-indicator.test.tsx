import React from "react";
import renderer from "react-test-renderer";
import { LoadingIndicator } from "../components/loading-indicator/loading-indicator";

describe("LoadingIndicator", () => {
  it("should render correctly", () => {
    const tree = renderer.create(<LoadingIndicator />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

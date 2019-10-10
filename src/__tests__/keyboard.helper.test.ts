import { isEnterKey } from "../helpers/keyboard.helper";

describe("KeyboardHelper", () => {
  it("should return true if it is the enter key", () => {
    // arrange
    const key = "Enter";
    // act
    const result = isEnterKey(key);
    // assert
    expect(result).toBe(true);
  });

  it("should return false if it is not the enter key", () => {
    // arrange
    const key = "A";
    // act
    const result = isEnterKey(key);
    // assert
    expect(result).toBe(false);
  });
});

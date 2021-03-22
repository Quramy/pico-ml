import { equal } from "./utils";
import { int, bool, func } from "./testing/helpers";

describe(equal, () => {
  test(equal.name, () => {
    expect(equal(int(), int())).toBeTruthy();
    expect(equal(bool(), int())).toBeFalsy();
    expect(equal(int(), bool())).toBeFalsy();
    expect(equal(func(int(), int()), func(int(), int()))).toBeTruthy();
  });
});

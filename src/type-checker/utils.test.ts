import { equal, getFreeTypeVariables } from "./utils";
import { int, bool, func, param, list } from "./testing/helpers";

describe(equal, () => {
  test(equal.name, () => {
    expect(equal(int(), int())).toBeTruthy();
    expect(equal(bool(), int())).toBeFalsy();
    expect(equal(int(), bool())).toBeFalsy();
    expect(equal(func(int(), int()), func(int(), int()))).toBeTruthy();
  });
});

describe(getFreeTypeVariables, () => {
  test(getFreeTypeVariables.name, () => {
    expect(getFreeTypeVariables(int())).toEqual([]);
    expect(getFreeTypeVariables(bool())).toEqual([]);
    expect(getFreeTypeVariables(param(0))).toEqual([param(0)]);
    expect(getFreeTypeVariables(func(param(1), list(param(0))))).toEqual([param(0), param(1)]);
    expect(getFreeTypeVariables(func(param(0), list(param(0))))).toEqual([param(0)]);
  });
});

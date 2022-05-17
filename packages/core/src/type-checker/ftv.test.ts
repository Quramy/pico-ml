import { getFreeTypeVariables } from "./ftv";
import { int, bool, param, func, list, scheme } from "./testing/helpers";

describe(getFreeTypeVariables, () => {
  test("for type", () => {
    expect(getFreeTypeVariables(int())).toEqual([]);
    expect(getFreeTypeVariables(bool())).toEqual([]);
    expect(getFreeTypeVariables(param(0))).toEqual([param(0)]);
    expect(getFreeTypeVariables(func(param(1), list(param(0))))).toEqual([param(0), param(1)]);
    expect(getFreeTypeVariables(func(param(0), list(param(0))))).toEqual([param(0)]);
  });

  test("for scheme", () => {
    expect(getFreeTypeVariables(scheme(param(0), []))).toEqual([param(0)]);
    expect(getFreeTypeVariables(scheme(param(0), [param(0)]))).toEqual([]);
    expect(getFreeTypeVariables(scheme(func(param(0), param(1)), [param(0)]))).toEqual([param(1)]);
  });
});

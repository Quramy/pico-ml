import { unify } from "./unify";
import { equation, param, func, int, substitution } from "./testing/helpers";

describe(unify, () => {
  test("no param", () => {
    const actual = unify([]).value;
    expect(actual).toEqual([]);
  });

  test("fun x -> (x 5) + 1", () => {
    const actual = unify([equation(param(0), func(int(), param(1))), equation(param(1), int()), equation(int(), int())])
      .value;
    expect(actual).toEqual([substitution(param(0), func(int(), int())), substitution(param(1), int())]);
  });
});

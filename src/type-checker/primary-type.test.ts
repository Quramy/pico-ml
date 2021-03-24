import { unwrap } from "../structure";
import { parse } from "../parser";
import { getPrimaryType } from "./primary-type";
import { TypeValue } from "./types";
import { int, bool, param, list, func } from "./testing/helpers";

const fixture: Record<string, () => TypeValue> = {
  "1": () => int(),
  true: () => bool(),
  "0 < 1": () => bool(),
  "1::2::[]": () => list(int()),
  "let x = 1 in x": () => int(),
  "fun x -> x": () => func(param(0), param(0)),
  "match 1::[] with [] -> true | x::y -> false": () => bool(),
  "match 0 with x -> true": () => bool(),
  "fun x -> match x with [] -> true | _ -> false": () => func(list(param(1)), bool()),
  "fun x -> (x 5) + 1": () => func(func(int(), int()), int()),
  "let id = fun x -> x in if id true then 1 else id 2": () => int(),
  "let rec fn = fun x -> fn x in 1 + fn 1": () => int(),
  "let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in map": () =>
    func(func(param(9), param(10)), func(list(param(9)), list(param(10)))),
};

describe(getPrimaryType, () => {
  Object.keys(fixture).forEach(input => {
    test(`Primary type for: "${input}"`, () => {
      const expectedValue = (fixture as Record<string, () => TypeValue>)[input]();
      expect(unwrap(getPrimaryType(unwrap(parse(input)))).expressionType).toMatchObject(expectedValue);
    });
  });

  test("failure", () => {
    expect(getPrimaryType(unwrap(parse("1 + false"))).ok).toBeFalsy();
    expect(getPrimaryType(unwrap(parse("true::1::[]"))).ok).toBeFalsy();
  });
});

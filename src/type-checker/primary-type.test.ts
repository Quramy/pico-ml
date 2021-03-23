import { unwrap, ResultErrorBase } from "../structure";
import { parse } from "../parser";
import { getPrimaryType } from "./primary-type";
import { PrimaryTypeValue } from "./types";
import { int, bool, param, list, func } from "./testing/helpers";

const failure = {} as ResultErrorBase;

const fixture: Record<string, () => PrimaryTypeValue | typeof failure> = {
  "1": () => ({
    substitutions: [],
    expressionType: int(),
  }),
  true: () => ({
    substitutions: [],
    expressionType: bool(),
  }),
  "1 + false": () => failure,
  "0 < 1": () => ({
    substitutions: [],
    expressionType: bool(),
  }),
  "1::2::[]": () => ({
    substitutions: [{ from: param(0), to: int() }],
    expressionType: list(int()),
  }),
  "true::1::[]": () => failure,
  "let x = 1 in x": () => ({
    substitutions: [],
    expressionType: int(),
  }),
  "fun x -> x": () => ({
    substitutions: [],
    expressionType: func(param(0), param(0)),
  }),
  "match 1::[] with [] -> true | x::y -> false": () => ({
    substitutions: [
      { from: param(0), to: int() },
      { from: param(1), to: int() },
    ],
    expressionType: bool(),
  }),
  "fun x -> (x 5) + 1": () => ({
    substitutions: [
      { from: param(0), to: func(int(), int()) },
      { from: param(1), to: int() },
    ],
    expressionType: func(func(int(), int()), int()),
  }),
  "let id = fun x -> x in if id true then 1 else id 2": () => ({
    substitutions: [
      { from: param(1), to: bool() },
      { from: param(2), to: bool() },
      { from: param(3), to: int() },
      { from: param(4), to: int() },
    ],
    expressionType: int(),
  }),
  "let rec fn = fun x -> fn x in 1 + fn 1": () => ({
    substitutions: [
      { from: param(0), to: func(param(1), param(2)) },
      { from: param(3), to: int() },
      { from: param(4), to: int() },
      { from: param(5), to: int() },
    ],
    expressionType: int(),
  }),
};

describe(getPrimaryType, () => {
  Object.keys(fixture).forEach(input => {
    test(`getPrimaryType: "${input}"`, () => {
      const expectedValue = (fixture as Record<string, () => PrimaryTypeValue | typeof failure>)[input]();
      expect(getPrimaryType(unwrap(parse(input))).value).toMatchObject(expectedValue);
    });
  });
});

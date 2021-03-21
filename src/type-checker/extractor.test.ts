import { parse } from "../parser";
import { extract } from "./extractor";
import { ExtractedValue } from "./types";
import { int, bool, equation, func, param, list } from "./testing/helpers";

const fixture: Record<string, () => ExtractedValue> = {
  "1": () => ({
    equationSet: [],
    expressionType: int(),
  }),
  true: () => ({
    equationSet: [],
    expressionType: bool(),
  }),
  "1 + false": () => ({
    equationSet: [equation(int(), int()), equation(bool(), int())],
    expressionType: int(),
  }),
  "0 < 1": () => ({
    equationSet: [equation(int(), int()), equation(int(), int())],
    expressionType: bool(),
  }),
  "1::2::[]": () => ({
    equationSet: [equation(list(param(0)), list(int())), equation(list(param(0)), list(int()))],
    expressionType: list(param(0)),
  }),
  "true::1::[]": () => ({
    equationSet: [equation(list(param(0)), list(int())), equation(list(param(0)), list(bool()))],
    expressionType: list(param(0)),
  }),
  "if true then 100 else 200": () => ({
    equationSet: [equation(bool(), bool()), equation(int(), int())],
    expressionType: int(),
  }),
  "let x = 1 in x": () => ({
    equationSet: [],
    expressionType: int(),
  }),
  "fun x -> x": () => ({
    equationSet: [],
    expressionType: func(param(0), param(0)),
  }),
  "fun x -> (x 5) + 1": () => ({
    equationSet: [equation(param(0), func(int(), param(1))), equation(param(1), int()), equation(int(), int())],
    expressionType: func(param(0), int()),
  }),
};

const parseAndExtract = (code: string) => extract(parse(code)!).value;

describe(extract, () => {
  Object.keys(fixture).forEach(input => {
    test(`extract: "${input}"`, () => {
      const expectedValue = (fixture as Record<string, () => ExtractedValue>)[input]();
      expect(parseAndExtract(input)).toMatchObject(expectedValue);
    });
  });
});

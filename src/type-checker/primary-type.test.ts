import { parse } from "../parser";
import { getPrimaryType } from "./primary-type";
import { createTypePrinter } from "./unparse";

const fixture: Record<string, () => string> = {
  "1": () => "int",
  "-1": () => "int",
  true: () => "bool",
  "0 < 1": () => "bool",
  "0 <= 1": () => "bool",
  "0 > 1": () => "bool",
  "0 >= 1": () => "bool",
  "1::2::[]": () => "int list",
  "let x = 1 in x": () => "int",
  "fun x -> x": () => "'a -> 'a",
  "fun x -> -x": () => "int -> int",
  "match 1::[] with [] -> true | x::y -> false": () => "bool",
  "match 0 with x -> true": () => "bool",
  "fun x -> match x with [] -> true | _ -> false": () => "'a list -> bool",
  "fun x -> (x 5) + 1": () => "(int -> int) -> int",
  "fun x -> match x with _ -> x": () => "'a -> 'a",
  "fun x -> match x with [] -> x": () => "'a list -> 'a list",
  "let id = fun x -> x in if id true then 1 else id 2": () => "int",
  "let rec fn = fun x -> fn x in 1 + fn 1": () => "int",
  "let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in map": () =>
    "('a -> 'b) -> 'a list -> 'b list",
};

describe(getPrimaryType, () => {
  Object.keys(fixture).forEach(input => {
    test(`Primary type for: "${input}"`, () => {
      const expectedValue = (fixture as Record<string, () => string>)[input]();
      const { expressionType, substitutions } = parse(input).mapValue(getPrimaryType).unwrap();
      const printer = createTypePrinter({ remapWithSubstitutions: substitutions });
      expect(printer(expressionType)).toBe(expectedValue);
    });
  });

  test("failure", () => {
    expect(parse("1 + false").mapValue(getPrimaryType).ok).toBeFalsy();
    expect(parse("true::1::[]").mapValue(getPrimaryType).ok).toBeFalsy();
  });
});

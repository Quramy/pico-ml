import { parse } from "./parser";
import { evaluate } from "./evaluator";

const parseAndEval = (code: string) => evaluate(parse(code));

const failedResult = { failure: true };

describe(evaluate, () => {
  test("literal", () => {
    expect(parseAndEval("1")).toBe(1);
    // expect(parseAndEval("-2")).toBe(-2); // FIXME
    expect(parseAndEval("true")).toBe(true);
    expect(parseAndEval("false")).toBe(false);
  });

  test("arithmetic operation", () => {
    expect(parseAndEval("1+1")).toBe(2);
    expect(parseAndEval("1-1")).toBe(0);
    expect(parseAndEval("2*3")).toBe(6);
    expect(parseAndEval("1<1")).toBe(false);
    expect(parseAndEval("1<2")).toBe(true);
  });

  test("if expression", () => {
    expect(parseAndEval("if 100 then true else false")).toMatchObject(
      failedResult
    );
    expect(parseAndEval("if true then 0 else 1")).toBe(0);
    expect(parseAndEval("if false then 0 else 1")).toBe(1);
  });

  test("let expression", () => {
    expect(parseAndEval("let x = 1 in x")).toBe(1);
    expect(parseAndEval("let a = 100 in let a = 200 in a")).toBe(200);
    expect(
      parseAndEval(`
        let x = 5 in
        let y = if x < 4 then 1 else x in
        x * x
      `)
    ).toBe(25);
  });

  test("function application", () => {
    expect(parseAndEval("let f = fun x -> 1 in f 0")).toBe(1);

    expect(
      parseAndEval(`
        let add = fun a -> fun b -> a + b in
        add 1 3
      `)
    ).toBe(4);

    expect(
      parseAndEval(`
        let compose = fun f -> fun g -> fun x -> f (g x) in
        let p = fun x -> x * x in
        let q = fun x -> x + 3 in
        compose p q 4
      `)
    ).toBe(49);
  });

  test("recursive function application", () => {
    expect(parseAndEval("let rec f = fun x -> 1 in f 0")).toBe(1);

    expect(
      parseAndEval(`
        let rec fact = fun n ->
          if n < 2 then 1 else n * fact (n - 1) in
        fact 3
      `)
    ).toBe(6);
  });
});

import assert from "assert";
import { parse } from "./parser";
import { evaluate } from "./evaluator";

const parseAndEval = (code: string) => evaluate(parse(code));

describe(evaluate, () => {
  test("literal", () => {
    expect(parseAndEval("1")).toBe(1);
    expect(parseAndEval("-2")).toBe(-2);
    expect(parseAndEval("true")).toBe(true);
    expect(parseAndEval("false")).toBe(false);
  });
  test("arithmetic operatoin", () => {
    expect(parseAndEval("1+1")).toBe(2);
    expect(parseAndEval("1-1")).toBe(0);
    expect(parseAndEval("2*3")).toBe(6);
    expect(parseAndEval("1<1")).toBe(false);
    expect(parseAndEval("1<2")).toBe(true);
  });
  test("if expression", () => {
    expect(parseAndEval("if true then 0 else 1")).toBe(0);
    expect(parseAndEval("if false then 0 else 1")).toBe(1);
  });
});

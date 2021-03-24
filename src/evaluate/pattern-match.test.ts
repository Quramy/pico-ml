import { unwrap } from "../structure";
import { parseMatchPattern } from "../parser";
import { isMatch } from "./pattern-match";
import { EvaluationValue } from "./types";
import { createRootEnvironment } from "./environment";

const id = (name: string) => ({ kind: "Identifier", name } as const);

describe(isMatch, () => {
  const getEnv = (input: string, value: EvaluationValue) =>
    isMatch(value, unwrap(parseMatchPattern(input)), createRootEnvironment());
  test("not match", () => {
    expect(getEnv("x::y", [])).toBeFalsy();
    expect(getEnv("x::y", 0)).toBeFalsy();
    expect(getEnv("_::_", 0)).toBeFalsy();
    expect(getEnv("_::_", [])).toBeFalsy();
    expect(getEnv("x::_", [])).toBeFalsy();
    expect(getEnv("_::x", [])).toBeFalsy();
    expect(getEnv("[]", 0)).toBeFalsy();
    expect(getEnv("[]", false)).toBeFalsy();
  });
  test("match", () => {
    expect(getEnv("_", 1)).toBeTruthy();
    expect(getEnv("x", 1)!.get(id("x"))).toEqual(1);
    expect(getEnv("[]", [])).toBeTruthy();
    expect(getEnv("x::y", [1, 2])!.get(id("x"))).toEqual(1);
    expect(getEnv("x::y", [1, 2])!.get(id("y"))).toEqual([2]);
    expect(getEnv("x::y::[]", [1, 2])!.get(id("y"))).toEqual(2);
    expect(getEnv("x::y", [1, 2, 3])!.get(id("y"))).toEqual([2, 3]);
    expect(getEnv("x::_::y", [1, 2, 3])!.get(id("y"))).toEqual([3]);
    expect(getEnv("x::_::_::y", [1, 2, 3])!.get(id("y"))).toEqual([]);
    expect(getEnv("x::_", [1, 2, 3])!.get(id("x"))).toEqual(1);
    expect(getEnv("_::x", [1, 2, 3])!.get(id("x"))).toEqual([2, 3]);
    expect(getEnv("x::y::z", [1, 2, 3])!.get(id("z"))).toEqual([3]);
  });
});

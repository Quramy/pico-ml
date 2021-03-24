import { unwrap } from "../structure";
import { parseMatchPattern } from "../parser";
import { equal, getTypeEnvForPattern } from "./utils";
import { int, bool, func, param, list } from "./testing/helpers";
import { createRootEnvironment } from "./type-environment";
import { TypeScheme } from "./types";

describe(equal, () => {
  test(equal.name, () => {
    expect(equal(int(), int())).toBeTruthy();
    expect(equal(bool(), int())).toBeFalsy();
    expect(equal(int(), bool())).toBeFalsy();
    expect(equal(func(int(), int()), func(int(), int()))).toBeTruthy();
  });
});

describe(getTypeEnvForPattern, () => {
  const getEnv = (input: string) =>
    unwrap(getTypeEnvForPattern(unwrap(parseMatchPattern(input)), param(0), createRootEnvironment()));
  test(getTypeEnvForPattern.name, () => {
    expect(() => getEnv("x::x")).toThrowError();
    expect(() => getEnv("x::y::x")).toThrowError();
    expect(getEnv("[]").parent()).toBeFalsy();
    expect(getEnv("_").parent()).toBeFalsy();
    expect(getEnv("x").get({ kind: "Identifier", name: "x" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: list(param(0)),
      variables: [],
    });
    expect(getEnv("x::[]").get({ kind: "Identifier", name: "x" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: param(0),
      variables: [],
    });
    expect(getEnv("x::_::y::z").get({ kind: "Identifier", name: "y" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: param(0),
      variables: [],
    });
    expect(getEnv("x::_::y::z").get({ kind: "Identifier", name: "z" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: list(param(0)),
      variables: [],
    });
  });
});

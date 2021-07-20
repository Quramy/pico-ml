import { parseMatchPattern } from "../syntax";
import { equal, getTypeEnvForPattern } from "./utils";
import { int, float, bool, func, param, list } from "./testing/helpers";
import { createRootEnvironment, ParmGenerator } from "./type-environment";
import { TypeScheme, TypeValue, TypeEquation } from "./types";

describe(equal, () => {
  test(equal.name, () => {
    expect(equal(int(), int())).toBeTruthy();
    expect(equal(float(), float())).toBeTruthy();
    expect(equal(float(), int())).toBeFalsy();
    expect(equal(bool(), int())).toBeFalsy();
    expect(equal(int(), bool())).toBeFalsy();
    expect(equal(func(int(), int()), func(int(), int()))).toBeTruthy();
  });
});

describe(getTypeEnvForPattern, () => {
  const getEnv = (input: string, type: TypeValue = int()) =>
    getTypeEnvForPattern(
      parseMatchPattern(input).unwrap(),
      type,
      createRootEnvironment(),
      new ParmGenerator(),
    ).unwrap();

  test(getTypeEnvForPattern.name, () => {
    expect(() => getEnv("x::x")).toThrowError();
    expect(() => getEnv("x::y::x")).toThrowError();
    expect(getEnv("[]").typeEnv.parent()).toBeFalsy();
    expect(getEnv("[]", int()).equations).toMatchObject<TypeEquation[]>([{ lhs: int(), rhs: list(param(0)) }]);
    expect(getEnv("_").typeEnv.parent()).toBeFalsy();
    expect(getEnv("_").equations).toEqual([]);
    expect(getEnv("x", int()).typeEnv.get({ kind: "Identifier", name: "x" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: int(),
      variables: [],
    });
    expect(getEnv("x::[]").typeEnv.get({ kind: "Identifier", name: "x" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: param(0),
      variables: [],
    });
    expect(getEnv("x::_::y::z").typeEnv.get({ kind: "Identifier", name: "y" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: param(1),
      variables: [],
    });
    expect(getEnv("x::_::y::z", list(int())).typeEnv.get({ kind: "Identifier", name: "z" })).toMatchObject<TypeScheme>({
      kind: "TypeScheme",
      type: list(int()),
      variables: [],
    });
    expect(getEnv("x::_::y::z", list(int())).equations).toMatchObject<TypeEquation[]>([
      { lhs: list(int()), rhs: list(param(0)) },
      { lhs: list(int()), rhs: list(param(1)) },
    ]);
  });
});

import { Limits, Int32Type, ResultType, FuncType, MemType } from "./structure-types";

export function limits(min: number, max: number | null): Limits {
  return {
    kind: "Limits",
    min,
    max,
  };
}

export function int32Type(): Int32Type {
  return {
    kind: "Int32Type",
  };
}

export function funcType(params: ResultType, results: ResultType): FuncType {
  return {
    kind: "FuncType",
    paramType: params,
    resultType: results,
  };
}

export function memType(limits: Limits): MemType {
  return {
    kind: "MemType",
    limits,
  };
}

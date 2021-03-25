import { EvaluationValue, Closure, RecClosure, EvaluationList } from "./types";

export function isList(value: EvaluationValue): value is EvaluationList {
  return Array.isArray(value);
}

export function isClosure(value: EvaluationValue): value is Closure {
  if (isList(value)) return false;
  return typeof value === "object" && value.kind === "Closure";
}

export function isRecClosure(value: EvaluationValue): value is RecClosure {
  if (isList(value)) return false;
  return typeof value === "object" && value.kind === "Closure" && value.closureModifier === "Recursive";
}

export function getEvaluationResultTypeName(value: EvaluationValue): string {
  if (isList(value)) {
    return "list";
  } else if (isRecClosure(value)) {
    return "recursive function";
  } else if (isClosure(value)) {
    return "function";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  }
  return undefined as never;
}

export function getPrintableEvaluationValue(value: EvaluationValue): any {
  if (isClosure(value)) return "<fun>";
  return value;
}

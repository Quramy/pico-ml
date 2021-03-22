import { EvaluationValue, Closure, RecClosure, EvaluationResult, EvaluationList } from "./types";

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

export function getEvaluationResultValue(result: EvaluationResult): string {
  if (!result.ok) return result.value.message;
  if (isList(result.value) || isClosure(result.value)) return getEvaluationResultTypeName(result.value);
  return result.value.toString();
}

export function getPrintableEvaluationValue(value: EvaluationValue): any {
  if (isClosure(value)) return "<fun>";
  return value;
}

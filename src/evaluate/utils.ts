import { EvaluationValue, Closure, RecClosure, EvaluationResult } from "./types";

export function isClosure(value: EvaluationValue): value is Closure {
  return typeof value === "object" && value.kind === "Closure";
}

export function isRecClosure(value: EvaluationValue): value is RecClosure {
  return typeof value === "object" && value.kind === "Closure" && value.closureModifier === "Recursive";
}
export function getEvaluationResultTypeName(value: EvaluationValue): string {
  if (isRecClosure(value)) {
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
  if (isClosure(result.value)) return getEvaluationResultTypeName(result.value);
  return result.value.toString();
}

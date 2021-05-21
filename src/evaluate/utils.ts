import { Result, error, ok } from "../structure";
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

export function equal(left: EvaluationValue, right: EvaluationValue): Result<boolean> {
  if (typeof left === "number" && typeof right === "number") return ok(left === right);
  if (typeof left === "boolean" && typeof right === "boolean") return ok(left === right);
  if (isList(left) && isList(right)) {
    if (left.length === 0 && right.length === 0) return ok(true);
    return ok(left === right);
  }
  if (isClosure(left) && isClosure(right)) return ok(left === right);
  return error({
    message: "Operand type mismatch.",
  });
}

export function map2num(...operands: EvaluationValue[]) {
  return (cb: (...numberOperands: number[]) => EvaluationValue) => {
    for (const operand of operands) {
      if (typeof operand !== "number") {
        return error({ message: `The operand is not number. ${getEvaluationResultTypeName(operand)}` });
      }
    }
    return ok(cb(...(operands as number[])));
  };
}

export function map2bool(...operands: EvaluationValue[]) {
  return (cb: (...numberOperands: boolean[]) => EvaluationValue) => {
    for (const operand of operands) {
      if (typeof operand !== "boolean") {
        return error({ message: `The operand is not boolean. ${getEvaluationResultTypeName(operand)}` });
      }
    }
    return ok(cb(...(operands as boolean[])));
  };
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

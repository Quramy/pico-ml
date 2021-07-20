import { ok, error, mapValue, Result } from "../../structure";
import { ComparisonOperations } from "../../syntax";
import { EvaluationValue } from "../types";
import { isClosure, isList } from "../utils";

function deepEqual<T extends EvaluationValue>(left: T, right: T): Result<boolean> {
  if (typeof left === "number" || typeof left === "boolean") {
    return ok(left === right);
  }
  if (isList(left) && isList(right)) {
    if (left.length !== right.length) return ok(false);
    return mapValue(...left.map((x, i) => deepEqual(x, right[i])))((...values: boolean[]) => ok(values.every(x => x)));
  }
  if (isClosure(left) || isClosure(right)) {
    return error({
      message: "Invalid_argument compare: functional value",
    });
  }
  return error({
    message: "Type mismatch.",
  });
}

export function compare(left: EvaluationValue, right: EvaluationValue, op: ComparisonOperations): Result<boolean> {
  if (
    (typeof left === "number" && typeof right === "number") ||
    (typeof left === "boolean" && typeof right === "boolean")
  ) {
    switch (op.kind) {
      case "LessThan":
        return ok(left < right);
      case "LessEqualThan":
        return ok(left <= right);
      case "GreaterThan":
        return ok(left > right);
      case "GreaterEqualThan":
        return ok(left >= right);
      case "Equal":
        return ok(left === right);
      case "NotEqual":
        return ok(left !== right);
      default:
        // @ts-expect-error
        throw new Error(`invalid operation: ${op.kind}`);
    }
  }
  if (isClosure(left) || isClosure(right)) {
    if (op.kind === "Equal") {
      return ok(left === right);
    } else if (op.kind === "NotEqual") {
      return ok(left !== right);
    }
    return error({
      message: "Invalid_argument compare: functional value",
    });
  }
  if (isList(left) && isList(right)) {
    if (op.kind === "Equal") {
      return ok((left.length === 0 && right.length === 0) || left === right);
    } else if (op.kind === "NotEqual") {
      return ok((left.length !== 0 || right.length !== 0) && left !== right);
    } else {
      if (left.length === 0 || right.length === 0) {
        return compare(left.length, right.length, op);
      } else {
        const [lHead, ...lTail] = left;
        const [rHead, ...rTail] = right;
        return compare(lHead, rHead, op).mapValue(headComparisonResult => {
          if (headComparisonResult) {
            return ok(true);
          }
          return deepEqual(lHead, rHead).mapValue(isHeadEqual => {
            if (isHeadEqual) {
              return compare(lTail, rTail, op);
            } else {
              return ok(false);
            }
          });
        });
      }
    }
  }
  return error({
    message: `Type mismatch. left: ${left}, right: ${right}`,
  });
}

import { mapValue } from "../../structure";
import { EvaluateNodeFn } from "../types";
import { map2num } from "../utils";

export const binaryExpression: EvaluateNodeFn<"BinaryExpression"> = (expression, env, next) =>
  mapValue(
    next(expression.left, env),
    next(expression.right, env),
  )((left, right) => {
    switch (expression.op.kind) {
      case "Add":
        return map2num(left, right)((l, r) => l + r).error(err => ({ ...err, occurence: expression }));
      case "Sub":
        return map2num(left, right)((l, r) => l - r).error(err => ({ ...err, occurence: expression }));
      case "Multiply":
        return map2num(left, right)((l, r) => l * r).error(err => ({ ...err, occurence: expression }));
      case "LessThan":
        return map2num(left, right)((l, r) => l < r).error(err => ({ ...err, occurence: expression }));
      default:
        // @ts-expect-error
        throw new Error(`invalid operation: ${expression.op.kind}`);
    }
  });

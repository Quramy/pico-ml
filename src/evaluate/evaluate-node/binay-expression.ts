import { mapValue } from "../../structure";
import { EvaluateNodeFn } from "../types";
import { map2num, map2bool } from "../utils";
import { compare } from "./comparetor";

export const binaryExpression: EvaluateNodeFn<"BinaryExpression"> = (expression, env, next) =>
  mapValue(
    next(expression.left, env),
    next(expression.right, env),
  )((left, right) => {
    switch (expression.op.kind) {
      case "Add":
      case "FAdd":
        return map2num(left, right)((l, r) => l + r).error(err => ({ ...err, occurence: expression }));
      case "Sub":
      case "FSub":
        return map2num(left, right)((l, r) => l - r).error(err => ({ ...err, occurence: expression }));
      case "Multiply":
      case "FMultiply":
        return map2num(left, right)((l, r) => l * r).error(err => ({ ...err, occurence: expression }));
      case "Or":
        return map2bool(left, right)((l, r) => l || r).error(err => ({ ...err, occurence: expression }));
      case "And":
        return map2bool(left, right)((l, r) => l && r).error(err => ({ ...err, occurence: expression }));
      case "LessThan":
      case "LessEqualThan":
      case "GreaterThan":
      case "GreaterEqualThan":
      case "Equal":
      case "NotEqual":
        return compare(left, right, expression.op).error(err => ({ ...err, occurence: expression }));
      default:
        // @ts-expect-error
        throw new Error(`invalid operation: ${expression.op.kind}`);
    }
  });

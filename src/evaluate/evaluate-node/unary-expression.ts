import { EvaluateNodeFn } from "../types";
import { map2num } from "../utils";

export const unaryExpression: EvaluateNodeFn<"UnaryExpression"> = (expression, env, next) =>
  next(expression.exp, env).mapValue(exp => {
    switch (expression.op.kind) {
      case "Minus":
        return map2num(exp)(v => -1 * v).error(err => ({ ...err, occurence: expression }));
      default:
        throw new Error(`invalid operation: ${expression.op.kind}`);
    }
  });

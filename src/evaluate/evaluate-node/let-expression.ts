import { EvaluateNodeFn } from "../types";
import { createChildEnvironment } from "../environment";

export const letExpression: EvaluateNodeFn<"LetExpression"> = (expression, env, next) =>
  next(expression.binding, env).mapValue(boundValue =>
    next(expression.exp, createChildEnvironment(expression.identifier, boundValue, env)),
  );

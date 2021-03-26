import { EvaluateNodeFn } from "../types";
import { createRecClosure } from "../closure";
import { createChildEnvironment } from "../environment";

export const letRecExpression: EvaluateNodeFn<"LetRecExpression"> = (expression, env, next) => {
  const { identifier, binding, exp } = expression;
  const boundValue = createRecClosure(binding, env, identifier);
  const childEnv = createChildEnvironment(identifier, boundValue, env);
  return next(exp, childEnv);
};

import { mapValue, error } from "../../structure";
import { EvaluateNodeFn } from "../types";
import { isClosure, getEvaluationResultTypeName, isRecClosure } from "../utils";
import { createChildEnvironment } from "../environment";

export const functionApplication: EvaluateNodeFn<"FunctionApplication"> = (expression, env, next) =>
  mapValue(
    next(expression.callee, env),
    next(expression.argument, env),
  )((callee, argument) => {
    if (!isClosure(callee)) {
      return error({ message: `should be function, but ${getEvaluationResultTypeName(callee)}}` });
    }
    if (!isRecClosure(callee)) {
      return next(
        callee.functionDefinition.body,
        createChildEnvironment(callee.functionDefinition.param, argument, callee.env),
      );
    } else {
      const recEnv = createChildEnvironment(callee.recursievId, callee, callee.env);
      return next(
        callee.functionDefinition.body,
        createChildEnvironment(callee.functionDefinition.param, argument, recEnv),
      );
    }
  });

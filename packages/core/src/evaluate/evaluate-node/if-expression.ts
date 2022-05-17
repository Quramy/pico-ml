import { error } from "../../structure";
import { EvaluateNodeFn } from "../types";
import { getEvaluationResultTypeName } from "../utils";

export const ifExpression: EvaluateNodeFn<"IfExpression"> = (expression, env, next) =>
  next(expression.cond, env).mapValue(condition => {
    if (typeof condition === "boolean") {
      if (condition) {
        return next(expression.then, env);
      } else {
        return next(expression.else, env);
      }
    } else {
      return error({
        message: `condition should be boolean, but: ${getEvaluationResultTypeName(condition)}.`,
        occurence: expression.cond,
      });
    }
  });

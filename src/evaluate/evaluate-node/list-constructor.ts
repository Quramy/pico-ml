import { mapValue, ok, error } from "../../structure";
import { EvaluateNodeFn } from "../types";
import { getEvaluationResultTypeName, isList } from "../utils";

export const listConstructor: EvaluateNodeFn<"ListConstructor"> = (expression, env, next) =>
  mapValue(
    next(expression.head, env),
    next(expression.tail, env),
  )((head, tail) => {
    if (!isList(tail)) {
      return error({ message: `The operand is not a list. ${getEvaluationResultTypeName(tail)}` });
    }
    return ok(isList(head) ? [...head, ...tail] : [head, ...tail]);
  });

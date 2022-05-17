import { ok, error } from "../../structure";
import { EvaluateNodeFn } from "../types";

export const identifier: EvaluateNodeFn<"Identifier"> = (expression, env) => {
  const value = env.get(expression);
  if (value == null) {
    return error({ message: `variable ${expression.name} is not defined`, occurence: expression });
  }
  return ok(value);
};

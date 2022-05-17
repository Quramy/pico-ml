import { ok } from "../../structure";
import { EvaluateNodeFn } from "../types";
import { createClosure } from "../closure";

export const functionDefinition: EvaluateNodeFn<"FunctionDefinition"> = (expression, env) =>
  ok(createClosure(expression, env));

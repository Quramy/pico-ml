import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { substituteType } from "../substitute";
import { createChildEnvironment } from "../type-environment";
import { schemeFromType } from "../utils";

export const functionDefinition: PrimaryTypeNode<"FunctionDefinition"> = (expression, ctx, next) => {
  const paramType = ctx.generator.gen();
  const env = createChildEnvironment(expression.param, schemeFromType(paramType), ctx.env);
  return next(expression.body, { ...ctx, env }).mapValue(body =>
    result.ok(
      substituteType(
        {
          kind: "Function",
          paramType,
          returnType: body.expressionType,
        },
        ...body.substitutions,
      ),
      body.substitutions,
    ),
  );
};

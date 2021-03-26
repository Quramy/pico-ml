import { mapValue } from "../../structure";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet, substituteType, substituteEnv } from "../substitute";
import { getClosure } from "../ftv";
import { createChildEnvironment } from "../type-environment";
import { schemeFromType } from "../utils";

export const letRecExpression: PrimaryTypeNode<"LetRecExpression"> = (expression, ctx, next) => {
  const funcType = ctx.generator.gen();
  const paramType = ctx.generator.gen();
  const bodyEnv = createChildEnvironment(
    expression.binding.param,
    schemeFromType(paramType),
    createChildEnvironment(expression.identifier, schemeFromType(funcType), ctx.env),
  );
  return next(expression.binding.body, { ...ctx, env: bodyEnv }).mapValue(bindingBody =>
    unify([
      ...toEquationSet(bindingBody),
      {
        lhs: funcType,
        rhs: {
          kind: "Function",
          paramType,
          returnType: bindingBody.expressionType,
        },
      },
    ]).mapValue(unifiedBody => {
      const scheme = getClosure(substituteType(funcType, ...unifiedBody), substituteEnv(ctx.env, ...unifiedBody));
      const childEnv = createChildEnvironment(expression.identifier, scheme, ctx.env);
      return mapValue(next(expression.exp, { ...ctx, env: childEnv }))(exp =>
        unify(toEquationSet({ substitutions: unifiedBody }, exp)).mapValue(unifiedExp =>
          result.ok(substituteType(exp.expressionType, ...unifiedExp), unifiedExp),
        ),
      );
    }),
  );
};

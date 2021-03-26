import { mapValue } from "../../structure";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet, substituteType, substituteEnv } from "../substitute";
import { getClosure } from "../ftv";
import { createChildEnvironment } from "../type-environment";

export const letExpression: PrimaryTypeNode<"LetExpression"> = (expression, ctx, next) =>
  mapValue(next(expression.binding, ctx))(binding => {
    const scheme = getClosure(binding.expressionType, substituteEnv(ctx.env, ...binding.substitutions));
    const env = createChildEnvironment(expression.identifier, scheme, ctx.env);
    return next(expression.exp, { ...ctx, env }).mapValue(exp =>
      unify(toEquationSet(binding, exp)).mapValue(unified =>
        result.ok(substituteType(exp.expressionType, ...unified), unified),
      ),
    );
  });

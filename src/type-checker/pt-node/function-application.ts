import { mapValue } from "../../structure";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet, substituteType } from "../substitute";

export const functionApplication: PrimaryTypeNode<"FunctionApplication"> = (expression, ctx, next) =>
  mapValue(
    next(expression.callee, ctx),
    next(expression.argument, ctx),
  )((callee, argument) => {
    const returnType = ctx.generator.gen(expression);
    return unify([
      ...toEquationSet(callee, argument),
      {
        lhs: {
          kind: "Function",
          paramType: argument.expressionType,
          returnType,
          referencedFrom: expression.callee,
        },
        rhs: callee.expressionType,
      },
    ]).mapValue(unified => result.ok(substituteType(returnType, ...unified), unified));
  });

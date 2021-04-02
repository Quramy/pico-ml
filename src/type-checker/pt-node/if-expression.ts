import { mapValue } from "../../structure";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet, substituteType } from "../substitute";

export const ifExpression: PrimaryTypeNode<"IfExpression"> = (expression, ctx, next) =>
  mapValue(
    next(expression.cond, ctx),
    next(expression.then, ctx),
    next(expression.else, ctx),
  )((cond, thenVal, elseVal) =>
    unify([
      ...toEquationSet(cond, thenVal, elseVal),
      {
        lhs: cond.expressionType,
        rhs: {
          kind: "Bool",
          referencedFrom: expression.cond,
        },
      },
      {
        lhs: thenVal.expressionType,
        rhs: elseVal.expressionType,
      },
    ]).mapValue(unified => result.ok(substituteType(thenVal.expressionType, ...unified), unified)),
  );

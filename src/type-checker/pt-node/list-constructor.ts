import { mapValue } from "../../structure";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet, substituteType } from "../substitute";

export const listConstructor: PrimaryTypeNode<"ListConstructor"> = (expression, ctx, next) =>
  mapValue(
    next(expression.head, ctx),
    next(expression.tail, ctx),
  )((head, tail) =>
    unify([
      ...toEquationSet(head, tail),
      {
        lhs: tail.expressionType,
        rhs: {
          kind: "List",
          elementType: head.expressionType,
          referencedFrom: expression,
        },
      },
    ]).mapValue(unified => result.ok(substituteType(tail.expressionType, ...unified), unified)),
  );

import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { toEquationSet } from "../substitute";
import { unify } from "../unify";

export const unaryExpression: PrimaryTypeNode<"UnaryExpression"> = (expression, ctx, next) => {
  switch (expression.op.kind) {
    case "Minus":
      return next(expression.exp, ctx).mapValue(exp =>
        unify([
          ...toEquationSet(exp),
          { lhs: exp.expressionType, rhs: { kind: "Int", referencedFrom: expression } },
        ]).mapValue(unified =>
          result.ok(
            {
              kind: "Int",
              referencedFrom: expression,
            },
            unified,
          ),
        ),
      );
    case "FMinus":
      return next(expression.exp, ctx).mapValue(exp =>
        unify([
          ...toEquationSet(exp),
          { lhs: exp.expressionType, rhs: { kind: "Float", referencedFrom: expression } },
        ]).mapValue(unified =>
          result.ok(
            {
              kind: "Float",
              referencedFrom: expression,
            },
            unified,
          ),
        ),
      );
    default:
      // @ts-expect-error
      throw new Error(`invalid operation ${expression.op.kind}`);
  }
};

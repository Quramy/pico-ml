import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { toEquationSet } from "../substitute";
import { unify } from "../unify";

export const unaryExpression: PrimaryTypeNode<"UnaryExpression"> = (expression, ctx, next) => {
  switch (expression.op.kind) {
    case "Minus":
      return next(expression.exp, ctx).mapValue(exp =>
        unify([...toEquationSet(exp), { lhs: exp.expressionType, rhs: { kind: "Int" } }]).mapValue(unified =>
          result.ok(
            {
              kind: "Int",
            },
            unified,
          ),
        ),
      );
    default:
      throw new Error(`invalid operation ${expression.op.kind}`);
  }
};

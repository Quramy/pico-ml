import { mapValue } from "../../structure";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet } from "../substitute";

export const binaryExpression: PrimaryTypeNode<"BinaryExpression"> = (expression, ctx, next) => {
  switch (expression.op.kind) {
    case "Add":
    case "Sub":
    case "Multiply":
    case "LessThan":
      return mapValue(
        next(expression.left, ctx),
        next(expression.right, ctx),
      )((left, right) =>
        unify([
          ...toEquationSet(left, right),
          {
            lhs: left.expressionType,
            rhs: { kind: "Int" },
          },
          {
            lhs: right.expressionType,
            rhs: { kind: "Int" },
          },
        ]).mapValue(unified =>
          result.ok(
            {
              kind: expression.op.kind === "LessThan" ? "Bool" : "Int",
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

import { mapValue } from "../../structure";
import { BinaryOperation } from "../../parser";
import { PrimaryTypeNode } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet } from "../substitute";

const TYPES_BY_OP: Record<BinaryOperation["kind"], "Bool" | "Int"> = {
  Add: "Int",
  Sub: "Int",
  Multiply: "Int",
  LessThan: "Bool",
  LessEqualThan: "Bool",
  GreaterThan: "Bool",
  GreaterEqualThan: "Bool",
  Equal: "Bool",
  NotEqual: "Bool",
};

export const binaryExpression: PrimaryTypeNode<"BinaryExpression"> = (expression, ctx, next) => {
  return mapValue(
    next(expression.left, ctx),
    next(expression.right, ctx),
  )((left, right) =>
    unify([
      ...toEquationSet(left, right),
      {
        lhs: left.expressionType,
        rhs: { kind: "Int", referencedFrom: expression.left },
      },
      {
        lhs: right.expressionType,
        rhs: { kind: "Int", referencedFrom: expression.right },
      },
    ]).mapValue(unified =>
      result.ok(
        {
          kind: TYPES_BY_OP[expression.op.kind],
          referencedFrom: expression,
        },
        unified,
      ),
    ),
  );
};

import { mapValue } from "../../structure";
import { BinaryOperation, BinaryExpressionNode } from "../../syntax";
import { PrimaryTypeNode, TypeEquation, PrimaryTypeValue } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet } from "../substitute";

const RESULT_TYPES_BY_OP: Record<BinaryOperation["kind"], "Bool" | "Int"> = {
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

function getConstraints(
  expression: BinaryExpressionNode,
  left: PrimaryTypeValue,
  right: PrimaryTypeValue,
): readonly TypeEquation[] {
  if (expression.op.kind === "Equal" || expression.op.kind === "NotEqual")
    return [{ lhs: left.expressionType, rhs: right.expressionType }];
  return [
    {
      lhs: left.expressionType,
      rhs: { kind: "Int", referencedFrom: expression.left },
    },
    {
      lhs: right.expressionType,
      rhs: { kind: "Int", referencedFrom: expression.right },
    },
  ];
}

export const binaryExpression: PrimaryTypeNode<"BinaryExpression"> = (expression, ctx, next) => {
  return mapValue(
    next(expression.left, ctx),
    next(expression.right, ctx),
  )((left, right) =>
    unify([...toEquationSet(left, right), ...getConstraints(expression, left, right)]).mapValue(unified =>
      result.ok(
        {
          kind: RESULT_TYPES_BY_OP[expression.op.kind],
          referencedFrom: expression,
        },
        unified,
      ),
    ),
  );
};

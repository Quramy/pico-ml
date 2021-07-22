import { mapValue } from "../../structure";
import {
  BinaryOperation,
  BinaryExpressionNode,
  LogicalOperation,
  ArithmericOperations,
  FArithmericOperations,
} from "../../syntax";
import { PrimaryTypeNode, TypeEquation, PrimaryTypeValue } from "../types";
import { result } from "./_result";
import { unify } from "../unify";
import { toEquationSet } from "../substitute";

const RESULT_TYPES_BY_OP: Record<BinaryOperation["kind"], "Bool" | "Int" | "Float"> = {
  Add: "Int",
  FAdd: "Float",
  Sub: "Int",
  FSub: "Float",
  Multiply: "Int",
  FMultiply: "Float",
  Div: "Int",
  FDiv: "Float",
  Or: "Bool",
  And: "Bool",
  LessThan: "Bool",
  LessEqualThan: "Bool",
  GreaterThan: "Bool",
  GreaterEqualThan: "Bool",
  Equal: "Bool",
  NotEqual: "Bool",
  PEqual: "Bool",
  PNotEqual: "Bool",
};

const OPERAND_TYPES_BY_OP: Record<
  (LogicalOperation | ArithmericOperations | FArithmericOperations)["kind"],
  "Bool" | "Int" | "Float"
> = {
  Add: "Int",
  FAdd: "Float",
  Sub: "Int",
  FSub: "Float",
  Multiply: "Int",
  FMultiply: "Float",
  Div: "Int",
  FDiv: "Float",
  Or: "Bool",
  And: "Bool",
};

function getConstraints(
  expression: BinaryExpressionNode,
  left: PrimaryTypeValue,
  right: PrimaryTypeValue,
): readonly TypeEquation[] {
  if (
    expression.op.kind === "LessThan" ||
    expression.op.kind === "LessEqualThan" ||
    expression.op.kind === "GreaterThan" ||
    expression.op.kind === "GreaterEqualThan" ||
    expression.op.kind === "Equal" ||
    expression.op.kind === "NotEqual" ||
    expression.op.kind === "PEqual" ||
    expression.op.kind === "PNotEqual"
  ) {
    return [{ lhs: left.expressionType, rhs: right.expressionType }];
  }

  return [
    {
      lhs: left.expressionType,
      rhs: { kind: OPERAND_TYPES_BY_OP[expression.op.kind], referencedFrom: expression.left },
    },
    {
      lhs: right.expressionType,
      rhs: { kind: OPERAND_TYPES_BY_OP[expression.op.kind], referencedFrom: expression.right },
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

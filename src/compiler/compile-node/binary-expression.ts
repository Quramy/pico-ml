import { ok, error, all, Result } from "../../structure";
import { BinaryExpressionNode } from "../../syntax";
import { CompileNodeFn } from "../types";
import { factory, InstructionNode } from "../../wasm";

function getOperationInstr(node: BinaryExpressionNode): Result<readonly InstructionNode[]> {
  switch (node.op.kind) {
    case "Add":
      return ok([factory.numericInstr("i32.add", [])]);
    case "Sub":
      return ok([factory.numericInstr("i32.sub", [])]);
    case "Multiply":
      return ok([factory.numericInstr("i32.mul", [])]);
    case "LessThan":
      return ok([factory.numericInstr("i32.lt_s", [])]);
    case "LessEqualThan":
      return ok([factory.numericInstr("i32.le_s", [])]);
    case "GreaterThan":
      return ok([factory.numericInstr("i32.gt_s", [])]);
    case "GreaterEqualThan":
      return ok([factory.numericInstr("i32.ge_s", [])]);
    case "Or":
      return ok([factory.numericInstr("i32.or", [])]);
    case "And":
      return ok([factory.numericInstr("i32.and", [])]);
    case "Equal": // FIXME
      return ok([factory.numericInstr("i32.eq", [])]);
    case "NotEqual":
      return ok([factory.numericInstr("i32.ne", [])]);
    default:
      // @ts-expect-error
      return error({ message: `invalid kind: ${node.op.kind}` });
  }
}

export const binaryExpression: CompileNodeFn<"BinaryExpression"> = (node, ctx, next) =>
  all([
    next(node.left, ctx),
    next(node.right, ctx),
    getOperationInstr(node).error(err => ({ ...err, occurence: node })),
  ]).map(lr => lr.flat());

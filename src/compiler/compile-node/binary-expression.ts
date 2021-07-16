import { mapValue, ok, error, Result } from "../../structure";
import { BinaryOperation } from "../../syntax";
import { CompileNodeFn, CompilationValue } from "../types";
import { factory, InstructionNode } from "../../wasm";

function getOperationInstr(
  left: CompilationValue,
  right: CompilationValue,
  op: BinaryOperation,
): Result<readonly InstructionNode[]> {
  switch (op.kind) {
    case "Add":
      // 2(a + b) + 1 = (2a + 1) + (2b + 1) - 1 = A + B - 1
      return ok([
        ...left,
        ...right,
        factory.numericInstr("i32.add", []),
        factory.numericInstr("i32.const", [factory.int32(1)]),
        factory.numericInstr("i32.sub", []),
      ]);
    case "Sub":
      // 2(a - b) + 1 = (2a + 1) - (2b + 1) + 1 = A - B + 1
      return ok([
        ...left,
        ...right,
        factory.numericInstr("i32.sub", []),
        factory.numericInstr("i32.const", [factory.int32(1)]),
        factory.numericInstr("i32.add", []),
      ]);
    case "Multiply": {
      // 2ab + 1 = (2a + 1 - 1) * b  + 1 = (A - 1) * (B >> 1) + 1
      return ok([
        ...left,
        factory.numericInstr("i32.const", [factory.int32(1)]),
        factory.numericInstr("i32.sub", []),
        ...right,
        factory.numericInstr("i32.const", [factory.int32(1)]),
        factory.numericInstr("i32.shr_s", []),
        factory.numericInstr("i32.mul", []),
        factory.numericInstr("i32.const", [factory.int32(1)]),
        factory.numericInstr("i32.add", []),
      ]);
    }
    case "Or":
      return ok([...left, ...right, factory.numericInstr("i32.or", [])]);
    case "And":
      return ok([...left, ...right, factory.numericInstr("i32.and", [])]);
    case "LessThan":
      return ok([...left, ...right, factory.numericInstr("i32.lt_s", [])]);
    case "LessEqualThan":
      return ok([...left, ...right, factory.numericInstr("i32.le_s", [])]);
    case "GreaterThan":
      return ok([...left, ...right, factory.numericInstr("i32.gt_s", [])]);
    case "GreaterEqualThan":
      return ok([...left, ...right, factory.numericInstr("i32.ge_s", [])]);
    case "Equal":
      return ok([...left, ...right, factory.numericInstr("i32.eq", [])]);
    case "NotEqual":
      return ok([...left, ...right, factory.numericInstr("i32.ne", [])]);
    case "FAdd": // TODO
    case "FSub": // TODO
    case "FMultiply": // TODO
    default:
      return error({ message: `invalid kind: ${op.kind}` });
  }
}

export const binaryExpression: CompileNodeFn<"BinaryExpression"> = (node, ctx, next) =>
  mapValue(
    next(node.left, ctx),
    next(node.right, ctx),
  )((left, right) => getOperationInstr(left, right, node.op).error(err => ({ ...err, occurence: node })));

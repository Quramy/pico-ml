import { mapValue, ok, error, Result } from "../../structure";
import { BinaryOperation } from "../../syntax";
import { CompileNodeFn, CompilationValue } from "../types";
import { factory, InstructionNode } from "../../wasm";
import { getFloatValueInstr, storeFloatValueInstr } from "../assets/modules/float";

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
        factory.int32NumericInstr("i32.add", []),
        factory.int32NumericInstr("i32.const", [factory.int32(1)]),
        factory.int32NumericInstr("i32.sub", []),
      ]);
    case "Sub":
      // 2(a - b) + 1 = (2a + 1) - (2b + 1) + 1 = A - B + 1
      return ok([
        ...left,
        ...right,
        factory.int32NumericInstr("i32.sub", []),
        factory.int32NumericInstr("i32.const", [factory.int32(1)]),
        factory.int32NumericInstr("i32.add", []),
      ]);
    case "Multiply": {
      // 2ab + 1 = (2a + 1 - 1) * b  + 1 = (A - 1) * (B >> 1) + 1
      return ok([
        ...left,
        factory.int32NumericInstr("i32.const", [factory.int32(1)]),
        factory.int32NumericInstr("i32.sub", []),
        ...right,
        factory.int32NumericInstr("i32.const", [factory.int32(1)]),
        factory.int32NumericInstr("i32.shr_s", []),
        factory.int32NumericInstr("i32.mul", []),
        factory.int32NumericInstr("i32.const", [factory.int32(1)]),
        factory.int32NumericInstr("i32.add", []),
      ]);
    }
    case "Or":
      return ok([...left, ...right, factory.int32NumericInstr("i32.or", [])]);
    case "And":
      return ok([...left, ...right, factory.int32NumericInstr("i32.and", [])]);
    case "LessThan":
      return ok([...left, ...right, factory.int32NumericInstr("i32.lt_s", [])]);
    case "LessEqualThan":
      return ok([...left, ...right, factory.int32NumericInstr("i32.le_s", [])]);
    case "GreaterThan":
      return ok([...left, ...right, factory.int32NumericInstr("i32.gt_s", [])]);
    case "GreaterEqualThan":
      return ok([...left, ...right, factory.int32NumericInstr("i32.ge_s", [])]);
    case "Equal":
      return ok([...left, ...right, factory.int32NumericInstr("i32.eq", [])]);
    case "NotEqual":
      return ok([...left, ...right, factory.int32NumericInstr("i32.ne", [])]);
    case "FAdd":
      return ok([
        ...left,
        ...getFloatValueInstr(),
        ...right,
        ...getFloatValueInstr(),
        factory.float64NumericInstr("f64.add", []),
        ...storeFloatValueInstr(),
      ]);
    case "FSub":
      return ok([
        ...left,
        ...getFloatValueInstr(),
        ...right,
        ...getFloatValueInstr(),
        factory.float64NumericInstr("f64.sub", []),
        ...storeFloatValueInstr(),
      ]);
    case "FMultiply":
      return ok([
        ...left,
        ...getFloatValueInstr(),
        ...right,
        ...getFloatValueInstr(),
        factory.float64NumericInstr("f64.mul", []),
        ...storeFloatValueInstr(),
      ]);
    default:
      // @ts-expect-error
      return error({ message: `invalid kind: ${op.kind}` });
  }
}

export const binaryExpression: CompileNodeFn<"BinaryExpression"> = (node, ctx, next) => {
  const opKind = node.op.kind;
  if (opKind === "FAdd" || opKind === "FSub" || opKind === "FMultiply") {
    ctx.useFloat();
  }
  return mapValue(
    next(node.left, ctx),
    next(node.right, ctx),
  )((left, right) => getOperationInstr(left, right, node.op).error(err => ({ ...err, occurence: node })));
};

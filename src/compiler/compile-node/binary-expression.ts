import { ok, mapValue } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const binaryExpression: CompileNodeFn<"BinaryExpression"> = (node, ctx, next) => {
  return mapValue(
    next(node.left, ctx),
    next(node.right, ctx),
  )(() => {
    switch (node.op.kind) {
      case "Add":
        ctx.pushInstruction(factory.numericInstr("i32.add", []));
        break;
      case "Sub":
        ctx.pushInstruction(factory.numericInstr("i32.sub", []));
        break;
      case "Multiply":
        ctx.pushInstruction(factory.numericInstr("i32.mul", []));
        break;
      case "LessThan":
        ctx.pushInstruction(factory.numericInstr("i32.lt_s", []));
        break;
      case "LessEqualThan":
        ctx.pushInstruction(factory.numericInstr("i32.le_s", []));
        break;
      case "GreaterThan":
        ctx.pushInstruction(factory.numericInstr("i32.gt_s", []));
        break;
      case "GreaterEqualThan":
        ctx.pushInstruction(factory.numericInstr("i32.ge_s", []));
        break;

      case "Equal": // FIXME
        ctx.pushInstruction(factory.numericInstr("i32.eq", []));
        break;
      case "NotEqual":
        ctx.pushInstruction(factory.numericInstr("i32.ne", []));
        break;
      default:
        // @ts-expect-error
        throw new Error(`invalid kind ${node.op.kind}`);
    }
    return ok(true);
  });
};

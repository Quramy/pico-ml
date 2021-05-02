import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const unaryExpression: CompileNodeFn<"UnaryExpression"> = (node, ctx, next) => {
  return next(node.exp, ctx).mapValue(() => {
    ctx.pushInstruction(factory.numericInstr("i32.const", [factory.int32(-1)]));
    ctx.pushInstruction(factory.numericInstr("i32.mul", []));
    return ok(true);
  });
};

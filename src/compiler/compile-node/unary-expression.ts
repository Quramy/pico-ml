import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const unaryExpression: CompileNodeFn<"UnaryExpression"> = (node, ctx, next) =>
  next(node.exp, ctx).map(instructions => [
    ...instructions,
    factory.int32NumericInstr("i32.const", [factory.int32(-1)]),
    factory.int32NumericInstr("i32.mul", []),
    factory.int32NumericInstr("i32.const", [factory.int32(2)]),
    factory.int32NumericInstr("i32.add", []),
  ]);

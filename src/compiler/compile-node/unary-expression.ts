import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const unaryExpression: CompileNodeFn<"UnaryExpression"> = (node, ctx, next) =>
  next(node.exp, ctx).map(instructions => [
    ...instructions,
    factory.numericInstr("i32.const", [factory.int32(-1)]),
    factory.numericInstr("i32.mul", []),
  ]);

import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { storeFloatValueInstr, getFloatValueInstr } from "../assets/modules/float";

export const unaryExpression: CompileNodeFn<"UnaryExpression"> = (node, ctx, next) => {
  const { kind } = node.op;
  if (kind === "Minus") {
    return next(node.exp, ctx).map(instructions => [
      ...instructions,
      factory.int32NumericInstr("i32.const", [factory.int32(-1)]),
      factory.int32NumericInstr("i32.mul", []),
      factory.int32NumericInstr("i32.const", [factory.int32(2)]),
      factory.int32NumericInstr("i32.add", []),
    ]);
  } else {
    ctx.useFloat();
    return next(node.exp, ctx).map(instructions => [
      ...instructions,
      ...getFloatValueInstr(),
      factory.float64NumericInstr("f64.const", [factory.float64(-1)]),
      factory.float64NumericInstr("f64.mul", []),
      ...storeFloatValueInstr(),
    ]);
  }
};

import { CompileNodeFn } from "../types";
import { wat } from "../../wasm";
import { storeFloatValueInstr, getFloatValueInstr } from "../assets/modules/float";

export const unaryExpression: CompileNodeFn<"UnaryExpression"> = (node, ctx, next) => {
  if (node.op.kind === "Minus") {
    return next(node.exp, ctx).map(instructions =>
      wat.instructions`
        ${() => instructions}
        i32.const -1
        i32.mul
        i32.const 2
        i32.add
      `(),
    );
  } else if (node.op.kind === "FMinus") {
    ctx.useFloat();
    return next(node.exp, ctx).map(instructions =>
      wat.instructions`
        ${() => instructions}
        ${getFloatValueInstr}
        f64.const -1
        f64.mul
        ${storeFloatValueInstr}
      `(),
    );
  } else {
    // @ts-expect-error
    throw new Error(`invalid operation kind: ${node.op.kind}`);
  }
};

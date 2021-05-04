import { factory } from "../../wasm";
import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";

export const functionDefinition: CompileNodeFn<"FunctionDefinition"> = (node, ctx, next) => {
  ctx.funcDefStack.enter();
  const parentEnv = ctx.getEnv();
  const funcEnv = createChildEnvironment(node.param, parentEnv);
  ctx.setEnv(funcEnv);
  return next(node.body, ctx)
    .map(functionBodyExpr => {
      const funcIndex = ctx.funcDefStack.leave(functionBodyExpr);
      return [factory.numericInstr("i32.const", [factory.int32(funcIndex)])];
    })
    .tap(() => ctx.setEnv(parentEnv));
};

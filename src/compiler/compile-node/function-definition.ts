import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { newClosureInstr } from "./macro/closure";

export const functionDefinition: CompileNodeFn<"FunctionDefinition"> = (node, ctx, next) => {
  ctx.funcDefStack.enter();
  const parentEnv = ctx.getEnv();
  const funcEnv = createChildEnvironment(node.param, parentEnv);
  ctx.setEnv(funcEnv);
  return next(node.body, ctx)
    .map(functionBodyExpr => newClosureInstr(ctx)(ctx.funcDefStack.leave(functionBodyExpr)))
    .tap(() => ctx.setEnv(parentEnv));
};

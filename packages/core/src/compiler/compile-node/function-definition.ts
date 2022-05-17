import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { newClosureInstr } from "./macro/closure";

export const functionDefinition: CompileNodeFn<"FunctionDefinition"> = (node, ctx, next) => {
  ctx.funcDefStack.enter();
  const parentEnv = ctx.getEnv();
  // Note
  // Expression in FunctionDefinitionNode is not allowed to refer the function itself.
  const funcNameEnv = createChildEnvironment({ kind: "Identifier", name: "__anonymous__" }, parentEnv);
  const funcParamEnv = createChildEnvironment(node.param, funcNameEnv);
  ctx.setEnv(funcParamEnv);
  return next(node.body, ctx)
    .map(functionBodyExpr => newClosureInstr(ctx)(ctx.funcDefStack.leave(functionBodyExpr)))
    .tap(() => ctx.setEnv(parentEnv));
};

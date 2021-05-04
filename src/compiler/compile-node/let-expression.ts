import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { newEnvInstr, popEnvInstr, getEnvAddrInstr } from "../assets/modules/env";

export const letExpression: CompileNodeFn<"LetExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  const parentEnv = ctx.getEnv();
  ctx.pushInstruction(getEnvAddrInstr());
  return next(node.binding, ctx).mapValue(() => {
    ctx.pushInstruction(newEnvInstr());
    const childEnv = createChildEnvironment(node.identifier, parentEnv);
    ctx.setEnv(childEnv);
    return next(node.exp, ctx).mapValue(() => {
      ctx.setEnv(parentEnv);
      ctx.pushInstruction(popEnvInstr());
      return ok(true);
    });
  });
};

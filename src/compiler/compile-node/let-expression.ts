import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { createChildEnvironment } from "../environment";
import { newEnvInstr, popEnvInstr } from "../assets/modules/env";

export const letExpression: CompileNodeFn<"LetExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  const parentEnv = ctx.getEnv();
  ctx.pushInstruction(factory.variableInstr("local.get", [factory.identifier("current_env_addr")]));
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

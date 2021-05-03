import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { createChildEnvironment } from "../environment";

export const letExpression: CompileNodeFn<"LetExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  const parentEnv = ctx.getEnv();
  ctx.pushInstruction(factory.variableInstr("local.get", [factory.identifier("current_env_addr")]));
  return next(node.binding, ctx).mapValue(() => {
    ctx.pushInstruction(factory.controlInstr("call", [factory.identifier("__env_new__")]));
    const childEnv = createChildEnvironment(node.identifier, parentEnv);
    ctx.setEnv(childEnv);
    ctx.pushInstruction(factory.variableInstr("local.set", [factory.identifier("current_env_addr")]));
    return next(node.exp, ctx).mapValue(() => {
      ctx.setEnv(parentEnv);
      ctx.pushInstruction(factory.variableInstr("local.get", [factory.identifier("current_env_addr")]));
      ctx.pushInstruction(factory.controlInstr("call", [factory.identifier("__env_parent__")]));
      ctx.pushInstruction(factory.variableInstr("local.set", [factory.identifier("current_env_addr")]));
      return ok(true);
    });
  });
};

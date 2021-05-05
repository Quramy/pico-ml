import { all } from "../../structure";
import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { getEnvAddrInstr, newEnvInstrForLet, popEnvInstr } from "../assets/modules/env";
import { newClosureInstr } from "./macro/closure";

export const letRecExpression: CompileNodeFn<"LetRecExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.funcDefStack.enter();
  const parentEnv = ctx.getEnv();
  const recEnv = createChildEnvironment(node.identifier, parentEnv);
  ctx.setEnv(recEnv);
  const getClosureInstr = () => {
    const funcEnv = createChildEnvironment(node.binding.param, recEnv);
    ctx.setEnv(funcEnv);
    return next(node.binding.body, ctx)
      .map(functionBodyExpr => newClosureInstr(ctx)(ctx.funcDefStack.leave(functionBodyExpr), true))
      .tap(() => ctx.setEnv(recEnv));
  };
  const getInExpressionInstr = () => {
    ctx.setEnv(recEnv);
    return next(node.exp, ctx).map(instr => [...newEnvInstrForLet(), ...instr]);
  };
  return all([getClosureInstr(), getInExpressionInstr()])
    .map(list => [...getEnvAddrInstr(), ...list.flat(), ...popEnvInstr()])
    .tap(() => ctx.setEnv(parentEnv));
};

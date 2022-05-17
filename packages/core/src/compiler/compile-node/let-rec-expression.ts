import { all } from "../../structure";
import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { getEnvAddrInstr, newEnvInstrForLet, popEnvInstr } from "../assets/modules/env";
import { newClosureInstr } from "./macro/closure";

export const letRecExpression: CompileNodeFn<"LetRecExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.funcDefStack.enter();
  const parentEnv = ctx.getEnv();
  const funcNameEnv = createChildEnvironment(node.identifier, parentEnv);
  ctx.setEnv(funcNameEnv);
  const getClosureInstr = () => {
    const funcParamEnv = createChildEnvironment(node.binding.param, funcNameEnv);
    ctx.setEnv(funcParamEnv);
    return next(node.binding.body, ctx)
      .map(functionBodyExpr => newClosureInstr(ctx)(ctx.funcDefStack.leave(functionBodyExpr)))
      .tap(() => ctx.setEnv(funcNameEnv));
  };
  const getInExpressionInstr = () => {
    ctx.setEnv(funcNameEnv);
    return next(node.exp, ctx).map(instr => [...newEnvInstrForLet(), ...instr]);
  };
  return all([getClosureInstr(), getInExpressionInstr()])
    .map(list => [...getEnvAddrInstr(), ...list.flat(), ...popEnvInstr()])
    .tap(() => ctx.setEnv(parentEnv));
};

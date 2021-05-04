import { all } from "../../structure";
import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { newEnvInstr, popEnvInstr, getEnvAddrInstr } from "../assets/modules/env";

export const letExpression: CompileNodeFn<"LetExpression"> = (node, ctx, next) => {
  ctx.useEnvironment();
  const parentEnv = ctx.getEnv();
  const getInExpressionInstr = () => {
    const childEnv = createChildEnvironment(node.identifier, parentEnv);
    ctx.setEnv(childEnv);
    return next(node.exp, ctx)
      .tap(() => ctx.setEnv(parentEnv))
      .map(instr => [...newEnvInstr(), ...instr]);
  };
  return all([next(node.binding, ctx), getInExpressionInstr()]).map(list => [
    ...getEnvAddrInstr(),
    ...list.flat(),
    ...popEnvInstr(),
  ]);
};

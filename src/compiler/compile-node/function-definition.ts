import { factory } from "../../wasm";
import { CompileNodeFn } from "../types";
import { createChildEnvironment } from "../environment";
import { getEnvAddrInstr } from "../assets/modules/env";
import { newTupleInstr } from "../assets/modules/tuple";

export const functionDefinition: CompileNodeFn<"FunctionDefinition"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.useTuple();
  ctx.funcDefStack.enter();
  const parentEnv = ctx.getEnv();
  const funcEnv = createChildEnvironment(node.param, parentEnv);
  ctx.setEnv(funcEnv);
  return next(node.body, ctx)
    .map(functionBodyExpr => {
      // Note
      // Function closure is represented as a tuple: (env_address, function_index_of_table_elements)
      const funcIndex = ctx.funcDefStack.leave(functionBodyExpr);
      return [...getEnvAddrInstr(), factory.numericInstr("i32.const", [factory.int32(funcIndex)]), ...newTupleInstr()];
    })
    .tap(() => ctx.setEnv(parentEnv));
};

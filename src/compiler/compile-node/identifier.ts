import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const identifier: CompileNodeFn<"Identifier"> = (id, ctx) => {
  const index = ctx.getEnv().getIndex(id);
  ctx.pushInstruction(factory.variableInstr("local.get", [factory.identifier("current_env_addr")]));
  ctx.pushInstruction(factory.numericInstr("i32.const", [factory.int32(index)]));
  ctx.pushInstruction(factory.controlInstr("call", [factory.identifier("__env_get__")]));
  return ok(true);
};

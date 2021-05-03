import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { getEnvValueInstr } from "../assets/modules/env";

export const identifier: CompileNodeFn<"Identifier"> = (id, ctx) => {
  const index = ctx.getEnv().getIndex(id);
  ctx.pushInstruction(getEnvValueInstr(index));
  return ok(true);
};

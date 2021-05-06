import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { getEnvValueInstr } from "../assets/modules/env";

export const identifier: CompileNodeFn<"Identifier"> = (id, ctx) => {
  ctx.useEnvironment();
  return ok(getEnvValueInstr(ctx.getEnv().getIndex(id)));
};

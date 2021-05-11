import { CompileNodeFn } from "../types";
import { getEnvValueInstr } from "../assets/modules/env";

export const identifier: CompileNodeFn<"Identifier"> = (id, ctx) => {
  ctx.useEnvironment();
  return ctx
    .getEnv()
    .getIndex(id)
    .map(idx => getEnvValueInstr(idx))
    .error(err => ({
      ...err,
      occurence: id,
    }));
};

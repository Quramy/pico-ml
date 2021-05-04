import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { getEnvValueInstr } from "../assets/modules/env";

export const identifier: CompileNodeFn<"Identifier"> = (id, ctx) => ok(getEnvValueInstr(ctx.getEnv().getIndex(id)));

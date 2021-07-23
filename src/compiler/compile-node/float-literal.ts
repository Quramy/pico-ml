import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { newFloatInstr } from "../assets/modules/float";

export const floatLiteral: CompileNodeFn<"FloatLiteral"> = ({ value }, ctx) => {
  ctx.useFloat();
  return ok(newFloatInstr(value));
};

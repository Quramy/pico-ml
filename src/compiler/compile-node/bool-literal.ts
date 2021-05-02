import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const boolLiteral: CompileNodeFn<"BoolLiteral"> = ({ value }, ctx) => {
  const v = value ? 1 : 0;
  ctx.pushInstruction(factory.numericInstr("i32.const", [factory.int32(v)]));
  return ok(true);
};

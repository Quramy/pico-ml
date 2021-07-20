import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const floatLiteral: CompileNodeFn<"FloatLiteral"> = ({ value }, ctx) => {
  ctx.useFloat();
  return ok([
    factory.float64NumericInstr("f64.const", [factory.float64(value)]),
    factory.controlInstr("call", [factory.identifier("__float_new__")]),
  ]);
};

import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const boolLiteral: CompileNodeFn<"BoolLiteral"> = ({ value }) =>
  ok([factory.numericInstr("i32.const", [factory.int32(value ? 1 : 0)])]);

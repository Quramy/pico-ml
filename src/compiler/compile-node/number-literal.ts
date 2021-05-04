import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";

export const numberLiteral: CompileNodeFn<"NumberLiteral"> = ({ value }) =>
  ok([factory.numericInstr("i32.const", [factory.int32(value)])]);

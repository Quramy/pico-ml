import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { fromNumber2IntBase } from "../js-bindings";

export const intLiteral: CompileNodeFn<"IntLiteral"> = ({ value }) =>
  ok([factory.numericInstr("i32.const", [factory.int32(fromNumber2IntBase(value))])]);

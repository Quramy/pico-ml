import { ok, mapValue } from "../../structure";
import { factory } from "../../wasm";
import { CompileNodeFn } from "../types";

export const ifExpression: CompileNodeFn<"IfExpression"> = (node, ctx, next) =>
  mapValue(
    next(node.cond, ctx),
    next(node.then, ctx),
    next(node.else, ctx),
  )((condInstr, thenInstr, elseInstr) =>
    ok([...condInstr, factory.ifInstr(factory.blockType([factory.valueType("i32")]), thenInstr, elseInstr)]),
  );

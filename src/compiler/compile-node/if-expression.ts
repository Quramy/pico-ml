import { ok, mapValue } from "../../structure";
import { wat } from "../../wasm";
import { CompileNodeFn } from "../types";

export const ifExpression: CompileNodeFn<"IfExpression"> = (node, ctx, next) =>
  mapValue(
    next(node.cond, ctx),
    next(node.then, ctx),
    next(node.else, ctx),
  )((condInstr, thenInstr, elseInstr) =>
    ok(
      wat.instructions`
        ${() => condInstr}
        if (result i32)
          ${() => thenInstr}
        else
          ${() => elseInstr}
        end
      `(),
    ),
  );

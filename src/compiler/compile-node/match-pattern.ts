import { ok, createTreeTraverser, mapValue } from "../../structure";
import { MatchPatternNode } from "../../syntax";
import { wat } from "../../wasm";

import { CompilationContext, CompilationResult } from "../types";
import { getEnvAddrInstr, setEnvAddrInstr } from "../assets/modules/env";
import { getHeadValueInstr, getTailAddrInstr } from "../assets/modules/list";
import {
  isMatchedWildcardPatternInstr,
  isMatchedIdentifierPatternInstr,
  isMatchedEmptyListPatternInstr,
} from "../assets/modules/matcher";

export const matchPattern = createTreeTraverser<MatchPatternNode, CompilationContext, CompilationResult>({
  wildcardPattern: () => {
    return ok(
      wat.instructions`
        ${getEnvAddrInstr}
        local.get $value
        ${isMatchedWildcardPatternInstr}
      `(),
    );
  },
  idPattern: () => {
    return ok(
      wat.instructions`
        ${getEnvAddrInstr}
        local.get $value
        ${isMatchedIdentifierPatternInstr}
      `(),
    );
  },
  emptyListPattern: () => {
    return ok(
      wat.instructions`
        ${getEnvAddrInstr}
        local.get $value
        ${isMatchedEmptyListPatternInstr}
      `(),
    );
  },
  listConsPattern: (node, ctx, next) => {
    return mapValue(
      next(node.head, ctx),
      next(node.tail, ctx),
    )((headInstr, tailInstr) => {
      return ok(
        wat.instructions`
          local.get $value
          if (result i32)
            local.get $value
            local.get $value
            ${getHeadValueInstr}
            local.set $value
            ${() => headInstr}
            ${setEnvAddrInstr}
            ${getTailAddrInstr}
            local.set $value
            ${() => tailInstr}
          else
            i32.const 0
          end
        `(),
      );
    });
  },
});

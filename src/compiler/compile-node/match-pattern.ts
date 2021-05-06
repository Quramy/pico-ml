import { ok, createTreeTraverser, mapValue } from "../../structure";
import { MatchPatternNode } from "../../syntax";
import { factory } from "../../wasm";

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
    return ok([
      ...getEnvAddrInstr(),
      factory.variableInstr("local.get", [factory.identifier("value")]),
      ...isMatchedWildcardPatternInstr(),
    ]);
  },
  idPattern: () => {
    return ok([
      ...getEnvAddrInstr(),
      factory.variableInstr("local.get", [factory.identifier("value")]),
      ...isMatchedIdentifierPatternInstr(),
    ]);
  },
  emptyListPattern: () => {
    return ok([
      ...getEnvAddrInstr(),
      factory.variableInstr("local.get", [factory.identifier("value")]),
      ...isMatchedEmptyListPatternInstr(),
    ]);
  },
  listConsPattern: (node, ctx, next) => {
    return mapValue(
      next(node.head, ctx),
      next(node.tail, ctx),
    )((headInstr, tailInstr) => {
      return ok([
        factory.variableInstr("local.get", [factory.identifier("value")]),
        factory.ifInstr(
          factory.blockType([factory.valueType("i32")]),
          [
            factory.variableInstr("local.get", [factory.identifier("value")]),
            factory.variableInstr("local.get", [factory.identifier("value")]),
            ...getHeadValueInstr(),
            factory.variableInstr("local.set", [factory.identifier("value")]),
            ...headInstr,
            ...setEnvAddrInstr(),
            ...getTailAddrInstr(),
            factory.variableInstr("local.set", [factory.identifier("value")]),
            ...tailInstr,
          ],
          [factory.numericInstr("i32.const", [factory.int32(0)])],
        ),
      ]);
    });
  },
});

import { ok } from "../../structure";
import { Parser, ParseResult, loc, expect, option, vec, tryWith, NullPosition, fromOptional } from "../../parser-util";
import { ModuleNode, IdentifierToken, IdentifierNode, MemoryNode, LimitsNode, Uint32LiteralNode } from "../ast-types";
import { symbolToken, keywordToken, identifierToken, uintToken } from "./tokenizer";

const toIdNode = (maybeId: NullPosition | IdentifierToken): IdentifierNode | null =>
  fromOptional(maybeId)(token => ({
    kind: "Identifier",
    value: token.name,
    loc: token.loc,
  }));

const u32: Parser<Uint32LiteralNode> = expect(uintToken)(token =>
  ok({
    kind: "Uint32Literal",
    value: token.value,
    ...loc(token),
  }),
);

const limits: Parser<LimitsNode> = expect(
  u32,
  option(u32),
)((min, max) =>
  ok({
    kind: "Limits",
    min,
    max: fromOptional(max)(max => max),
    ...loc(min, max),
  }),
);

const mem: Parser<MemoryNode> = expect(
  tryWith(symbolToken("(")),
  keywordToken("memory"),
  option(identifierToken),
  limits,
  symbolToken(")"),
)(
  (tLp, tMemory, tMaybeId, limits, tRp): ParseResult<MemoryNode> =>
    ok({
      kind: "Memory",
      id: toIdNode(tMaybeId),
      limits,
      ...loc(tLp, tMemory, tMaybeId, limits, tRp),
    }),
);

const mod: Parser<ModuleNode> = expect(
  symbolToken("("),
  keywordToken("module"),
  option(identifierToken),
  vec(mem),
  symbolToken(")"),
)(
  (tLp, tModule, maybeId, memValues, tRp): ParseResult<ModuleNode> =>
    ok({
      kind: "Module",
      id: toIdNode(maybeId),
      body: memValues.values,
      ...loc(tLp, tModule, maybeId, memValues, tRp),
    }),
);

export const parseMemory = mem;
export const parseModule = mod;

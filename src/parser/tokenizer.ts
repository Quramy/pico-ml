import { ok, error } from "../structure";
import {
  SymbolKind,
  SymbolToken,
  NumberToken,
  ReservedWords,
  ReservedWordKind,
  KeywordToken,
  VariableToken,
} from "./types";
import type { Scanner } from "./scanner";
import { Parser, ParseResult } from "./combinator";

const reservedWords: ReservedWords = [
  "if",
  "then",
  "else",
  "let",
  "in",
  "fun",
  "rec",
  "true",
  "false",
  "match",
  "with",
] as const;

export const symbolToken: (sym: SymbolKind) => Parser<SymbolToken> = sym => {
  return (scanner: Scanner) => {
    if (!scanner.startsWith(sym)) return error({ confirmed: false, message: `'${sym}' expected.` });
    return ok({
      tokenKind: "Symbol",
      symbol: sym,
      loc: scanner.consume(sym.length),
    }) as ParseResult<SymbolToken>;
  };
};

export const keywordToken: (keyword: ReservedWordKind) => Parser<KeywordToken> = keyword => {
  return scanner => {
    if (!scanner.match(new RegExp(`^${keyword}($|[^a-zA-Z0-9\$_])`)))
      return error({ confirmed: false, message: `'${keyword}' expected.` });
    return ok({
      tokenKind: "Keyword",
      keyword,
      loc: scanner.consume(keyword.length),
    });
  };
};

export const numberToken: Parser<NumberToken> = scanner => {
  const hit = scanner.match(/^(\d+)/);
  if (!hit) return error({ confirmed: false, message: "Number expected." });
  return ok({
    tokenKind: "Number",
    value: parseInt(hit[1], 10),
    loc: scanner.consume(hit[1].length),
  });
};

export const variableToken: Parser<VariableToken> = scanner => {
  const hit = scanner.match(/^([a-zA-Z_][a-zA-Z0-9_']*)/);
  if (!hit) return error({ confirmed: false, message: "Identifier expected." });
  const found = reservedWords.find(w => w === hit[1]);
  if (found) return error({ confirmed: true, message: `'${found}' is not allowed as an identifier name.` });
  return ok({
    tokenKind: "Variable",
    name: hit[1],
    loc: scanner.consume(hit[1].length),
  });
};

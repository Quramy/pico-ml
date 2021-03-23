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
import { Parser } from "./combinator";

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
    if (!scanner.startsWith(sym)) return;
    return {
      tokenKind: "Symbol",
      symbol: sym,
      loc: scanner.consume(sym.length),
    };
  };
};

export const keywordToken: (keyword: ReservedWordKind) => Parser<KeywordToken> = keyword => {
  return scanner => {
    if (!scanner.match(new RegExp(`^${keyword}($|[^a-zA-Z0-9\$_])`))) return;
    return {
      tokenKind: "Keyword",
      keyword,
      loc: scanner.consume(keyword.length),
    };
  };
};

export const numberToken: Parser<NumberToken> = scanner => {
  const hit = scanner.match(/^(\d+)/);
  if (!hit) return;
  return {
    tokenKind: "Number",
    value: parseInt(hit[1], 10),
    loc: scanner.consume(hit[1].length),
  };
};

export const variableToken: Parser<VariableToken> = scanner => {
  const hit = scanner.match(/^([a-zA-Z_][a-zA-Z0-9_']*)/);
  if (!hit) return;
  if (reservedWords.some(w => w === hit[1])) return;
  return {
    tokenKind: "Variable",
    name: hit[1],
    loc: scanner.consume(hit[1].length),
  };
};

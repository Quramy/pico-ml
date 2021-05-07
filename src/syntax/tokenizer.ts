import { ok, error } from "../structure";
import { Parser, ParseResult, Scanner } from "../parser-util";
import {
  SymbolKind,
  SymbolToken,
  IntegerToken,
  ReservedWords,
  ReservedWordKind,
  KeywordToken,
  VariableToken,
} from "./types";

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
    if (!scanner.startsWith(sym))
      return error({
        confirmed: false,
        message: `'${sym}' expected.`,
        occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
      });
    return ok({
      tokenKind: "Symbol",
      symbol: sym,
      loc: scanner.consume(sym.length),
    }) as ParseResult<SymbolToken>;
  };
};

export const keywordToken: (keyword: ReservedWordKind) => Parser<KeywordToken> = keyword => {
  return scanner => {
    if (!scanner.startsWith(keyword) || !scanner.match(/^($|[^a-zA-Z0-9\$_])/, keyword.length))
      return error({
        confirmed: false,
        message: `'${keyword}' expected.`,
        occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
      });
    return ok({
      tokenKind: "Keyword",
      keyword,
      loc: scanner.consume(keyword.length),
    });
  };
};

export const numberToken: Parser<IntegerToken> = scanner => {
  const hit = scanner.match(/^(\d+)/);
  if (!hit)
    return error({
      confirmed: false,
      message: "Number expected.",
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  return ok({
    tokenKind: "Integer",
    value: parseInt(hit[1], 10),
    loc: scanner.consume(hit[1].length),
  });
};

export const variableToken: Parser<VariableToken> = scanner => {
  const hit = scanner.match(/^([a-zA-Z_][a-zA-Z0-9_']*)/);
  if (!hit)
    return error({
      confirmed: false,
      message: "Identifier expected.",
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  const found = reservedWords.find(w => w === hit[1]);
  if (found)
    return error({
      confirmed: true,
      message: `'${found}' is not allowed as an identifier name.`,
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + found.length } },
    });
  return ok({
    tokenKind: "Variable",
    name: hit[1],
    loc: scanner.consume(hit[1].length),
  });
};

import { ok, error } from "../../structure";
import { Parser, ParseResult, Scanner } from "../../parser-util";
import { SymbolKind, SymbolToken, ReservedWordKind, KeywordToken, IdentifierToken, IntToken } from "../ast-types";

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
    if (!scanner.match(new RegExp(`^${keyword}($|[^a-zA-Z0-9\$_])`)))
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

export const identifierToken: Parser<IdentifierToken> = scanner => {
  // const hit = scanner.match(/^($[a-zA-Z0-9\!#\$%&'\*\+\-\.\/:<=>\?@\\\^_`\|\~]+)/);
  const hit = scanner.match(/^(\$[a-zA-Z0-9]+)/);
  if (!hit)
    return error({
      confirmed: false,
      message: "Identifier expected.",
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  return ok({
    tokenKind: "Identifier",
    name: hit[1].slice(1),
    loc: scanner.consume(hit[1].length),
  });
};

const intTokenGen = (signed: boolean): Parser<IntToken> => scanner => {
  const hit = signed ? scanner.match(/^([\+-]?\d+)/) : scanner.match(/(^\d+)/);
  if (!hit)
    return error({
      confirmed: false,
      message: "Integer expected.",
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  return ok({
    tokenKind: "Int",
    value: parseInt(hit[1], 10),
    loc: scanner.consume(hit[1].length),
  });
};

export const intToken = intTokenGen(true);
export const uintToken = intTokenGen(false);

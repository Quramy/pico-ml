import { ok, error } from "../../structure";
import { Parser, ParseResult, Scanner, oneOf } from "../../parser-util";
import {
  SymbolKind,
  SymbolToken,
  ReservedWordKind,
  KeywordToken,
  IdentifierToken,
  IntToken,
  StringToken,
  DecimalToken,
  SyntacticPlaceholderNode,
} from "../ast-types";

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

export const memArgToken: (keyword: "offset=" | "align=") => Parser<KeywordToken> = keyword => {
  return scanner => {
    if (!scanner.startsWith(keyword)) {
      return error({
        confirmed: false,
        message: `'${keyword}' expected.`,
        occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
      });
    }
    return ok({
      tokenKind: "Keyword",
      keyword,
      loc: scanner.consume(keyword.length),
    });
  };
};

export const keywordToken: (keyword: ReservedWordKind) => Parser<KeywordToken> = keyword => {
  return scanner => {
    if (!scanner.startsWith(keyword) || !scanner.match(/^($|[^a-zA-Z0-9\.\$_])/, keyword.length))
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

export const keywordsToken = <T extends ReservedWordKind>(keywords: readonly T[]) =>
  oneOf(...keywords.map(x => keywordToken(x))) as Parser<KeywordToken<T>>;

export const identifierToken: Parser<IdentifierToken> = scanner => {
  const hit = scanner.match(/^(\$[a-zA-Z0-9\!#\$%&'\*\+\-\.\/:<=>\?@\\\^_`\|\~]+)/);
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

const intTokenGen =
  (signed: boolean): Parser<IntToken> =>
  scanner => {
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

export const decimalToken: Parser<DecimalToken> = scanner => {
  const intPart = scanner.match(/^([\+-]?\d+)/);
  if (!intPart)
    return error({
      confirmed: false,
      message: "Decimal number expected.",
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  const fractionHit = scanner.match(/^(\.\d*)/, intPart[1].length);
  const str = intPart[1] + (fractionHit ? fractionHit[1] : "");
  return ok({
    tokenKind: "Decimal",
    value: parseFloat(str),
    loc: scanner.consume(str.length),
  });
};

export const strToken: Parser<StringToken> = scanner => {
  if (!scanner.startsWith('"')) {
    return error({
      confirmed: false,
      message: "String expected.",
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  }
  let offset = 0;
  while (scanner.hasNext(++offset)) {
    if (scanner.startsWith("\\", offset) && scanner.startsWith('"', offset + 1)) {
      offset++;
      continue;
    }
    if (scanner.startsWith('"', offset)) break;
  }
  const value = scanner
    .slice(offset)
    .slice(1)
    .replace("\\\t", "\t")
    .replace("\\\n", "\n")
    .replace("\\\r", "\r")
    .replace('\\"', '"')
    .replace("\\'", "'")
    .replace("\\\\", "\\");
  return ok({
    tokenKind: "String",
    value,
    loc: scanner.consume(offset + 1),
  });
};

export const syntacticPlaceholder: Parser<any> = scanner => {
  const hit = scanner.match(/^%%PLACEHOLDER_(\d+)%%/);
  if (!hit) {
    return error({
      message: "placeholder expected",
      confirmed: false,
      occurence: { loc: { pos: scanner.pos, end: scanner.pos + 1 } },
    });
  }
  const value = parseInt(hit[1], 10);
  return ok({
    kind: "SyntacticPlaceholder",
    index: value,
    loc: scanner.consume(hit[0].length),
  } as SyntacticPlaceholderNode);
};

import { SymbolTokensMap, NumberToken, ReservedWords, KeywordToken, VariableToken } from "./types";
import type { Scanner } from "./scanner";

type SymbolTokenKindMapBase = {
  readonly [P in keyof SymbolTokensMap]: SymbolTokensMap[P]["tokenKind"];
};

const symbolTokenKindMap: SymbolTokenKindMapBase = {
  "(": "LeftParenthesis",
  ")": "RightParenthesis",
  "+": "Plus",
  "-": "Minus",
  "*": "Times",
  "<": "LessThan",
  "=": "Equal",
  "->": "RightArrow",
};

const reservedWords: ReservedWords = ["if", "then", "else", "let", "in", "fun", "rec", "true", "false"];

export const symbolToken = <S extends keyof SymbolTokenKindMapBase, T extends SymbolTokensMap[S]>(sym: S) => {
  return (scanner: Scanner) => {
    if (!scanner.startsWith(sym)) return;
    return ({
      tokenKind: symbolTokenKindMap[sym],
      loc: scanner.consume(sym.length),
    } as unknown) as T;
  };
};

export const keywordToken = (keyword: ReservedWords[number]) => {
  return (scanner: Scanner) => {
    if (!scanner.match(new RegExp(`^${keyword}($|[^a-zA-Z0-9\$_])`))) return;
    return {
      tokenKind: "Keyword",
      keyword,
      loc: scanner.consume(keyword.length),
    } as KeywordToken;
  };
};

export const numberToken = (scanner: Scanner) => {
  const hit = scanner.match(/^(\d+)/);
  if (!hit) return;
  return {
    tokenKind: "Number",
    value: parseInt(hit[1], 10),
    loc: scanner.consume(hit[1].length),
  } as NumberToken;
};

export const variableToken = (scanner: Scanner) => {
  const hit = scanner.match(/^([a-zA-Z_\$][a-zA-Z0-9_\$]*)/);
  if (!hit) return;
  if (reservedWords.some(w => w === hit[1])) return;
  return {
    tokenKind: "Variable",
    name: hit[1],
    loc: scanner.consume(hit[1].length),
  } as VariableToken;
};

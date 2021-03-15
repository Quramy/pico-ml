import { ExpressionNode, Token } from "./types";
import type { Scanner } from "./scanner";

type ParseValue = ExpressionNode | Token;
type ParseResult<T extends ParseValue = ParseValue> = T | undefined;

export interface Parser<T extends ParseValue = ParseValue> {
  (scanner: Scanner): ParseResult<T>;
}

type UnwrapToParseResult<T> = T extends Parser ? ReturnType<T> : never;
type UnwrapToParseValue<T> = T extends Parser<infer S> ? S : never;
type UnwrapToParseResultTuple<T> = { readonly [P in keyof T]: UnwrapToParseValue<T[P]> };

export const use = <T extends ParseValue>(cb: () => Parser<T>) => {
  return (scanner: Scanner) => cb()(scanner) as ParseResult<T>;
};

export const expect = <T extends readonly Parser[]>(...parsers: T) => <R>(
  cb: (...args: [...UnwrapToParseResultTuple<T>, Scanner]) => R,
) => {
  return (scanner: Scanner) => {
    const results: any[] = [];
    for (const parser of parsers) {
      const result = parser(scanner);
      if (!result) return undefined;
      results.push(result);
    }
    return cb(...([...results, scanner] as any));
  };
};

type CompositeParser<U extends readonly Parser[]> = (
  scanner: Scanner,
) => { [P in keyof U]: UnwrapToParseResult<U[P]> }[number];

export const oneOf = <U extends readonly Parser[]>(...parsers: U) => {
  const parser: CompositeParser<U> = (scanner: Scanner) => {
    let result: ParseResult = undefined;
    for (const parser of parsers.slice().reverse()) {
      result = parser(scanner);
      if (result) return result as any;
    }
    return undefined as never;
  };
  return parser;
};

export const leftAssociate = <T extends readonly Parser[]>(...parsers: T) => <L extends ParseValue>(
  cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => L,
) => {
  return (first: L, scanner: Scanner) => {
    const inner = (node: L): L => {
      const results: ParseValue[] = [];
      for (const parser of parsers) {
        const r = parser(scanner);
        if (!r) return node;
        results.push(r);
      }
      return inner(cb(node, ...(results as any)));
    };
    return inner(first);
  };
};

export const rightAssociate = <T extends readonly Parser[]>(...parsers: T) => <L extends ParseValue>(
  cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => L,
) => {
  return (first: L, scanner: Scanner) => {
    const inner = (node: L): L => {
      const results: any[] = [];
      for (const parser of parsers) {
        const r = parser(scanner);
        if (!r) return node;
        results.push(r);
      }
      const mid = results.slice(0, results.length - 1);
      const last = results[results.length - 1];
      return cb(node, ...([...mid, inner(last)] as any));
    };
    return inner(first);
  };
};
